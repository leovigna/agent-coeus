import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    group_id: z.string().optional().describe("ID of the group to retrieve episodes from"),
    last_n: z.number().default(10).describe("Number of most recent episodes to retrieve"),
};

const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { group_id, last_n } = params;
    if (!group_id) {
        throw new Error("group_id is required");
    }
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

export const getEpisodesTool = {
    name: "get_episodes",
    config: {
        title: "Get Episodes",
        description: "Get the most recent memory episodes for a specific group.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
