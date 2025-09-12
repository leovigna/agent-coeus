import { ZepClient } from "@getzep/zep-cloud";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { AuthInfo } from "../AuthInfo.js";
import { Tool } from "../Tool.js";

const inputSchema = {
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
    last_n: z.number().default(10).describe("Number of most recent episodes to retrieve"),
};

/**
 * Get the most recent memory episodes for a specific group.
 *
 * @param {string} [group_id] - ID of the group to retrieve episodes from. If not provided, uses the default group_id.
 * @param {number} [last_n=10] - Number of most recent episodes to retrieve.
 */
function getCallback(zepClient: ZepClient): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        const { subject } = authInfo! as AuthInfo;
        // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
        const group_id = subject!;
        const { last_n } = params;

        const result = await zepClient.graph.episode.getByGraphId(group_id, {
            lastn: last_n,
        });
        return {
            outputs: [
                {
                    json: result,
                },
            ],
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        };
    };
}

export function getGetEpisodesTool(zepClient: ZepClient) {
    return {
        name: "get_episodes",
        config: {
            title: "Get Episodes",
            description: "Get the most recent memory episodes for a specific group.",
            inputSchema,
        },
        cb: getCallback(zepClient),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
