import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the entity edge to delete"),
};

/**
 * Delete an entity edge from the graph memory.
 *
 * @param {string} uuid - UUID of the entity edge to delete.
 */
const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { uuid } = params;
    const result = await zepClient.graph.edge.delete(uuid);
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

export const deleteEntityEdgeTool = {
    name: "delete_entity_edge",
    config: {
        title: "Delete Entity Edge",
        description: "Delete an entity edge from the graph memory.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
