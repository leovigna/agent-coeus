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
import { appRouter } from "./trpcAppRouter.js";
import { createContext } from "./trpc.js";

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
    // Connect transport
    // TODO: Can this be done later? this could make the getExpressApp function sync
    await mcpServer.connect(mcpTransport);

    // Express App
    const app = express();
    // OAuth Proxy Endpoint (for ChatGPT Actions)
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

    // CORS Middleware
    app.use(cors({ origin: "*" }));
    // Fetch OIDC config
    const oidcConfig = await fetchServerConfig(OIDC_ISSUER_URL.toString(), {
        type: "oidc",
    });
    // const { jwksUri, issuer } = oidcConfig.metadata;
    // MCP Auth Middleware
    const mcpAuth = new MCPAuth({
        server: oidcConfig,
    });
    // Delegated Authorization Server
    app.use(mcpAuth.delegatedRouter()); // .well-known/oauth-authorization-server (OAuth 2.0 Metadata Endpoint)

    // JWT Token verification
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.use("/api", mcpAuth.bearerAuth("jwt"));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.use("/mcp", mcpAuth.bearerAuth("jwt"));

    // Parse JSON
    app.use(express.json());
    // Protected endpoints
    // OpenAPI Middleware
    app.use(
        "/api",
        createOpenApiExpressMiddleware({ router: appRouter, createContext }),
    );
    // MCP JSON-RPC Endpoint
    app.post("/mcp", async (req, res) => {
        await mcpTransport.handleRequest(req, res, req.body);
    });

    // Public endpoints
    // OpenAPI spec
    app.get("/openapi.json", (_: Request, res: Response) => {
        res.json(openApiDocument);
    });
    // OpenAPI docs
    // Serve Swagger UI with our OpenAPI schema
    app.use("/", swaggerUi.serve);
    app.get("/", swaggerUi.setup(openApiDocument));

    return app;
}
