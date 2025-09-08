import { readFileSync } from "fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express from "express";
import { fetchServerConfig, MCPAuth } from "mcp-auth";
import morgan from "morgan";

import { LOGTO_APP_ID, LOGTO_ISSUER_URL } from "./envvars.js";
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

const mcpAuth = new MCPAuth({
    server: await fetchServerConfig(LOGTO_ISSUER_URL, { type: "oidc" }),
});

const verifyToken = async (token: string) => {
    const { userinfoEndpoint, issuer } = mcpAuth.config.server.metadata;
    const response = await fetch(userinfoEndpoint!, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Token verification failed");

    const userInfo = await response.json() as {
        sub: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    return {
        token,
        issuer,
        subject: userInfo.sub,
        claims: userInfo,
    };
};

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

const app = express();
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(morgan("combined"));
// app.use(mcpAuth.delegatedRouter());
// app.use(mcpAuth.bearerAuth(verifyToken));

app.use(cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"],
}));

app.post("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
