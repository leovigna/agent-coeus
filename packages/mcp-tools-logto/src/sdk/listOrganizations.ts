import { AuthInfo, hasRequiredScopes, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";

import { LogToClient } from "../LogToClient.js";

export const listOrganizationsInputSchema = {};

export async function listOrganizations(client: LogToClient, _: z.objectOutputType<typeof listOrganizationsInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    if (!hasRequiredScopes(authInfo?.scopes ?? [], ["list:orgs"])) {
        throw new Error("Missing required scope: list:orgs");
    }

    const { subject } = authInfo;
    const response = await client.GET("/api/users/{userId}/organizations", {
        params: {
            path: {
                userId: subject!,
            },
        },
    });

    return response.data!;
}

export const listOrganizationsMetadata = {
    name: "list_organizations",
    config: {
        title: "List Organizations",
        description: "List all organizations the current user belongs to.",
        inputSchema: listOrganizationsInputSchema,
    },
} as const satisfies ToolMetadata<typeof listOrganizationsInputSchema, ZodRawShape>;
