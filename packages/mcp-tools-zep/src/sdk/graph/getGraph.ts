import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    checkOrganizationUserRoles,
    getMeOrgId,
} from "@coeus-agent/mcp-tools-logto";
import { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape } from "zod";

import { graphIdParamsSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const getGraphInputSchema = {
    ...graphIdParamsSchema,
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
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["read:graph"]); // 403 if auth has insufficient scopes

    const { logToClient, zepClientProvider } = ctx;

    const orgId = params.orgId ?? (await getMeOrgId(logToClient, { authInfo }));
    const graphUUID = params.graphUUID ?? "default";

    // Check user has access to org
    await checkOrganizationUserRoles(
        logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);
    const graphId = `${orgId}:${userId}:${graphUUID}`; // unique graphId

    try {
        await zepClient.graph.get(graphId);
    } catch (error) {
        if (error instanceof Zep.NotFoundError) {
            if (graphUUID === "default") {
                checkRequiredScopes(scopes, ["create:graph"]); // 403 if auth has insufficient scopes
                // Create default graph if it doesn't exist
                await zepClient.graph.create({ graphId });
            } else {
                throw error;
            }
        } else {
            throw error;
        }
    }

    return zepClient.graph.get(graphId);
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
