import { Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {
    id: z.string().describe("The ID of the organization."),
};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
        const { id } = params;

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
