import type { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

const inputSchema = {
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
};

/**
 * Clear all data from the graph memory and rebuild indices.
 *
 * @param {string} group_id - ID of the group to clear.
 */
function getCallback(provider: ZepClientProvider): ToolCallback<typeof inputSchema> {
    return async (_, { authInfo }) => {
        // Get Zep Client
        const zepClient = await resolveZepClient(provider, authInfo as unknown as AuthInfo); // forced casting here due to extending type

        const { subject } = authInfo! as AuthInfo;
        // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
        const group_id = subject!;
        // const { group_id } = params;

        const result = await zepClient.graph.delete(group_id);
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

export function getClearGraphTool(provider: ZepClientProvider) {
    return {
        name: "clear_graph",
        config: {
            title: "Clear Graph",
            description: "Clear all data from the graph memory and rebuild indices.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
