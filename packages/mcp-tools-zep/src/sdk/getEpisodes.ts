import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import type { Zep } from "@getzep/zep-cloud";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

export const getEpisodesInputSchema = {
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
    last_n: z.number().default(10).describe("Number of most recent episodes to retrieve"),
};

/**
 * Gets the most recent memory episodes for a specific group.
 *
 * @param {string} [group_id] - ID of the group to retrieve episodes from. If not provided, uses the default group_id.
 * @param {number} [last_n=10] - Number of most recent episodes to retrieve.
 *
 * @example
 * ```typescript
 * await getEpisodes(provider, { group_id: "some-group-id", last_n: 5 }, { authInfo });
 * ```
 */
export async function getEpisodes(provider: ZepClientProvider, params: z.objectOutputType<typeof getEpisodesInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<Zep.EpisodeResponse> {
    const zepClient = await resolveZepClient(provider, authInfo);

    const { subject } = authInfo;
    const group_id = params.group_id ?? subject!;
    const { last_n } = params;

    const result = await zepClient.graph.episode.getByGraphId(group_id, {
        lastn: last_n,
    });

    return result;
}

export const getEpisodesMetadata = {
    name: "get_episodes",
    config: {
        title: "Get Episodes",
        description: "Gets the most recent memory episodes for a specific group.",
        inputSchema: getEpisodesInputSchema,
    },
} as const satisfies ToolMetadata<typeof getEpisodesInputSchema, ZodRawShape>;
