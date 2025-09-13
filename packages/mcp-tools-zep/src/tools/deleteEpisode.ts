import type { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the episode to delete"),
};

/**
 * Delete an episode from the graph memory.
 *
 * @param {string} uuid - UUID of the episode to delete.
 */
function getCallback(provider: ZepClientProvider): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        // Get Zep Client
        const zepClient = await resolveZepClient(provider, authInfo as unknown as AuthInfo); // forced casting here due to extending type

        const { uuid } = params;
        const result = await zepClient.graph.episode.delete(uuid);
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

export function getDeleteEpisodeTool(provider: ZepClientProvider) {
    return {
        name: "delete_episode",
        config: {
            title: "Delete Episode",
            description: "Delete an episode from the graph memory.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
