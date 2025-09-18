import {
    AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    Tool,
    ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../../LogToClient.js";

import { checkOrganizationUserRoles } from "./checkOrganizationUserRoles.js";

export const updateOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
    name: z.string().min(1).max(128).optional().describe("The updated name."),
    description: z
        .string()
        .max(256)
        .optional()
        .describe("The updated description."),
    customData: z.record(z.unknown()).optional().describe("Custom data."),
    isMfaRequired: z.boolean().optional().describe("Is MFA required?"),
};

/**
 * Update an organization's details.
 *
 * @param {string} id - The ID of the organization.
 * @param {string} [name] - The updated name.
 * @param {string} [description] - The updated description.
 * @param {Record<string, unknown>} [customData] - Custom data.
 * @param {boolean} [isMfaRequired] - Is MFA required?
 */
export async function updateOrganization(
    client: LogToClient,
    params: z.objectOutputType<
        typeof updateOrganizationInputSchema,
        ZodTypeAny
    >,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["write:org"]); // 403 if auth has insufficient scopes

    const { id, ...body } = params;
    await checkOrganizationUserRoles(
        client,
        { orgId: id, validRoles: ["owner", "admin"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const orgResponse = await client.PATCH("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
        body: body as never, // The client type expects a specific body type, but the fields are optional
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const org = orgResponse.data!;

    return org;
}

export const updateOrganizationToolMetadata = {
    name: "logto_update_organization",
    config: {
        title: "Update Organization",
        description: "Update an organization's details.",
        inputSchema: updateOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof updateOrganizationInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getUpdateOrganizationTool(client: LogToClient) {
    return {
        ...updateOrganizationToolMetadata,
        name: updateOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(updateOrganization), client),
    } as const satisfies Tool<
        typeof updateOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
export const updateOrganizationProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: `/${updateOrganizationToolMetadata.name}/{id}`,
        tags: ["tools", "logto"],
        summary: updateOrganizationToolMetadata.config.title,
        description: updateOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createUpdateOrganizationProcedure = toProcedurePluginFn(
    updateOrganizationInputSchema,
    updateOrganization,
    updateOrganizationProcedureMetadata,
);
