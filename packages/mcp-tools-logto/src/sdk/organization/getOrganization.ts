import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import type { LogToClient } from "../../LogToClient.js";

import { checkOrganizationUserRoles } from "./checkOrganizationUserRoles.js";

export const getOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function getOrganization(
    client: LogToClient,
    params: z.objectOutputType<typeof getOrganizationInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["read:org"]); // 403 if auth has insufficient scopes

    const { id } = params;
    await checkOrganizationUserRoles(
        client,
        { orgId: id, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const orgResponse = await client.GET("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const org = orgResponse.data!;

    return org;
}

export const getOrganizationToolMetadata = {
    name: "get_organization",
    config: {
        title: "Get Organization",
        description: "Get an organization by its ID.",
        inputSchema: getOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof getOrganizationInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getGetOrganizationTool(client: LogToClient) {
    return {
        ...getOrganizationToolMetadata,
        name: getOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(getOrganization), client),
    } as const satisfies Tool<typeof getOrganizationInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getOrganizationProcedureMetadata = {
    openapi: {
        method: "GET",
        path: `/${getOrganizationToolMetadata.name}/{id}`,
        tags: ["tools", "logto"],
        summary: getOrganizationToolMetadata.config.title,
        description: getOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetOrganizationProcedure = toProcedurePluginFn(
    getOrganizationInputSchema,
    getOrganization,
    getOrganizationProcedureMetadata,
);
