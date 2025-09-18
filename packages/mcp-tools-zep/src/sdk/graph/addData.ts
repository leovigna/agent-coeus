import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

import { getGraph } from "./getGraph.js";

export const addDataInputSchema = {
    orgId: z
        .string()
        .optional()
        .describe(
            "The ID of the organization. If not provided, uses the user's current org.",
        ),
    graphUUID: z.string().optional().describe("The ID of the graph"),
    name: z.string().describe("Name of the episode"),
    episode_body: z
        .string()
        .describe("The content of the episode to persist to memory."),
    source: z
        .enum(["text", "json", "message"])
        .default("text")
        .describe("Source type"),
    source_description: z
        .string()
        .default("")
        .describe("Description of the source"),
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
 *
 * https://help.getzep.com/sdk-reference/graph/add
 */
export async function addData(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof addDataInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Episode> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["write:graph"]); // 403 if auth has insufficient scopes

    const zepClient = await resolveZepClient(ctx.zepClientProvider, authInfo);

    const { episode_body, source, source_description } = params;

    const { orgId, graphUUID } = params;

    // Ensure graph exists
    const graph = await getGraph(
        {
            logToClient: ctx.logToClient,
            zepClientProvider: zepClient,
        },
        { orgId, graphUUID },
        { authInfo },
    );
    // Add episode to graph
    const episode = await zepClient.graph.add({
        data: episode_body,
        type: source,
        sourceDescription: source_description,
        graphId: graph.graphId!,
    });
    return episode;
}

export const addDataToolMetadata = {
    name: "zep_add_data",
    config: {
        title: "Add Data",
        description:
            "Add an episode to memory. This is the primary way to add information to the graph.",
        inputSchema: addDataInputSchema,
    },
} as const satisfies ToolMetadata<typeof addDataInputSchema, ZodRawShape>;

// MCP Tool
export function getAddDataTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...addDataToolMetadata,
        name: addDataToolMetadata.name,
        cb: partial(toCallToolResultFn(addData), ctx),
    } as const satisfies Tool<typeof addDataInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const addDataProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${addDataToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: addDataToolMetadata.config.title,
        description: addDataToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createAddDataProcedure = toProcedurePluginFn(
    addDataInputSchema,
    addData,
    addDataProcedureMetadata,
);
