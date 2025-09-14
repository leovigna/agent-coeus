import { AuthInfo, checkRequiredScopes, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

import { checkUserOrganizationRole } from "./checkRequiredRole.js";

export const getOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function getOrganization(client: LogToClient, params: z.objectOutputType<typeof getOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["read:org"]); // 403 if auth has insufficient scopes

    const { id } = params;
    await checkUserOrganizationRole(client, { orgId: id, userId }, ["owner", "admin", "member"]);

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

export const getOrganizationMetadata = {
    name: "get_organization",
    config: {
        title: "Get Organization",
        description: "Get an organization by its ID.",
        inputSchema: getOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof getOrganizationInputSchema, ZodRawShape>;
