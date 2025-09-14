import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

export const searchMemoryFactsInputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub."),
    max_facts: z.number().default(10).describe("Maximum number of facts to return"),
    center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
};

/**
 * Searches the graph memory for relevant facts (edges).
 *
 * @param {string} query - The search query.
 * @param {string[]} [group_ids] - Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub.
 * @param {number} [max_facts=10] - Maximum number of facts to return.
 * @param {string} [center_node_uuid] - Optional UUID of a node to center the search around.
 *
 * @example
 * ```typescript
 * await searchMemoryFacts(provider, { query: "what is acme corp" }, { authInfo });
 * ```
 */
export async function searchMemoryFacts(provider: ZepClientProvider, params: z.objectOutputType<typeof searchMemoryFactsInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<Zep.GraphSearchResults> {
    const zepClient = await resolveZepClient(provider, authInfo);

    const { subject } = authInfo;
    const group_id = params.group_ids?.[0] ?? subject!; // simplified to use first group_id or subject
    const { query, max_facts, center_node_uuid } = params;

    const results = await zepClient.graph.search({
        query,
        graphId: group_id,
        limit: max_facts,
        centerNodeUuid: center_node_uuid,
        scope: "edges",
    });

    return results;
}

export const searchMemoryFactsMetadata = {
    name: "search_memory_facts",
    config: {
        title: "Search Memory Facts",
        description: "Searches the graph memory for relevant facts (edges).",
        inputSchema: searchMemoryFactsInputSchema,
    },
} as const satisfies ToolMetadata<typeof searchMemoryFactsInputSchema, ZodRawShape>;
