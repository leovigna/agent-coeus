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
import type { z, ZodRawShape } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const listEntityTypesInputSchema = {
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/list-entity-types
export async function listEntityTypes(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof listEntityTypesInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityTypeResponse> {
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

    const zepClient = await resolveZepClient(ctx.zepClientProvider, graphId.orgId);

    return zepClient.graph.listEntityTypes({ graphId: graphId.graphId });
}

// MCP Tool
export const listEntityTypesToolMetadata = {
    name: "zep_list_entity_types",
    config: {
        title: "List Entity Types",
        description: "Lists all entity types from a specific graph.",
        inputSchema: listEntityTypesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof listEntityTypesInputSchema,
    ZodRawShape
>;

export function getListEntityTypesTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...listEntityTypesToolMetadata,
        name: listEntityTypesToolMetadata.name,
        cb: partial(toCallToolResultFn(listEntityTypes), ctx),
    } as const satisfies Tool<typeof listEntityTypesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getListEntityTypesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/zep/graph/entity-types",
        tags: ["zep"],
        summary: listEntityTypesToolMetadata.config.title,
        description: listEntityTypesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createListEntityTypesProcedure = toProcedurePluginFn(
    listEntityTypesInputSchema,
    listEntityTypes,
    getListEntityTypesProcedureMetadata,
);
