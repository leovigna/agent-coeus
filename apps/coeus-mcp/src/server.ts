import { readFileSync } from "fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express, { Request, Response } from "express";
import * as swaggerUi from "swagger-ui-express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { LOGTO_APP_ID, LOGTO_ISSUER_URL } from "./envvars.js";
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

const instructions = readFileSync("./COEUS_MCP.md", "utf-8");

if (!LOGTO_APP_ID) {
    throw new Error("LOGTO_APP_ID is not set");
}

if (!LOGTO_ISSUER_URL) {
    throw new Error("LOGTO_ISSUER_URL is not set");
}

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
// CORS Middleware
app.use(cors({ origin: "*" }));
// Parse JSON
app.use(express.json());
// MCP Auth Middleware
// app.use(mcpAuth.delegatedRouter());
// app.use(mcpAuth.bearerAuth(verifyToken));

// OpenAPI Middleware
app.use("/api", createOpenApiExpressMiddleware({ router: appRouter }));
// OpenAPI spec
app.get("/openapi.json", (_: Request, res: Response) => {
    res.json(openApiDocument);
});
// OpenAPI docs
// Serve Swagger UI with our OpenAPI schema
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(openApiDocument));

// MCP JSON-RPC Endpoint
app.post("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
});

// Start server
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
