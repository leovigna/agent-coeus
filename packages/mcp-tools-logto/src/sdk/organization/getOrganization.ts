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

export const getOrganizationInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
async function _getOrganization(
    ctx: { logToClient: LogToClient },
    params: z.objectOutputType<typeof getOrganizationInputSchema, ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const { orgId } = params;

    const orgResponse = await client.GET("/api/organizations/{id}", {
        params: {
            path: {
                id: orgId,
            },
        },
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const org = orgResponse.data!;

    return org;
}

export const getOrganization = withScopeCheck(
    withOrganizationUserRolesCheck(_getOrganization, [
        "owner",
        "admin",
        "member",
    ]),
    ["read:org"],
);

export const getOrganizationToolMetadata = {
    name: "logto_getOrganization",
    config: {
        title: "Get Organization",
        description: "Get Organization in LogTo",
        inputSchema: getOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof getOrganizationInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getOrganizationToolFactory(ctx: { logToClient: LogToClient }) {
    return {
        ...getOrganizationToolMetadata,
        name: getOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(getOrganization), ctx),
    } as const satisfies Tool<typeof getOrganizationInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getOrganizationProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}",
        tags: ["logto/organization"],
        summary: getOrganizationToolMetadata.config.title,
        description: getOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getOrganizationProcedureFactory = toProcedurePluginFn(
    getOrganizationInputSchema,
    getOrganization,
    getOrganizationProcedureMetadata,
);
