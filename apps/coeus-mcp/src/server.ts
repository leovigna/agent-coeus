/* eslint-disable @typescript-eslint/require-await */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
export const server = new McpServer({
    name: "demo-server",
    version: "1.0.0",
});

// TODO: Throwing errors?
// TODO: Add models for episodes/memory etc..
// TODO: Connect Zep.js
// TODO: Add status resource for underlying zep.js connection

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
}, async () => {
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
}, async () => {
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
}, async () => {
    throw new Error("Not implemented");
});

server.registerTool("delete_entity_edge", {
    title: "Delete Entity Edge",
    description: "Delete an entity edge from the graph memory.",
    inputSchema: {
        uuid: z.string().describe("UUID of the entity edge to delete"),
    },
}, async () => {
    throw new Error("Not implemented");
});

server.registerTool("delete_episode", {
    title: "Delete Episode",
    description: "Delete an episode from the graph memory.",
    inputSchema: {
        uuid: z.string().describe("UUID of the episode to delete"),
    },
}, async () => {
    throw new Error("Not implemented");
});

server.registerTool("get_entity_edge", {
    title: "Get Entity Edge",
    description: "Get an entity edge from the graph memory by its UUID.",
    inputSchema: {
        uuid: z.string().describe("UUID of the entity edge to retrieve"),
    },
}, async () => {
    throw new Error("Not implemented");
});

server.registerTool("get_episodes", {
    title: "Get Episodes",
    description: "Get the most recent memory episodes for a specific group.",
    inputSchema: {
        group_id: z.string().optional().describe("ID of the group to retrieve episodes from"),
        last_n: z.number().default(10).describe("Number of most recent episodes to retrieve"),
    },
}, async () => {
    throw new Error("Not implemented");
});

server.registerTool("clear_graph", {
    title: "Clear Graph",
    description: "Clear all data from the graph memory and rebuild indices.",
    inputSchema: {},
}, async () => {
    throw new Error("Not implemented");
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
