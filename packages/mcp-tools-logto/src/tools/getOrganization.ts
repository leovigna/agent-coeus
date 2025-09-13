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

        if (roles.some((r: { name: string }) => r.name === "owner" || r.name === "admin" || r.name === "member") === false) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ error: "User is not authorized to access this organization." }) },
                ],
            };
        }

        const org = (await client.GET("/api/organizations/{id}", {
            params: {
                path: {
                    id,
                },
            },
        })).data!;

        return {
            content: [
                { type: "text", text: JSON.stringify(org) },
            ],
        };
    };
}

export function getGetOrganizationTool(client: LogToClient) {
    return {
        name: "get_organization",
        config: {
            title: "Get organization",
            description: "Get an organization by its ID.",
            inputSchema,
        },
        cb: getCallback(client),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
