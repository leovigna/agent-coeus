import { ZepClient } from "@getzep/zep-cloud";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { Tool } from "../Tool.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the entity edge to retrieve"),
};

/**
 * Get an entity edge from the graph memory by its UUID.
 *
 * @param {string} uuid - UUID of the entity edge to retrieve.
 */
function getCallback(zepClient: ZepClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
        const { uuid } = params;
        const result = await zepClient.graph.edge.get(uuid);
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

export function getEntityEdgeTool(zepClient: ZepClient) {
    return {
        name: "get_entity_edge",
        config: {
            title: "Get Entity Edge",
            description: "Get an entity edge from the graph memory by its UUID.",
            inputSchema,
        },
        cb: getCallback(zepClient),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
