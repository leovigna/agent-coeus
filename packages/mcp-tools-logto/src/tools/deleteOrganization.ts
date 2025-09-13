import { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {
    id: z.string().describe("The ID of the organization."),
};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        const { id } = params;
        const { subject } = authInfo! as AuthInfo;

        const roles = (await client.GET("/api/organizations/{id}/users/{userId}/roles", {
            params: {
                path: {
                    id,
                    userId: subject!,
                },
            },
        })).data!;

        if (roles.some((r: { name: string }) => r.name === "owner") === false) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ error: "User is not authorized to delete this organization." }) },
                ],
            };
        }

        const response = await client.DELETE("/api/organizations/{id}", {
            params: {
                path: {
                    id,
                },
            },
        });

        if (response.error) {
            return {
                content: [
                    { type: "text", text: JSON.stringify(response.error) },
                ],
            };
        }

        return {
            content: [
                { type: "text", text: "Organization deleted successfully." },
            ],
        };
    };
}

export function getDeleteOrganizationTool(client: LogToClient) {
    return {
        name: "delete_organization",
        config: {
            title: "Delete organization",
            description: "Delete an organization by its ID.",
            inputSchema,
        },
        cb: getCallback(client),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
