import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { withOrganizationUserRolesCheck } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

// TODO: Add graph id schema validation
export const deleteGraphInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/delete
async function _deleteGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof deleteGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.SuccessResponse> {
    const { graphId } = params;

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

    return zepClient.graph.delete(graphId.graphId);
}

export const deleteGraph = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteGraph, ["owner", "admin", "member"]),
    ["delete:graph"],
);

// MCP Tool
export const deleteGraphToolMetadata = {
    name: "zep_deleteGraph",
    config: {
        title: "Delete Graph",
        description: "Delete Graph in Zep",
        inputSchema: deleteGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteGraphInputSchema, ZodRawShape>;

export function deleteGraphToolFactory(ctx: {
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
        path: "/zep/graphs",
        tags: ["zep"],
        summary: deleteGraphToolMetadata.config.title,
        description: deleteGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteGraphProcedureFactory = toProcedurePluginFn(
    deleteGraphInputSchema,
    deleteGraph,
    deleteGraphProcedureMetadata,
);
