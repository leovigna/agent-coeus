import { readFileSync } from "fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express, { Request, Response } from "express";
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
    deleteEntityEdgeTool,
    deleteEpisodeTool,
    fetchTool,
    getEntityEdgeTool,
    getEpisodesTool,
    searchMemoryFactsTool,
    searchMemoryNodesTool,
    searchTool,
} from "./tools/index.js";
import { createContext } from "./trpc.js";

const instructions = readFileSync("./COEUS_MCP.md", "utf-8");

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

const server = new McpServer({
    name: "coeus-mcp",
    version: "1.0.0",
}, { instructions });

// TODO: Throwing errors?
// TODO: Add models for episodes/memory etc..
// TODO: Connect Zep.js
// TODO: Add status resource for underlying zep.js connection

// Auth Tools
server.tool("whoami", ({ authInfo }) => ({
    content: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        { type: "text", text: JSON.stringify((authInfo as any)?.claims ?? { error: "Not authenticated" }) },
    ],
}));

// OpenAI Required Tools
server.registerTool(searchTool.name, searchTool.config, searchTool.cb);
server.registerTool(fetchTool.name, fetchTool.config, fetchTool.cb);

// Zep Tools
server.registerTool(addMemoryTool.name, addMemoryTool.config, addMemoryTool.cb);
server.registerTool(searchMemoryNodesTool.name, searchMemoryNodesTool.config, searchMemoryNodesTool.cb);
server.registerTool(searchMemoryFactsTool.name, searchMemoryFactsTool.config, searchMemoryFactsTool.cb);
server.registerTool(deleteEntityEdgeTool.name, deleteEntityEdgeTool.config, deleteEntityEdgeTool.cb);
server.registerTool(deleteEpisodeTool.name, deleteEpisodeTool.config, deleteEpisodeTool.cb);
server.registerTool(getEntityEdgeTool.name, getEntityEdgeTool.config, getEntityEdgeTool.cb);
server.registerTool(getEpisodesTool.name, getEpisodesTool.config, getEpisodesTool.cb);
server.registerTool(clearGraphTool.name, clearGraphTool.config, clearGraphTool.cb);

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
});

await server.connect(transport);

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
// MCP Auth Middleware
const mcpAuth = new MCPAuth({
    server: await fetchServerConfig(OIDC_ISSUER_URL.toString(), { type: "oidc" }),
});
// Delegated Authorization Server
app.use(mcpAuth.delegatedRouter()); // .well-known/oauth-authorization-server (OAuth 2.0 Metadata Endpoint)
// Bearer Auth Handler
const verifyToken = async (token: string) => {
    const { userinfoEndpoint, issuer } = mcpAuth.config.server.metadata;
    const response = await fetch(userinfoEndpoint!, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Token verification failed");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userInfo = await response.json();
    return {
        token,
        issuer,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        subject: userInfo.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        claims: userInfo,
    };
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use("/auth", mcpAuth.bearerAuth(verifyToken));

// Parse JSON
app.use(express.json());
// Protected endpoints
// OpenAPI Middleware
app.use("/auth/api", createOpenApiExpressMiddleware({ router: appRouter, createContext }));
// MCP JSON-RPC Endpoint
app.post("/auth/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
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

// Start server
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
