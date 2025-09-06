/* eslint-disable @typescript-eslint/require-await */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { z } from "zod";

const server = new McpServer({
    name: "demo-server",
    version: "1.0.0",
});

// TODO: Throwing errors?
// TODO: Add models for episodes/memory etc..
// TODO: Connect Zep.js
// TODO: Add status resource for underlying zep.js connection

// OpenAI Required Tools
server.registerTool("search", {
    title: "Search",
    inputSchema: {
        query: z.string().describe("Search query string. Natural language queries work best for semantic search."),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("fetch", {
    title: "Fetch",
    inputSchema: {
        id: z.string().describe("File ID from vector store (file-xxx) or local document ID"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

// Zep Tools
server.registerTool("add_memory", {
    title: "Add Memory",
    description: "Add an episode to memory. This is the primary way to add information to the graph.",
    inputSchema: {
        name: z.string().describe("Name of the episode"),
        episode_body: z.string().describe("The content of the episode to persist to memory."),
        group_id: z.string().optional().describe("A unique ID for this graph."),
        source: z.enum(["text", "json", "message"]).default("text").describe("Source type"),
        source_description: z.string().default("").describe("Description of the source"),
        uuid: z.string().optional().describe("Optional UUID for the episode"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("search_memory_nodes", {
    title: "Search Memory Nodes",
    description: "Search the graph memory for relevant node summaries.",
    inputSchema: {
        query: z.string().describe("The search query"),
        group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results"),
        max_nodes: z.number().default(10).describe("Maximum number of nodes to return"),
        center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
        entity: z.string().default("").describe("Optional single entity type to filter results"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("search_memory_facts", {
    title: "Search Memory Facts",
    description: "Search the graph memory for relevant facts.",
    inputSchema: {
        query: z.string().describe("The search query"),
        group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results"),
        max_facts: z.number().default(10).describe("Maximum number of facts to return"),
        center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("delete_entity_edge", {
    title: "Delete Entity Edge",
    description: "Delete an entity edge from the graph memory.",
    inputSchema: {
        uuid: z.string().describe("UUID of the entity edge to delete"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("delete_episode", {
    title: "Delete Episode",
    description: "Delete an episode from the graph memory.",
    inputSchema: {
        uuid: z.string().describe("UUID of the episode to delete"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("get_entity_edge", {
    title: "Get Entity Edge",
    description: "Get an entity edge from the graph memory by its UUID.",
    inputSchema: {
        uuid: z.string().describe("UUID of the entity edge to retrieve"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("get_episodes", {
    title: "Get Episodes",
    description: "Get the most recent memory episodes for a specific group.",
    inputSchema: {
        group_id: z.string().optional().describe("ID of the group to retrieve episodes from"),
        last_n: z.number().default(10).describe("Number of most recent episodes to retrieve"),
    },
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

server.registerTool("clear_graph", {
    title: "Clear Graph",
    description: "Clear all data from the graph memory and rebuild indices.",
    inputSchema: {},
}, async (): Promise<CallToolResult> => {
    throw new Error("Not implemented");
});

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
