import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

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
export async function deleteEpisode(provider: ZepClientProvider, params: z.objectOutputType<typeof deleteEpisodeInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const zepClient = await resolveZepClient(provider, authInfo);
    const { uuid } = params;

    const result = await zepClient.graph.episode.delete(uuid);

    return result;
}

export const deleteEpisodeMetadata = {
    name: "delete_episode",
    config: {
        title: "Delete Episode",
        description: "Deletes a specific episode from the graph.",
        inputSchema: deleteEpisodeInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteEpisodeInputSchema, ZodRawShape>;
