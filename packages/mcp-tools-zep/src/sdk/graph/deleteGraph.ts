import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

// TODO: Add graph id schema validation
export const deleteGraphInputSchema = {
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/delete
export async function deleteGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof deleteGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.SuccessResponse> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["delete:graph"]); // 403 if auth has insufficient scopes

    const { graphId } = params;

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

    const zepClient = await resolveZepClient(ctx.zepClientProvider, graphId.orgId);

    return zepClient.graph.delete(graphId.graphId);
}

// MCP Tool
export const deleteGraphToolMetadata = {
    name: "zep_delete_graph",
    config: {
        title: "Delete Graph",
        description:
            "gets all data from a specific graph. This operation is irreversible.",
        inputSchema: deleteGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteGraphInputSchema, ZodRawShape>;

export function getDeleteGraphTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...deleteGraphToolMetadata,
        name: deleteGraphToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteGraph), ctx),
    } as const satisfies Tool<typeof deleteGraphInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteGraphProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/zep/graph",
        tags: ["zep"],
        summary: deleteGraphToolMetadata.config.title,
        description: deleteGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteGraphProcedure = toProcedurePluginFn(
    deleteGraphInputSchema,
    deleteGraph,
    deleteGraphProcedureMetadata,
);
