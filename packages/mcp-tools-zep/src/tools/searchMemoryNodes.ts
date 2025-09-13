import type { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

const inputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub."),
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
 * @param {string[]} [group_ids] - Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub.
 * @param {number} [max_nodes=10] - Maximum number of nodes to return.
 * @param {string} [center_node_uuid] - Optional UUID of a node to center the search around.
 * @param {string} [entity=""] - Optional single entity type to filter results (permitted: "Preference", "Procedure").
 */
function getCallback(provider: ZepClientProvider): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        // Get Zep Client
        const zepClient = await resolveZepClient(provider, authInfo as unknown as AuthInfo); // forced casting here due to extending type

        const { subject } = authInfo! as AuthInfo;
        // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
        const group_id = subject!;
        const { query, max_nodes, center_node_uuid, entity } = params;

        const results = await zepClient.graph.search({
            query,
            graphId: group_id,
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
}

export function getSearchMemoryNodesTool(provider: ZepClientProvider) {
    return {
        name: "search_memory_nodes",
        config: {
            title: "Search Memory Nodes",
            description: "Search the graph memory for relevant node summaries.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
