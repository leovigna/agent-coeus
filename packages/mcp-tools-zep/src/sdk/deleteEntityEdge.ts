import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

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
export async function deleteEntityEdge(provider: ZepClientProvider, params: z.objectOutputType<typeof deleteEntityEdgeInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const zepClient = await resolveZepClient(provider, authInfo);
    const { uuid } = params;

    const result = await zepClient.graph.edge.delete(uuid);

    return result;
}

export const deleteEntityEdgeMetadata = {
    name: "delete_entity_edge",
    config: {
        title: "Delete Entity Edge",
        description: "Deletes a specific edge between entities in the graph.",
        inputSchema: deleteEntityEdgeInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteEntityEdgeInputSchema, ZodRawShape>;
