import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape } from "zod";
import { z } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const clearGraphInputSchema = {
    group_id: z
        .string()
        .optional()
        .describe(
            "A unique ID for this graph. If not provided, uses the default group_id from auth sub.",
        ),
};

/**
 * Clears all data from a specific graph.
 *
 * @param {string} [group_id] - A unique ID for this graph. If not provided, uses the default group_id from auth sub.
 *
 * This function deletes all episodes, entities, and relationships associated with the specified graph.
 * This operation is irreversible.
 *
 * @example
 * ```typescript
 * await clearGraph(provider, { group_id: "some_arbitrary_string" }, { authInfo });
 * ```
 */
export async function clearGraph(
    provider: ZepClientProvider,
    params: z.objectOutputType<typeof clearGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const zepClient = await resolveZepClient(provider, authInfo);

    const { subject } = authInfo;
    const group_id = params.group_id ?? subject!;

    await zepClient.graph.delete(group_id);

    return {
        success: true,
        message: `Graph ${group_id} cleared successfully.`,
    };
}

export const clearGraphToolMetadata = {
    name: "zep_clear_graph",
    config: {
        title: "Clear Graph",
        description:
            "Clears all data from a specific graph. This operation is irreversible.",
        inputSchema: clearGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof clearGraphInputSchema, ZodRawShape>;

// MCP Tool
export function getClearGraphTool(provider: ZepClientProvider) {
    return {
        ...clearGraphToolMetadata,
        name: clearGraphToolMetadata.name,
        cb: partial(toCallToolResultFn(clearGraph), provider),
    } as const satisfies Tool<typeof clearGraphInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const clearGraphProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${clearGraphToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: clearGraphToolMetadata.config.title,
        description: clearGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createClearGraphProcedure = toProcedurePluginFn(
    clearGraphInputSchema,
    clearGraph,
    clearGraphProcedureMetadata,
);
