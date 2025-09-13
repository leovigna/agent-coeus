import { Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {
    id: z.string().describe("The ID of the organization."),
    name: z.string().min(1).max(128).optional().describe("The updated name."),
    description: z.string().max(256).optional().describe("The updated description."),
    customData: z.record(z.unknown()).optional().describe("Custom data."),
    isMfaRequired: z.boolean().optional().describe("Is MFA required?"),
};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
        const { id, ...body } = params;

        const response = await client.PATCH("/api/organizations/{id}", {
            params: {
                path: {
                    id,
                },
            },
            body: body as never,
        });
        const result = response.data!;

        return {
            content: [
                { type: "text", text: JSON.stringify(result) },
            ],
        };
    };
}

export function getUpdateOrganizationTool(client: LogToClient) {
    return {
        name: "update_organization",
        config: {
            title: "Update organization",
            description: "Update an organization's details.",
            inputSchema,
        },
        cb: getCallback(client),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
