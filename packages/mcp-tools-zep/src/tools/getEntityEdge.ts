import type { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

const inputSchema = {
    uuid: z.string().describe("UUID of the entity edge to retrieve"),
};

/**
 * Get an entity edge from the graph memory by its UUID.
 *
 * @param {string} uuid - UUID of the entity edge to retrieve.
 */
function getCallback(provider: ZepClientProvider): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        // Get Zep Client
        const zepClient = await resolveZepClient(provider, authInfo as unknown as AuthInfo); // forced casting here due to extending type

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

export function getGetEntityEdgeTool(provider: ZepClientProvider) {
    return {
        name: "get_entity_edge",
        config: {
            title: "Get Entity Edge",
            description: "Get an entity edge from the graph memory by its UUID.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
