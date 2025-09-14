import { AuthInfo, checkRequiredScopes, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

import { checkUserOrganizationRole } from "./checkRequiredRole.js";

export const deleteOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Delete an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function deleteOrganization(client: LogToClient, params: z.objectOutputType<typeof deleteOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["delete:org"]); // 403 if auth has insufficient scopes

    const { id } = params;
    await checkUserOrganizationRole(client, { orgId: id, userId }, ["owner"]);

    const deleteResponse = await client.DELETE("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
    });
    if (!deleteResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
}

export const deleteOrganizationMetadata = {
    name: "delete_organization",
    config: {
        title: "Delete Organization",
        description: "Delete an organization by its ID.",
        inputSchema: deleteOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteOrganizationInputSchema, ZodRawShape>;
