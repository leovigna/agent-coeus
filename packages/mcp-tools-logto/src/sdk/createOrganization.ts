import { AuthInfo, hasRequiredScopes, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

export const createOrganizationInputSchema = {
    name: z.string().min(1).max(128).describe("The name of the organization."),
    description: z.string().max(256).optional().describe("The description of the organization."),
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
export async function createOrganization(client: LogToClient, params: z.objectOutputType<typeof createOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    const { subject, scopes } = authInfo;

    if (!hasRequiredScopes(scopes, ["create:org"])) {
        throw new Error("Missing required scope: create:org");
    }

    const { name, description, customData, isMfaRequired } = params;

    const org = (await client.POST("/api/organizations", {
        body: {
            name,
            description,
            custom_data: customData,
            is_mfa_required: isMfaRequired,
        },
    })).data!;

    const orgRoles = (await client.GET("/api/organization-roles")).data!;
    const memberRole = orgRoles.find(r => r.name === "member")!;
    const ownerRole = orgRoles.find(r => r.name === "owner")!;

    await client.POST("/api/organizations/{id}/users", {
        params: { path: { id: org.id } },
        body: { userIds: [subject!] },
        parseAs: "stream",
    });

    await client.POST("/api/organizations/{id}/users/{userId}/roles", {
        params: { path: { id: org.id, userId: subject! } },
        body: { organizationRoleIds: [ownerRole.id] },
        parseAs: "stream",
    });

    await client.POST("/api/organizations/{id}/jit/roles", {
        params: { path: { id: org.id } },
        body: { organizationRoleIds: [memberRole.id] },
        parseAs: "stream",
    });

    return org;
}

export const createOrganizationMetadata = {
    name: "create_organization",
    config: {
        title: "Create Organization",
        description: "Create a new organization.",
        inputSchema: createOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof createOrganizationInputSchema, ZodRawShape>;
