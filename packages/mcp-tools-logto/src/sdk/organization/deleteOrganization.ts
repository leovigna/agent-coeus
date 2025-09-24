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

export const deleteOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Delete an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function deleteOrganization(
    ctx: { logToClient: LogToClient },
    params: z.objectOutputType<
        typeof deleteOrganizationInputSchema,
        ZodTypeAny
    >,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["delete:org"]); // 403 if auth has insufficient scopes

    const { id } = params;
    await checkOrganizationUserRoles(
        ctx,
        { orgId: id, validRoles: ["owner"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const deleteResponse = await client.DELETE("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
    });
    if (!deleteResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
}

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
