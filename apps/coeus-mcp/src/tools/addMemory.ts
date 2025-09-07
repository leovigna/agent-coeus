import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    name: z.string().describe("Name of the episode"),
    episode_body: z.string().describe("The content of the episode to persist to memory."),
    group_id: z.string().optional().describe("A unique ID for this graph."),
    source: z.enum(["text", "json", "message"]).default("text").describe("Source type"),
    source_description: z.string().default("").describe("Description of the source"),
    uuid: z.string().optional().describe("Optional UUID for the episode"),
};

const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { episode_body, group_id, source, source_description } = params;
    const episode = await zepClient.graph.add({
        data: episode_body,
        type: source,
        sourceDescription: source_description,
        graphId: group_id,
    });
    return {
        outputs: [
            {
                json: episode,
            },
        ],
        content: [
            {
                type: "text",
                text: JSON.stringify(episode),
            },
        ],
    };
};

export const addMemoryTool = {
    name: "add_memory",
    config: {
        title: "Add Memory",
        description: "Add an episode to memory. This is the primary way to add information to the graph.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
