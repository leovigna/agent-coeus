import { Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {
    q: z.string().optional().describe("The query to filter organizations."),
    page: z.number().optional().default(1).describe("Page number."),
    page_size: z.number().optional().default(20).describe("Entries per page."),
};

function getCallback(client: LogToClient): ToolCallback<typeof inputSchema> {
    return async (params) => {
        const { q, page, page_size } = params;

        const response = await client.GET("/api/organizations", {
            params: {
                query: {
                    q,
                    page,
                    page_size,
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
