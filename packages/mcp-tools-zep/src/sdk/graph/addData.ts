import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import {
    type LogToClient,
    withOrganizationUserRolesCheck,
} from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";

import { episodeDataSchema, graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const addDataInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    graphId: graphIdSchema,
    ...episodeDataSchema,
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
async function _addData(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof addDataInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Episode> {
    const { graphId, data, type, sourceDescription } = params;

    if (graphId.userId != authInfo.subject) {
        throw createError(
            FORBIDDEN,
            `graphId userId ${graphId.userId} does not match auth subject ${authInfo.subject}`,
        ); // 403 if has insufficient permissions
    }

    if (graphId.orgId != params.orgId) {
        throw createError(
            FORBIDDEN,
            `graph ${graphId.graphId} orgId ${graphId.orgId} does not match orgId param ${params.orgId}`,
        ); // 403 if has insufficient permissions
    }

    const zepClient = await resolveZepClient(
        ctx.zepClientProvider,
        graphId.orgId,
    );

    // Add episode to graph
    return zepClient.graph.add({
        data,
        type,
        sourceDescription,
        graphId: graphId.graphId,
    });
}

export const addData = withScopeCheck(
    withOrganizationUserRolesCheck(_addData, ["owner", "admin", "member"]),
    ["update:graph"],
);

export const addDataToolMetadata = {
    name: "zep_addData",
    config: {
        title: "Add Data",
        description: "Add Data in Zep",
        inputSchema: addDataInputSchema,
    },
} as const satisfies ToolMetadata<typeof addDataInputSchema, ZodRawShape>;

// MCP Tool
export function addDataToolFactory(ctx: {
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
        path: "/organizations/{orgId}/zep/graph/data",
        tags: ["zep"],
        summary: addDataToolMetadata.config.title,
        description: addDataToolMetadata.config.description,
    },
} as OpenApiMeta;

export const addDataProcedureFactory = toProcedurePluginFn(
    addDataInputSchema,
    addData,
    addDataProcedureMetadata,
);
