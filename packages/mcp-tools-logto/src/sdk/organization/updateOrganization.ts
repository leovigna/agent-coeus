import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import type { LogToClient } from "../../LogToClient.js";

import { withOrganizationUserRolesCheck } from "./checkOrganizationUserRoles.js";

export const updateOrganizationInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
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
async function _updateOrganization(
    ctx: { logToClient: LogToClient },
    params: z.objectOutputType<
        typeof updateOrganizationInputSchema,
        ZodTypeAny
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;

    const { orgId, ...body } = params;

    const orgResponse = await client.PATCH("/api/organizations/{id}", {
        params: {
            path: {
                id: orgId,
            },
        },
        body: body as never, // The client type expects a specific body type, but the fields are optional
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const org = orgResponse.data!;

    return org;
}

export const updateOrganization = withScopeCheck(
    withOrganizationUserRolesCheck(_updateOrganization, ["owner", "admin"]),
    ["write:org"],
);

export const updateOrganizationToolMetadata = {
    name: "logto_updateOrganization",
    config: {
        title: "Update Organization",
        description: "Update Organization in LogTo",
        inputSchema: updateOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof updateOrganizationInputSchema,
    ZodRawShape
>;

// MCP Tool
export function updateOrganizationToolFactory(ctx: {
    logToClient: LogToClient;
}) {
    return {
        ...updateOrganizationToolMetadata,
        name: updateOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(updateOrganization), ctx),
    } as const satisfies Tool<
        typeof updateOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
export const updateOrganizationProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organizations/{orgId}",
        tags: ["logto/organization"],
        summary: updateOrganizationToolMetadata.config.title,
        description: updateOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateOrganizationProcedureFactory = toProcedurePluginFn(
    updateOrganizationInputSchema,
    updateOrganization,
    updateOrganizationProcedureMetadata,
);
