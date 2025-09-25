import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import {
    type LogToClient,
    withOrganizationUserRolesCheck,
} from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { graphIdSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const listEntityTypesInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    graphId: graphIdSchema,
};

// https://help.getzep.com/sdk-reference/graph/list-entity-types
async function _listEntityTypes(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof listEntityTypesInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityTypeResponse> {
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

    return zepClient.graph.listEntityTypes({ graphId: graphId.graphId });
}

export const listEntityTypes = withScopeCheck(
    withOrganizationUserRolesCheck(_listEntityTypes, [
        "owner",
        "admin",
        "member",
    ]),
    ["read:graph"],
);

// MCP Tool
export const listEntityTypesToolMetadata = {
    name: "zep_listEntityTypes",
    config: {
        title: "List Entity Types",
        description: "List Entity Types in Zep",
        inputSchema: listEntityTypesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof listEntityTypesInputSchema,
    ZodRawShape
>;

export function listEntityTypesToolFactory(ctx: {
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
export const listEntityTypesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/zep/graph/entity-types",
        tags: ["zep"],
        summary: listEntityTypesToolMetadata.config.title,
        description: listEntityTypesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const listEntityTypesProcedureFactory = toProcedurePluginFn(
    listEntityTypesInputSchema,
    listEntityTypes,
    listEntityTypesProcedureMetadata,
);
