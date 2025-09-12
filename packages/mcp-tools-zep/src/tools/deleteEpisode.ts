import { ZepClient } from "@getzep/zep-cloud";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { Tool } from "../Tool.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the episode to delete"),
};

/**
 * Delete an episode from the graph memory.
 *
 * @param {string} uuid - UUID of the episode to delete.
 */
function getCallback(zepClient: ZepClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
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

export function getDeleteEpisodeTool(zepClient: ZepClient) {
    return {
        name: "delete_episode",
        config: {
            title: "Delete Episode",
            description: "Delete an episode from the graph memory.",
            inputSchema,
        },
        cb: getCallback(zepClient),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
