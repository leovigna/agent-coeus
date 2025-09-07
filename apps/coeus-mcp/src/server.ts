import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express from "express";

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

const server = new McpServer({
    name: "coeus-mcp",
    version: "1.0.0",
});

// TODO: Throwing errors?
// TODO: Add models for episodes/memory etc..
// TODO: Connect Zep.js
// TODO: Add status resource for underlying zep.js connection

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
