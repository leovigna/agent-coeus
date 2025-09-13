import type { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { Zep } from "@getzep/zep-cloud";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

const inputSchema = {
    name: z.string().describe("Name of the episode"),
    episode_body: z.string().describe("The content of the episode to persist to memory."),
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
    source: z.enum(["text", "json", "message"]).default("text").describe("Source type"),
    source_description: z.string().default("").describe("Description of the source"),
    uuid: z.string().optional().describe("Optional UUID for the episode"),
};

/**
 * Add an episode to memory. This is the primary way to add information to the graph.
 *
 * @param {string} name - Name of the episode.
 * @param {string} episode_body - The content of the episode to persist to memory. When source='json', this must be a properly escaped JSON string.
 * @param {string} [group_id] - A unique ID for this graph. If not provided, uses the default group_id from auth sub.
 * @param {string} [source="text"] - Source type, must be one of: 'text', 'json', 'message'.
 * @param {string} [source_description=""] - Description of the source.
 * @param {string} [uuid] - Optional UUID for the episode.
 *
 * This function returns immediately and processes the episode addition in the background.
 * Episodes for the same group_id are processed sequentially to avoid race conditions.
 *
 * @example
 * Adding plain text content
 * ```typescript
 * await cb({
 *     name: "Company News",
 *     episode_body: "Acme Corp announced a new product line today.",
 *     source: "text",
 *     source_description: "news article",
 *     group_id: "some_arbitrary_string",
 * });
 * ```
 *
 * @example
 * Adding structured JSON content
 * NOTE: episode_body must be a properly escaped JSON string. Note the `JSON.stringify` usage.
 * ```typescript
 * await cb({
 *     name: "Customer Profile",
 *     episode_body: JSON.stringify({
 *         company: { name: "Acme Technologies" },
 *         products: [
 *             { id: "P001", name: "CloudSync"},
 *             { id: "P002", name: "DataMiner"}
 *         ],
 *     }),
 *     source: "json",
 *     source_description: "customer profile data",
 *     group_id: "some_arbitrary_string",
 * })
 *
 * @example
 * Adding message-style content
 * ```typescript
 * await cb({
 *     name: "Customer Conversation",
 *     episode_body: "user: What's your return policy?\nassistant: You can return items within 30 days.",
 *     source: "message",
 *     source_description: "chat transcript",
 *     group_id: "some_arbitrary_string",
 * });
 * ```
 *
 * @remarks
 * When using source='json':
 *  - The JSON must be a properly escaped string, not a raw JS object
 *  - The JSON will be automatically processed to extract entities and relationships
 *  - Complex nested structures are supported (arrays, nested objects, mixed data types), but keep nesting to a minimum
 *  - Entities will be created from appropriate JSON properties
 *  - Relationships between entities will be established based on the JSON structure
 */
function getCallback(provider: ZepClientProvider): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        const zepClient = await resolveZepClient(provider, authInfo as unknown as AuthInfo);

        const { subject } = authInfo! as AuthInfo;
        // TODO: Add group_id parameter, for now scoped to sub (group_id ignored)
        const group_id = subject!;
        const { episode_body, source, source_description } = params;

        try {
            await zepClient.graph.get(group_id);
        }
        catch (error) {
            if (error instanceof Zep.NotFoundError) {
                await zepClient.graph.create({ graphId: group_id });
            }
            else {
                throw error;
            }
        }

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
}

export function getAddMemoryTool(provider: ZepClientProvider) {
    return {
        name: "add_memory",
        config: {
            title: "Add Memory",
            description: "Add an episode to memory. This is the primary way to add information to the graph.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
