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
import type { ZodRawShape } from "zod";
import { z } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const getGraphInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/get
async function _getGraph(
    ctx: {
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph> {
    const { graphId } = params;

    if (graphId.userId != authInfo.subject) {
        throw createError(
            FORBIDDEN,
            `graph ${graphId.graphId} userId ${graphId.userId} does not match auth subject ${authInfo.subject}`,
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

    return zepClient.graph.get(graphId.graphId);
}

export const getGraph = withScopeCheck(
    withOrganizationUserRolesCheck(_getGraph, ["owner", "admin", "member"]),
    ["read:graph"],
);

// MCP Tool
export const getGraphToolMetadata = {
    name: "zep_getGraph",
    config: {
        title: "Get Graph",
        description: "Get Graph in Zep",
        inputSchema: getGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof getGraphInputSchema, ZodRawShape>;

export function getGraphToolFactory(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...getGraphToolMetadata,
        name: getGraphToolMetadata.name,
        cb: partial(toCallToolResultFn(getGraph), ctx),
    } as const satisfies Tool<typeof getGraphInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getGraphProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/zep/graphs",
        tags: ["zep"],
        summary: getGraphToolMetadata.config.title,
        description: getGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getGraphProcedureFactory = toProcedurePluginFn(
    getGraphInputSchema,
    getGraph,
    getGraphProcedureMetadata,
);
