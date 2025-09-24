import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import {
    checkOrganizationUserRoles,
    type LogToClient,
} from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";

import { episodeDataSchema, graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const addDataBatchInputSchema = {
    graphId: graphIdSchema,
    episodes: z.array(z.object(episodeDataSchema)),
};

export async function addDataBatch(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof addDataBatchInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Episode[]> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["update:graph"]); // 403 if auth has insufficient scopes

    const { graphId, episodes } = params;

    if (graphId.userId != authInfo.subject) {
        throw createError(
            FORBIDDEN,
            `graphId userId ${graphId.userId} does not match auth subject ${authInfo.subject}`,
        ); // 403 if has insufficient permissions
    }

    // Check user has access to org
    await checkOrganizationUserRoles(
        ctx.logToClient,
        { orgId: graphId.orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(
        ctx.zepClientProvider,
        graphId.orgId,
    );

    // Add episodes to graph
    return zepClient.graph.addBatch({
        episodes,
        graphId: graphId.graphId,
    });
}

export const addDataBatchToolMetadata = {
    name: "zep_addDataBatch",
    config: {
        title: "Add Data Batch",
        description: "Add Data Batch in Zep",
        inputSchema: addDataBatchInputSchema,
    },
} as const satisfies ToolMetadata<typeof addDataBatchInputSchema, ZodRawShape>;

// MCP Tool
export function addDataBatchToolFactory(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...addDataBatchToolMetadata,
        name: addDataBatchToolMetadata.name,
        cb: partial(toCallToolResultFn(addDataBatch), ctx),
    } as const satisfies Tool<typeof addDataBatchInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const addDataBatchProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/zep/graph/data-batch",
        tags: ["zep"],
        summary: addDataBatchToolMetadata.config.title,
        description: addDataBatchToolMetadata.config.description,
    },
} as OpenApiMeta;

export const addDataBatchProcedureFactory = toProcedurePluginFn(
    addDataBatchInputSchema,
    addDataBatch,
    addDataBatchProcedureMetadata,
);
