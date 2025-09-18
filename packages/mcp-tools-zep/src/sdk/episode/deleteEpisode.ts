import {
    AuthInfo,
    toCallToolResultFn,
    Tool,
    ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import {
    resolveZepClient,
    ZepClientProvider,
} from "../../ZepClientProvider.js";

export const deleteEpisodeInputSchema = {
    uuid: z.string().describe("UUID of the episode to delete"),
};

/**
 * Deletes a specific episode from the graph.
 *
 * @param {string} uuid - The UUID of the episode to delete.
 *
 * This operation is irreversible.
 *
 * @example
 * ```typescript
 * await deleteEpisode(provider, { uuid: "some-uuid-string" }, { authInfo });
 * ```
 */
export async function deleteEpisode(
    provider: ZepClientProvider,
    params: z.objectOutputType<typeof deleteEpisodeInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.SuccessResponse> {
    const zepClient = await resolveZepClient(provider, authInfo);
    const { uuid } = params;

    const result = await zepClient.graph.episode.delete(uuid);

    return result;
}

export const deleteEpisodeToolMetadata = {
    name: "delete_episode",
    config: {
        title: "Delete Episode",
        description: "Deletes a specific episode from the graph.",
        inputSchema: deleteEpisodeInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteEpisodeInputSchema, ZodRawShape>;

// MCP Tool
export function getDeleteEpisodeTool(provider: ZepClientProvider) {
    return {
        ...deleteEpisodeToolMetadata,
        name: deleteEpisodeToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteEpisode), provider),
    } as const satisfies Tool<typeof deleteEpisodeInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteEpisodeProcedureMetadata = {
    openapi: {
        method: "POST", // Should be DELETE
        path: `/${deleteEpisodeToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: deleteEpisodeToolMetadata.config.title,
        description: deleteEpisodeToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteEpisodeProcedure = toProcedurePluginFn(
    deleteEpisodeInputSchema,
    deleteEpisode,
    deleteEpisodeProcedureMetadata,
);
