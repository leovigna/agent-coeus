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

        const response = await client.GET("/api/organizations/{id}", {
            params: {
                path: {
                    id,
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
