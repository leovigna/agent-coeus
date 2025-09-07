import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the episode to delete"),
};

const cb: ToolCallback<typeof inputSchema> = async (params) => {
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

export const deleteEpisodeTool = {
    name: "delete_episode",
    config: {
        title: "Delete Episode",
        description: "Delete an episode from the graph memory.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
