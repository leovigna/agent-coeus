import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { Tool } from "./Tool.js";

const inputSchema = {
    query: z.string().describe("Search query string. Natural language queries work best for semantic search."),
};

const cb: ToolCallback<typeof inputSchema> = async () => {
    throw new Error("Not implemented");
};

export const searchTool = {
    name: "search",
    config: {
        title: "Search",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
