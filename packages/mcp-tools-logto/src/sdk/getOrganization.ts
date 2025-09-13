import { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

export const getOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function getOrganization(client: LogToClient, params: z.objectOutputType<typeof getOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const { id } = params;
    const { subject } = authInfo;

    const roles = (await client.GET("/api/organizations/{id}/users/{userId}/roles", {
        params: {
            path: {
                id,
                userId: subject!,
            },
        },
    })).data!;

    if (roles.some((r: { name: string }) => r.name === "owner" || r.name === "admin" || r.name === "member") === false) {
        throw new Error("User is not authorized to access this organization.");
    }

    const org = (await client.GET("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
    })).data!;

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
