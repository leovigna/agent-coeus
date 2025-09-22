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

export const listGraphsInputSchema = {
    orgId: z
        .string()
        .optional()
        .describe(
            "Organization unique identifier. If not provided, uses the user's current org.",
        ),
};

// https://help.getzep.com/sdk-reference/graph/list-all
/**
 * Hacky implementation to list all graphs for a user in an org, since Zep doesn't provide a direct method.
 * @param ctx
 * @param params
 * @param param2
 * @returns
 */
export async function listGraphs(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof listGraphsInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph[]> {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["list:graphs"]); // 403 if auth has insufficient scopes

    const { logToClient, zepClientProvider } = ctx;

    const orgId = params.orgId ?? (await getMeOrgId(logToClient, { authInfo }));

    // Check user has access to org
    await checkOrganizationUserRoles(
        logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);

    const graphs = await zepClient.graph.listAll();

    const filteredGraphs = (graphs.graphs ?? []).filter((graph) => {
        const [graphOrgId, graphUserId, graphUUID] = graph.graphId!.split(":");

        return (
            orgId === graphOrgId &&
            userId === graphUserId &&
            graphUUID != undefined
        );
    });

    return filteredGraphs;
}

// MCP Tool
export const listGraphsToolMetadata = {
    name: "zep_list_graphs",
    config: {
        title: "List Graphs",
        description: "Lists all graphs for a user in an organization.",
        inputSchema: listGraphsInputSchema,
    },
} as const satisfies ToolMetadata<typeof listGraphsInputSchema, ZodRawShape>;

export function getListGraphsTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...listGraphsToolMetadata,
        name: listGraphsToolMetadata.name,
        cb: partial(toCallToolResultFn(listGraphs), ctx),
    } as const satisfies Tool<typeof listGraphsInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const listGraphsProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/zep/graph/list",
        tags: ["zep"],
        summary: listGraphsToolMetadata.config.title,
        description: listGraphsToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createListGraphsProcedure = toProcedurePluginFn(
    listGraphsInputSchema,
    listGraphs,
    listGraphsProcedureMetadata,
);
