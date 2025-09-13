import { readFileSync } from "fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fetchServerConfig, MCPAuth } from "mcp-auth";
import * as swaggerUi from "swagger-ui-express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { OIDC_BASE_URL, OIDC_CLIENT_ID } from "./envvars.js";
import { openApiDocument } from "./openapi.js";
import { appRouter } from "./procedures/index.js";
import {
    addMemoryTool,
    clearGraphTool,
    createOrganizationTool,
    deleteEntityEdgeTool,
    deleteEpisodeTool,
    getEntityEdgeTool,
    getEpisodesTool,
    listOrganizationsTool,
    searchMemoryFactsTool,
    searchMemoryNodesTool,
    whoAmITool,
} from "./tools/index.js";
import { createContext } from "./trpc.js";

const instructions = readFileSync("./MCP_INSTRUCTIONS.md", "utf-8");

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

export function getMcpServer() {
    const server = new McpServer({
        name: "coeus-mcp",
        version: "1.0.0",
    }, { instructions });

    // TODO: Throwing errors?
    // TODO: Add models for episodes/memory etc..
    // TODO: Connect Zep.js
    // TODO: Add status resource for underlying zep.js connection

    // OpenAI Deep Research Tools
    // TODO: Implement these later
    // server.registerTool(searchTool.name, searchTool.config, searchTool.cb);
    // server.registerTool(fetchTool.name, fetchTool.config, fetchTool.cb);

    // Logto Tools
    server.registerTool(createOrganizationTool.name, createOrganizationTool.config, createOrganizationTool.cb);
    server.registerTool(listOrganizationsTool.name, listOrganizationsTool.config, listOrganizationsTool.cb);
    server.registerTool(whoAmITool.name, whoAmITool.config, whoAmITool.cb);
    // Zep Tools
    server.registerTool(addMemoryTool.name, addMemoryTool.config, addMemoryTool.cb);
    server.registerTool(searchMemoryNodesTool.name, searchMemoryNodesTool.config, searchMemoryNodesTool.cb);
    server.registerTool(searchMemoryFactsTool.name, searchMemoryFactsTool.config, searchMemoryFactsTool.cb);
    server.registerTool(deleteEntityEdgeTool.name, deleteEntityEdgeTool.config, deleteEntityEdgeTool.cb);
    server.registerTool(deleteEpisodeTool.name, deleteEpisodeTool.config, deleteEpisodeTool.cb);
    server.registerTool(getEntityEdgeTool.name, getEntityEdgeTool.config, getEntityEdgeTool.cb);
    server.registerTool(getEpisodesTool.name, getEpisodesTool.config, getEpisodesTool.cb);
    server.registerTool(clearGraphTool.name, clearGraphTool.config, clearGraphTool.cb);
    return server;
}

/**
 * Verify JWT token
 * @param params clientId, jwksUri, issuer
 * @returns (token) => Promise<AuthInfo>
 */
/*
export function getVerifyJwtToken({ clientId, jwksUri, issuer }: { clientId: string; jwksUri: string; issuer: string }): (token: string) => Promise<AuthInfo> {
    const jwks = createRemoteJWKSet(new URL(jwksUri));

    return async function (token: string): Promise<AuthInfo> {
        console.debug({ token, jwksUri, issuer });
        const { payload } = await jwtVerify(token, jwks, {
            issuer: issuer,
        });
        const scopes = (payload.scope as string)?.split(" ") ?? [];

        return {
            token,
            issuer,
            clientId,
            scopes,
            expiresAt: payload.exp,
            subject: payload.sub,
            audience: payload.aud,
        };

        // MCPAuth Error causes issues with mcp inspector
        // throw new MCPAuthTokenVerificationError("token_verification_failed");
    };
}
*/

/**
 * Verify opaque access token by calling the userinfo endpoint
 * @param params clientId, userInfoEndpoint, issuer
 * @returns (token) => Promise<AuthInfo>
 */
/*
export function getVerifyAccessToken({ clientId, userInfoEndpoint, issuer }: { clientId: string; userInfoEndpoint: string; issuer: string }): (token: string) => Promise<AuthInfo> {
    return async function (token: string): Promise<AuthInfo> {
        const response = await fetch(userInfoEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Token verification failed");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const userInfo = await response.json();

        return {
            token,
            issuer,
            clientId,
            scopes: [],
            expiresAt: 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            subject: userInfo.sub,
            audience: "",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            claims: userInfo,
        };
    };
}
*/

export async function getExpressApp({ mcpServer, mcpTransport }: { mcpServer: McpServer; mcpTransport: StreamableHTTPServerTransport }): Promise<Application> {
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
    const oidcConfig = await fetchServerConfig(OIDC_ISSUER_URL.toString(), { type: "oidc" });
    // const { jwksUri, issuer } = oidcConfig.metadata;
    // MCP Auth Middleware
    const mcpAuth = new MCPAuth({
        server: oidcConfig,
    });
    // Delegated Authorization Server
    app.use(mcpAuth.delegatedRouter()); // .well-known/oauth-authorization-server (OAuth 2.0 Metadata Endpoint)

    // Bearer Access Token verification
    // const verifyAccessToken = getVerifyAccessToken({ clientId: OIDC_CLIENT_ID!, userInfoEndpoint: userinfoEndpoint!, issuer });
    // app.use("/auth", mcpAuth.bearerAuth(verifyAccessToken));

    // JWT Token verification

    // https://mcp-auth.dev/docs/0.1.1/configure-server/bearer-auth#configure-bearer-auth-with-custom-verification
    // const verifyJwtToken = getVerifyJwtToken({ clientId: OIDC_CLIENT_ID!, jwksUri: jwksUri!, issuer });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.use("/auth", mcpAuth.bearerAuth("jwt"));

    // https://mcp-auth.dev/docs/0.1.1/configure-server/bearer-auth#configure-bearer-auth-with-jwt-mode
    // app.use("/auth", mcpAuth.bearerAuth("jwt")); // Built-in JWT verification

    // Parse JSON
    app.use(express.json());
    // Protected endpoints
    // OpenAPI Middleware
    app.use("/auth/api", createOpenApiExpressMiddleware({ router: appRouter, createContext }));
    // MCP JSON-RPC Endpoint
    app.post("/auth/mcp", async (req, res) => {
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
