import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Application, Request, Response } from "express";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fetchServerConfig, MCPAuth } from "mcp-auth";
import * as swaggerUi from "swagger-ui-express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { OIDC_BASE_URL, OIDC_CLIENT_ID } from "./envvars.js";
import { openApiDocument } from "./openapi.js";
import { createContext } from "./trpc.js";
import { appRouter } from "./trpcAppRouter.js";
import {
    createWebhooksContext,
    webhooksAppRouter,
    webhooksOpenApiDocument,
} from "./trpcWebhooks.js";

if (!OIDC_CLIENT_ID) {
    throw new Error("OIDC_CLIENT_ID is not set");
}

if (!OIDC_BASE_URL) {
    throw new Error("OIDC_BASE_URL is not set");
}

const OIDC_ORIGIN = new URL(OIDC_BASE_URL).origin;
const OIDC_ISSUER_URL = new URL("oidc", OIDC_BASE_URL);
// const OIDC_AUTHORIZATION_URL = new URL("oidc/auth", OIDC_BASE_URL);
const OIDC_TOKEN_URL = new URL("oidc/token", OIDC_BASE_URL);
// const OIDC_REVOCATION_URL = join(OIDC_BASE_URL, "oidc/revoke");

export async function getExpressApp({
    mcpServer,
    mcpTransport,
}: {
    mcpServer: McpServer;
    mcpTransport: StreamableHTTPServerTransport;
}): Promise<Application> {
    // Express App
    const app = express();

    // CORS Middleware
    app.use(cors({ origin: "*" }));

    // OIDC Proxy Endpoint (for ChatGPT Actions)
    app.get("/oidc/auth", (req, res) => {
        const target = new URL(req.originalUrl, OIDC_ORIGIN);
        res.redirect(302, target.toString());
    });
    app.use(
        "/oidc/token",
        createProxyMiddleware({
            target: OIDC_TOKEN_URL.toString(),
            changeOrigin: true,
            xfwd: true,
        }),
    );
    // OIDC metadata endpoints
    const oidcConfig = await fetchServerConfig(OIDC_ISSUER_URL.toString(), {
        type: "oidc",
    });
    const mcpAuth = new MCPAuth({
        server: oidcConfig,
    });
    app.use(mcpAuth.delegatedRouter()); // .well-known/oauth-authorization-server (OAuth 2.0 Metadata Endpoint)

    // MCP JSON-RPC endpoint
    await mcpServer.connect(mcpTransport); // TODO: Can this be done later? this could make the getExpressApp function sync
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.use("/mcp", mcpAuth.bearerAuth("jwt"));
    app.post("/mcp", async (req, res) => {
        await mcpTransport.handleRequest(req, res, req.body);
    });

    // API endpoints
    const apiRouter = express.Router();
    apiRouter.use(
        "/ui",
        swaggerUi.serveFiles(openApiDocument),
        swaggerUi.setup(openApiDocument),
    );
    apiRouter.get("/openapi.json", (_: Request, res: Response) => {
        res.json(openApiDocument);
    });
    apiRouter.use(mcpAuth.bearerAuth("jwt"));
    apiRouter.use(
        createOpenApiExpressMiddleware({ router: appRouter, createContext }),
    );
    app.use("/api", apiRouter);

    // Webhook endpoints
    const webhooksRouter = express.Router();
    webhooksRouter.use(
        "/ui",
        swaggerUi.serveFiles(webhooksOpenApiDocument),
        swaggerUi.setup(webhooksOpenApiDocument),
    );
    webhooksRouter.get("/openapi.json", (_: Request, res: Response) => {
        res.json(webhooksOpenApiDocument);
    });
    webhooksRouter.use(
        express.raw({ type: "application/json", limit: "2mb" }),
        (req, res, next) => {
            if (req.body) {
                const rawBody = Buffer.from(req.body);
                // @ts-expect-error capture raw body
                req.rawBody = rawBody;
                // Safe to parse JSON for downstream (tRPC OpenAPI expects an object here)
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    req.body = JSON.parse(rawBody.toString("utf8"));
                } catch {
                    return res.status(400).send("invalid json");
                }
            }
            next();
        },
    );
    webhooksRouter.use(
        createOpenApiExpressMiddleware({
            router: webhooksAppRouter,
            createContext: createWebhooksContext,
        }),
    );
    app.use("/webhooks", webhooksRouter);

    // Root endpoint
    app.get("/", (_: Request, res: Response) => {
        res.redirect("/api/ui");
    });

    return app;
}
