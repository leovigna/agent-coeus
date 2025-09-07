import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    group_id: z.string().describe("ID of the group to clear"),
};

const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { group_id } = params;
    const result = await zepClient.graph.delete(group_id);
    return {
        outputs: [
            {
                json: result,
            },
        ],
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    };
};

export const clearGraphTool = {
    name: "clear_graph",
    config: {
        title: "Clear Graph",
        description: "Clear all data from the graph memory and rebuild indices.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
