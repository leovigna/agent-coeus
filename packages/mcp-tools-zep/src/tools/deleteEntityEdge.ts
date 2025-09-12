import { ZepClient } from "@getzep/zep-cloud";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { Tool } from "../Tool.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the entity edge to delete"),
};

/**
 * Delete an entity edge from the graph memory.
 *
 * @param {string} uuid - UUID of the entity edge to delete.
 */
function getCallback(zepClient: ZepClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
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
}

export function getDeleteEntityEdgeTool(zepClient: ZepClient) {
    return {
        name: "delete_entity_edge",
        config: {
            title: "Delete Entity Edge",
            description: "Delete an entity edge from the graph memory.",
            inputSchema,
        },
        cb: getCallback(zepClient),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
