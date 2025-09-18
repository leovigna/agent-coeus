import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const searchMemoryNodesInputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z
        .array(z.string())
        .optional()
        .describe(
            "Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub.",
        ),
    max_nodes: z
        .number()
        .default(10)
        .describe("Maximum number of nodes to return"),
    center_node_uuid: z
        .string()
        .optional()
        .describe("Optional UUID of a node to center the search around"),
    entity: z
        .string()
        .optional()
        .describe("Optional single entity type to filter results"),
};

/**
 * Searches the graph memory for relevant node summaries.
 *
 * @param {string} query - The search query.
 * @param {string[]} [group_ids] - Optional list of group IDs to filter results. If not provided, uses the default group_id from auth sub.
 * @param {number} [max_nodes=10] - Maximum number of nodes to return.
 * @param {string} [center_node_uuid] - Optional UUID of a node to center the search around.
 * @param {string} [entity] - Optional single entity type to filter results.
 *
 * @example
 * ```typescript
 * await searchMemoryNodes(provider, { query: "customer preferences" }, { authInfo });
 * ```
 */
export async function searchMemoryNodes(
    provider: ZepClientProvider,
    params: z.objectOutputType<typeof searchMemoryNodesInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.GraphSearchResults> {
    const zepClient = await resolveZepClient(provider, authInfo);

    const { subject } = authInfo;
    const group_id = params.group_ids?.[0] ?? subject!;
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

    return results;
}

export const searchMemoryNodesToolMetadata = {
    name: "zep_search_memory_nodes",
    config: {
        title: "Search Memory Nodes",
        description: "Searches the graph memory for relevant node summaries.",
        inputSchema: searchMemoryNodesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof searchMemoryNodesInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getSearchMemoryNodesTool(provider: ZepClientProvider) {
    return {
        ...searchMemoryNodesToolMetadata,
        name: searchMemoryNodesToolMetadata.name,
        cb: partial(toCallToolResultFn(searchMemoryNodes), provider),
    } as const satisfies Tool<typeof searchMemoryNodesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const searchMemoryNodesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: `/${searchMemoryNodesToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: searchMemoryNodesToolMetadata.config.title,
        description: searchMemoryNodesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createSearchMemoryNodesProcedure = toProcedurePluginFn(
    searchMemoryNodesInputSchema,
    searchMemoryNodes,
    searchMemoryNodesProcedureMetadata,
);
