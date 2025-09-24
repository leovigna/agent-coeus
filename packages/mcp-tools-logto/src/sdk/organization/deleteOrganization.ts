import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
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

export const deleteOrganizationInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
};

/**
 * Delete an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
async function _deleteOrganization(
    ctx: { logToClient: LogToClient },
    params: z.objectOutputType<
        typeof deleteOrganizationInputSchema,
        ZodTypeAny
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;

    const { orgId } = params;
    const deleteResponse = await client.DELETE("/api/organizations/{id}", {
        params: {
            path: {
                id: orgId,
            },
        },
    });
    if (!deleteResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
}

export const deleteOrganization = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteOrganization, ["owner"]),
    ["delete:org"],
);

export const deleteOrganizationToolMetadata = {
    name: "logto_deleteOrganization",
    config: {
        title: "Delete Organization",
        description: "Delete Organization in LogTo",
        inputSchema: deleteOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof deleteOrganizationInputSchema,
    ZodRawShape
>;

// MCP Tool
export function deleteOrganizationToolFactory(ctx: {
    logToClient: LogToClient;
}) {
    return {
        ...deleteOrganizationToolMetadata,
        name: deleteOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteOrganization), ctx),
    } as const satisfies Tool<
        typeof deleteOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
export const deleteOrganizationProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/logto/organizations/{id}",
        tags: ["logto"],
        summary: deleteOrganizationToolMetadata.config.title,
        description: deleteOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteOrganizationProcedureFactory = toProcedurePluginFn(
    deleteOrganizationInputSchema,
    deleteOrganization,
    deleteOrganizationProcedureMetadata,
);
