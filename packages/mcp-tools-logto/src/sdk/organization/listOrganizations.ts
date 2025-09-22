import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
    toCallToolResultFn,
    toProcedurePluginFn,
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
export async function listOrganizations(
    client: LogToClient,
    _: z.objectOutputType<typeof listOrganizationsInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["list:orgs"]); // 403 if auth has insufficient scopes

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

export const listOrganizationsToolMetadata = {
    name: "logto_list_organizations",
    config: {
        title: "List Organizations",
        description: "List all organizations the current user belongs to.",
        inputSchema: listOrganizationsInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof listOrganizationsInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getListOrganizationsTool(client: LogToClient) {
    return {
        ...listOrganizationsToolMetadata,
        name: listOrganizationsToolMetadata.name,
        cb: partial(toCallToolResultFn(listOrganizations), client),
    } as const satisfies Tool<typeof listOrganizationsInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const listOrganizationsProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/logto/users/me/organization",
        tags: ["logto"],
        summary: listOrganizationsToolMetadata.config.title,
        description: listOrganizationsToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createListOrganizationsProcedure = toProcedurePluginFn(
    listOrganizationsInputSchema,
    listOrganizations,
    listOrganizationsProcedureMetadata,
);
