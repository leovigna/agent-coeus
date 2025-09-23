import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
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
export async function getGraphEdges(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphEdgesInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityEdge[]> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["read:graph"]); // 403 if auth has insufficient scopes

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

    const zepClient = await resolveZepClient(
        ctx.zepClientProvider,
        graphId.orgId,
    );

    return zepClient.graph.edge.getByGraphId(graphId.graphId, params);
}

export const getGraphEdgesToolMetadata = {
    name: "zep_get_graph_edges",
    config: {
        title: "Get Graph Edges",
        description: "Returns all edges for a graph.",
        inputSchema: getGraphEdgesInputSchema,
    },
} as const satisfies ToolMetadata<typeof getGraphEdgesInputSchema, ZodRawShape>;

// MCP Tool
export function getGetGraphEdgesTool(ctx: {
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
        path: "/zep/graph/edge/graph",
        tags: ["zep"],
        summary: getGraphEdgesToolMetadata.config.title,
        description: getGraphEdgesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetGraphEdgesProcedure = toProcedurePluginFn(
    getGraphEdgesInputSchema,
    getGraphEdges,
    getGraphEdgesProcedureMetadata,
);
