import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { withOrganizationUserRolesCheck } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const getGraphEdgesInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    graphId: graphIdSchema,
    limit: z.number().optional().describe("Maximum number of items to return"),
    uuidCursor: z
        .string()
        .optional()
        .describe(
            "UUID based cursor, used for pagination. Should be the UUID of the last item in the previous page",
        ),
};

// https://help.getzep.com/sdk-reference/graph/edge/get-by-graph-id
async function _getGraphEdges(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphEdgesInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityEdge[]> {
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

    return zepClient.graph.edge.getByGraphId(graphId.graphId, params);
}

export const getGraphEdges = withScopeCheck(
    withOrganizationUserRolesCheck(_getGraphEdges, [
        "owner",
        "admin",
        "member",
    ]),
    ["read:graph"],
);

export const getGraphEdgesToolMetadata = {
    name: "zep_getGraphEdges",
    config: {
        title: "Get Graph Edges",
        description: "Get Graph Edges in Zep",
        inputSchema: getGraphEdgesInputSchema,
    },
} as const satisfies ToolMetadata<typeof getGraphEdgesInputSchema, ZodRawShape>;

// MCP Tool
export function getGraphEdgesToolFactory(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...getGraphEdgesToolMetadata,
        name: getGraphEdgesToolMetadata.name,
        cb: partial(toCallToolResultFn(getGraphEdges), ctx),
    } as const satisfies Tool<typeof getGraphEdgesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getGraphEdgesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/zep/graph/edges",
        tags: ["zep"],
        summary: getGraphEdgesToolMetadata.config.title,
        description: getGraphEdgesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getGraphEdgesProcedureFactory = toProcedurePluginFn(
    getGraphEdgesInputSchema,
    getGraphEdges,
    getGraphEdgesProcedureMetadata,
);
