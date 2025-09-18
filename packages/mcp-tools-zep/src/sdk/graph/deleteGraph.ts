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
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

// TODO: Add graph id schema validation
export const deleteGraphInputSchema = {
    orgId: z
        .string()
        .optional()
        .describe(
            "The ID of the organization. If not provided, uses the user's current org.",
        ),
    graphUUID: z.string().optional().describe("The ID of the graph"),
};

export async function deleteGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof deleteGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.SuccessResponse> {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["write:graph"]); // 403 if auth has insufficient scopes

    const { logToClient, zepClientProvider } = ctx;

    const { graphUUID } = params;
    const orgId = params.orgId ?? (await getMeOrgId(logToClient, { authInfo }));

    // Check user has access to org
    await checkOrganizationUserRoles(
        logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);
    const graphId = `${orgId}:${userId}:${graphUUID}`; // unique graphId

    const graph = await zepClient.graph.delete(graphId);
    return graph;
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
        method: "POST",
        path: `/${deleteGraphToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: deleteGraphToolMetadata.config.title,
        description: deleteGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteGraphProcedure = toProcedurePluginFn(
    deleteGraphInputSchema,
    deleteGraph,
    deleteGraphProcedureMetadata,
);
