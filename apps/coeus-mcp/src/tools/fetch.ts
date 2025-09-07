import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { Tool } from "./Tool.js";

const inputSchema = {
    id: z.string().describe("File ID from vector store (file-xxx) or local document ID"),
};

const cb: ToolCallback<typeof inputSchema> = async () => {
    throw new Error("Not implemented");
};

export const fetchTool = {
    name: "fetch",
    config: {
        title: "Fetch",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
