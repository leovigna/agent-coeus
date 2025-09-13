import { AuthInfo, hasRequiredScopes, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {
    name: z.string().min(1).max(128).describe("The name of the organization."),
    description: z.string().max(256).optional().describe("The description of the organization."),
    customData: z.record(z.unknown()).optional().describe("arbitrary"),
    isMfaRequired: z.boolean().optional(),
};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        const { subject, scopes } = authInfo! as AuthInfo;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!hasRequiredScopes(scopes, ["create:org"])) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ error: "Missing scope create:org" }) },
                ],
            };
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

        // TODO: Get this up at top-level of configuration of server
        const orgRoles = (await client.GET("/api/organization-roles")).data!;
        const memberRole = orgRoles.find(r => r.name === "member")!;
        const ownerRole = orgRoles.find(r => r.name === "owner")!;

        // Add user to organization
        await client.POST("/api/organizations/{id}/users", {
            params: {
                path: {
                    id: org.id,
                },
            },
            body: {
                userIds: [subject!],
            },
            parseAs: "stream",
        });
        // Set user as owner
        await client.POST("/api/organizations/{id}/users/{userId}/roles", {
            params: {
                path: {
                    id: org.id,
                    userId: subject!,
                },
            },
            body: {
                organizationRoleIds: [ownerRole.id],
            },
            parseAs: "stream",
        });
        // Set JIT Role Member (auto-assign to new member)
        await client.POST("/api/organizations/{id}/jit/roles", {
            params: {
                path: {
                    id: org.id,
                },
            },
            body: {
                organizationRoleIds: [memberRole.id],
            },
            parseAs: "stream",
        });

        return {
            content: [
                { type: "text", text: JSON.stringify(org) },
            ],
        };
    };
}

export function getCreateOrganizationTool(client: LogToClient) {
    return {
        name: "create_organization",
        config: {
            title: "Create organization",
            description: "Create a new organization.",
            inputSchema,
        },
        cb: getCallback(client),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
