import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results"),
    max_nodes: z.number().default(10).describe("Maximum number of nodes to return"),
    center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
    entity: z.string().default("").describe("Optional single entity type to filter results"),
};

/**
 * Search the graph memory for relevant node summaries.
 * These contain a summary of all of a node's relationships with other nodes.
 *
 * Note: entity is a single entity type to filter results (permitted: "Preference", "Procedure").
 *
 * @param {string} query - The search query.
 * @param {string[]} [group_ids] - Optional list of group IDs to filter results.
 * @param {number} [max_nodes=10] - Maximum number of nodes to return.
 * @param {string} [center_node_uuid] - Optional UUID of a node to center the search around.
 * @param {string} [entity=""] - Optional single entity type to filter results (permitted: "Preference", "Procedure").
 */
const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { query, group_ids, max_nodes, center_node_uuid, entity } = params;
    const results = await zepClient.graph.search({
        query,
        graphId: group_ids?.[0],
        limit: max_nodes,
        centerNodeUuid: center_node_uuid,
        searchFilters: {
            nodeLabels: entity ? [entity] : undefined,
        },
        scope: "nodes",
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

export const searchMemoryNodesTool = {
    name: "search_memory_nodes",
    config: {
        title: "Search Memory Nodes",
        description: "Search the graph memory for relevant node summaries.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
