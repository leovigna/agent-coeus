import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

export const getEntityEdgeInputSchema = {
    uuid: z.string().describe("UUID of the entity edge to retrieve"),
};

/**
 * Gets a specific edge between entities in the graph.
 *
 * @param {string} uuid - The UUID of the edge to retrieve.
 *
 * @example
 * ```typescript
 * await getEntityEdge(provider, { uuid: "some-uuid-string" }, { authInfo });
 * ```
 */
export async function getEntityEdge(provider: ZepClientProvider, params: z.objectOutputType<typeof getEntityEdgeInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<Zep.EntityEdge> {
    const zepClient = await resolveZepClient(provider, authInfo);
    const { uuid } = params;

    const result = await zepClient.graph.edge.get(uuid);

    return result;
}

export const getEntityEdgeMetadata = {
    name: "get_entity_edge",
    config: {
        title: "Get Entity Edge",
        description: "Gets a specific edge between entities in the graph by its UUID.",
        inputSchema: getEntityEdgeInputSchema,
    },
} as const satisfies ToolMetadata<typeof getEntityEdgeInputSchema, ZodRawShape>;
