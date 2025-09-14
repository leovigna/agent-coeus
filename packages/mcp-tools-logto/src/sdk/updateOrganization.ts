import { AuthInfo, checkRequiredScopes, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

import { checkUserOrganizationRole } from "./checkRequiredRole.js";

export const updateOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
    name: z.string().min(1).max(128).optional().describe("The updated name."),
    description: z.string().max(256).optional().describe("The updated description."),
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
export async function updateOrganization(client: LogToClient, params: z.objectOutputType<typeof updateOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["write:org"]); // 403 if auth has insufficient scopes

    const { id, ...body } = params;
    await checkUserOrganizationRole(client, { orgId: id, userId }, ["owner", "admin"]);

    const orgResponse = await client.PATCH("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
        body: body as never, // The client type expects a specific body type, but the fields are optional
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed

    if (orgResponse.error) {
        throw new Error(JSON.stringify(orgResponse.error));
    }

    return orgResponse.data!;
}

export const updateOrganizationMetadata = {
    name: "update_organization",
    config: {
        title: "Update Organization",
        description: "Update an organization's details.",
        inputSchema: updateOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateOrganizationInputSchema, ZodRawShape>;
