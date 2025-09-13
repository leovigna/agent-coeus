import { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

export const updateOrganizationInputSchema = {
    id: z.string().describe("The ID of the organization."),
    name: z.string().min(1).max(128).optional().describe("The updated name."),
    description: z.string().max(256).optional().describe("The updated description."),
    customData: z.record(z.unknown()).optional().describe("Custom data."),
    isMfaRequired: z.boolean().optional().describe("Is MFA required?"),
};

export async function updateOrganization(client: LogToClient, params: z.objectOutputType<typeof updateOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const { id, ...body } = params;
    const { subject } = authInfo;

    const roles = (await client.GET("/api/organizations/{id}/users/{userId}/roles", {
        params: {
            path: {
                id,
                userId: subject!,
            },
        },
    })).data!;

    if (roles.some((r: { name: string }) => r.name === "owner" || r.name === "admin") === false) {
        throw new Error("User is not authorized to update this organization.");
    }

    const response = await client.PATCH("/api/organizations/{id}", {
        params: {
            path: {
                id,
            },
        },
        body: body as never, // The client type expects a specific body type, but the fields are optional
    });

    if (response.error) {
        throw new Error(JSON.stringify(response.error));
    }

    return response.data!;
}

export const updateOrganizationMetadata = {
    name: "update_organization",
    config: {
        title: "Update Organization",
        description: "Update an organization's details.",
        inputSchema: updateOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateOrganizationInputSchema, ZodRawShape>;
