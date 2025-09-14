import { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

export const deleteOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
};

/**
 * Delete an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function deleteOrganization(client: LogToClient, params: z.objectOutputType<typeof deleteOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
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

    if (roles.some((r: { name: string }) => r.name === "owner") === false) {
        throw new Error("User is not authorized to delete this organization.");
    }

    const response = await client.DELETE("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
    });

    if (response.error) {
        throw new Error(JSON.stringify(response.error));
    }

    return { success: true, message: "Organization deleted successfully." };
}

export const deleteOrganizationMetadata = {
    name: "delete_organization",
    config: {
        title: "Delete Organization",
        description: "Delete an organization by its ID.",
        inputSchema: deleteOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteOrganizationInputSchema, ZodRawShape>;
