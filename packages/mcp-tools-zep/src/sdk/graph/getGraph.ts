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

export const getGraphInputSchema = {
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/get
export async function getGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph> {
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

    const zepClient = await resolveZepClient(ctx.zepClientProvider, authInfo);

    return zepClient.graph.get(graphId.graphId);
}

// MCP Tool
export const getGraphToolMetadata = {
    name: "zep_get_graph",
    config: {
        title: "get Graph",
        description:
            "gets all data from a specific graph. This operation is irreversible.",
        inputSchema: getGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof getGraphInputSchema, ZodRawShape>;

export function getGetGraphTool(ctx: {
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
        path: "/zep/graph",
        tags: ["zep"],
        summary: getGraphToolMetadata.config.title,
        description: getGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetGraphProcedure = toProcedurePluginFn(
    getGraphInputSchema,
    getGraph,
    getGraphProcedureMetadata,
);
