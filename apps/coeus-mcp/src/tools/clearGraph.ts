import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { AuthInfo } from "./AuthInfo.js";
import { Tool } from "./Tool.js";

const inputSchema = {
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
};

/**
 * Clear all data from the graph memory and rebuild indices.
 *
 * @param {string} group_id - ID of the group to clear.
 */
const cb: ToolCallback<typeof inputSchema> = async (_, { authInfo }) => {
    const { subject } = authInfo! as AuthInfo;
    // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
    const group_id = subject!;
    // const { group_id } = params;

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
