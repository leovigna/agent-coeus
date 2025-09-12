import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { AuthInfo } from "../AuthInfo.js";
import { LogToClientProvider, resolveLogToClient } from "../LogToClientProvider.js";
import { Tool } from "../Tool.js";

const inputSchema = {
    name: z.string().min(1).max(128).describe("The name of the organization."),
    description: z.string().max(256).optional().describe("The description of the organization."),
    customData: z.record(z.unknown()).optional().describe("arbitrary"),
    isMfaRequired: z.boolean().optional(),
};

function getCallback(provider: LogToClientProvider): ToolCallback<typeof inputSchema> {
    return async (params, { authInfo }) => {
        const client = await resolveLogToClient(provider, authInfo! as AuthInfo);

        const { name, description, customData, isMfaRequired } = params;

        const response = await client.apiClient.POST("/api/organizations", {
            body: {
                name,
                description,
                custom_data: customData,
                is_mfa_required: isMfaRequired,
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

export function getCreateOrganizationTool(provider: LogToClientProvider) {
    return {
        name: "create_organization",
        config: {
            title: "Create organization",
            description: "Create a new organization.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
