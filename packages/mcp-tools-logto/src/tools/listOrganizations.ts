import { AuthInfo, hasRequiredScopes, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (_, { authInfo }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!hasRequiredScopes(authInfo?.scopes ?? [], ["list:orgs"])) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ error: "Missing scope list:orgs" }) },
                ],
            };
        }

        const { subject } = authInfo! as AuthInfo;
        const response = await client.GET("/api/users/{userId}/organizations", {
            params: {
                path: {
                    userId: subject!,
                },
            },
        });
        const result = response.data!;

        return {
            content: [
                { type: "text", text: JSON.stringify(result) },
            ],
        };
    };
}

export function getListOrganizationsTool(client: LogToClient) {
    return {
        name: "list_organizations",
        config: {
            title: "List organizations",
            description: "List all organizations with support for pagination and search queries.",
            inputSchema,
        },
        cb: getCallback(client),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
