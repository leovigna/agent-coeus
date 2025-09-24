import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape, ZodTypeAny } from "zod";

import type { LogToClient } from "../../LogToClient.js";

export const listOrganizationsInputSchema = {};

/**
 * List all organizations the current user belongs to.
 */
async function _listOrganizations(
    ctx: { logToClient: LogToClient },
    _: z.objectOutputType<typeof listOrganizationsInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const { subject } = authInfo;
    const userId = subject!;

    const orgsResponse = await client.GET("/api/users/{userId}/organizations", {
        params: {
            path: {
                userId,
            },
        },
    });
    if (!orgsResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    const orgs = orgsResponse.data!;
    return orgs;
}

export const listOrganizations = withScopeCheck(_listOrganizations, [
    "list:orgs",
]);

export const listOrganizationsToolMetadata = {
    name: "logto_listOrganizations",
    config: {
        title: "List Organizations",
        description: "List Organizations in LogTo",
        inputSchema: listOrganizationsInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof listOrganizationsInputSchema,
    ZodRawShape
>;

// MCP Tool
export function listOrganizationsToolFactory(ctx: {
    logToClient: LogToClient;
}) {
    return {
        ...listOrganizationsToolMetadata,
        name: listOrganizationsToolMetadata.name,
        cb: partial(toCallToolResultFn(listOrganizations), ctx),
    } as const satisfies Tool<typeof listOrganizationsInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const listOrganizationsProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/logto/organizations",
        tags: ["logto"],
        summary: listOrganizationsToolMetadata.config.title,
        description: listOrganizationsToolMetadata.config.description,
    },
} as OpenApiMeta;

export const listOrganizationsProcedureFactory = toProcedurePluginFn(
    listOrganizationsInputSchema,
    listOrganizations,
    listOrganizationsProcedureMetadata,
);
