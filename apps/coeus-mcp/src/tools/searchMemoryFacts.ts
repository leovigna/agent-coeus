import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { AuthInfo } from "./AuthInfo.js";
import { Tool } from "./Tool.js";

const inputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub."),
    max_facts: z.number().default(10).describe("Maximum number of facts to return"),
    center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
};

/**
 * Search the graph memory for relevant facts.
 *
 * @param {string} query - The search query.
 * @param {string[]} [group_ids] - Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub.
 * @param {number} [max_facts=10] - Maximum number of facts to return.
 * @param {string} [center_node_uuid] - Optional UUID of a node to center the search around.
 */
const cb: ToolCallback<typeof inputSchema> = async (params, { authInfo }) => {
    const { subject } = authInfo! as AuthInfo;
    // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
    const group_id = subject!;
    const { query, max_facts, center_node_uuid } = params;

    const results = await zepClient.graph.search({
        query,
        graphId: group_id,
        limit: max_facts,
        centerNodeUuid: center_node_uuid,
        scope: "edges",
    });
    return {
        outputs: [
            {
                json: results,
            },
        ],
        content: [
            {
                type: "text",
                text: JSON.stringify(results),
            },
        ],
    };
};

export const searchMemoryFactsTool = {
    name: "search_memory_facts",
    config: {
        title: "Search Memory Facts",
        description: "Search the graph memory for relevant facts.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
