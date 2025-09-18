import { AuthInfo, toCallToolResultFn, Tool, ToolMetadata, toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { resolveZepClient, ZepClientProvider } from "../../ZepClientProvider.js";

export const deleteEntityEdgeInputSchema = {
    uuid: z.string().describe("UUID of the entity edge to delete"),
};

/**
 * Deletes a specific edge between entities in the graph.
 *
 * @param {string} uuid - The UUID of the edge to delete.
 *
 * This operation is irreversible.
 *
 * @example
 * ```typescript
 * await deleteEntityEdge(provider, { uuid: "some-uuid-string" }, { authInfo });
 * ```
 */
export async function deleteEntityEdge(provider: ZepClientProvider, params: z.objectOutputType<typeof deleteEntityEdgeInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<Zep.SuccessResponse> {
    const zepClient = await resolveZepClient(provider, authInfo);
    const { uuid } = params;

    const result = await zepClient.graph.edge.delete(uuid);

    return result;
}

export const deleteEntityEdgeToolMetadata = {
    name: "zep_delete_entity_edge",
    config: {
        title: "Delete Entity Edge",
        description: "Deletes a specific edge between entities in the graph.",
        inputSchema: deleteEntityEdgeInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteEntityEdgeInputSchema, ZodRawShape>;

// MCP Tool
export function getDeleteEntityEdgeTool(provider: ZepClientProvider) {
    return {
        ...deleteEntityEdgeToolMetadata,
        name: deleteEntityEdgeToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteEntityEdge), provider),
    } as const satisfies Tool<typeof deleteEntityEdgeInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteEntityEdgeProcedureMetadata = {
    openapi: {
        method: "POST", // Should be DELETE, but OpenAPI spec doesn't support request body for DELETE
        path: `/${deleteEntityEdgeToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: deleteEntityEdgeToolMetadata.config.title,
        description: deleteEntityEdgeToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteEntityEdgeProcedure = toProcedurePluginFn(deleteEntityEdgeInputSchema, deleteEntityEdge, deleteEntityEdgeProcedureMetadata);
