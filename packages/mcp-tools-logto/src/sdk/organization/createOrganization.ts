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

export const createOrganizationInputSchema = {
    name: z.string().min(1).max(128).describe("The name of the organization."),
    description: z
        .string()
        .max(256)
        .optional()
        .describe("The description of the organization."),
    customData: z.record(z.unknown()).optional().describe("arbitrary"),
    isMfaRequired: z.boolean().optional(),
};

/**
 * Create a new organization.
 *
 * @param {string} name - The name of the organization.
 * @param {string} [description] - The description of the organization.
 * @param {Record<string, unknown>} [customData] - Arbitrary custom data.
 * @param {boolean} [isMfaRequired] - Whether MFA is required for the organization.
 */
export async function createOrganization(
    client: LogToClient,
    params: z.objectOutputType<
        typeof createOrganizationInputSchema,
        ZodTypeAny
    >,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["create:org"]); // 403 if auth has insufficient scopes

    const { name, description, customData, isMfaRequired } = params;

    const orgResponse = await client.POST("/api/organizations", {
        body: {
            name,
            description,
            // cast to Record<string, never> as customData can have any type
            customData: customData as unknown as Record<string, never>,
            isMfaRequired,
        },
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    const org = orgResponse.data!;

    // TODO: Get these at start time as these are static
    const orgRoles = (await client.GET("/api/organization-roles")).data!;
    const memberRole = orgRoles.find((r) => r.name === "member")!;
    const ownerRole = orgRoles.find((r) => r.name === "owner")!;

    const r1 = await client.POST("/api/organizations/{id}/users", {
        params: { path: { id: org.id } },
        body: { userIds: [userId] },
        parseAs: "stream",
    });
    if (!r1.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    const r2 = await client.POST(
        "/api/organizations/{id}/users/{userId}/roles",
        {
            params: { path: { id: org.id, userId } },
            body: { organizationRoleIds: [ownerRole.id] },
            parseAs: "stream",
        },
    );
    if (!r2.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    const r3 = await client.POST("/api/organizations/{id}/jit/roles", {
        params: { path: { id: org.id } },
        body: { organizationRoleIds: [memberRole.id] },
        parseAs: "stream",
    });
    if (!r3.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    return org;
}

// MCP Tool
export const createOrganizationToolMetadata = {
    name: "logto_create_organization",
    config: {
        title: "Create Organization",
        description: "Create a new organization.",
        inputSchema: createOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof createOrganizationInputSchema,
    ZodRawShape
>;

export function getCreateOrganizationTool(client: LogToClient) {
    return {
        ...createOrganizationToolMetadata,
        cb: partial(toCallToolResultFn(createOrganization), client),
    } as const satisfies Tool<
        typeof createOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
export const createOrganizationProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/logto/organization",
        tags: ["logto"],
        summary: createOrganizationToolMetadata.config.title,
        description: createOrganizationToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createCreateOrganizationProcedure = toProcedurePluginFn(
    createOrganizationInputSchema,
    createOrganization,
    createOrganizationProcedureMetadata,
);
