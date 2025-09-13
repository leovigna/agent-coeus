import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { listOrganizations, listOrganizationsMetadata } from "../sdk/listOrganizations.js";

export async function listOrganizationsToolCallback(...params: Parameters<typeof listOrganizations>) {
    try {
        const result = await listOrganizations(...params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        } satisfies CallToolResult;
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: (error as Error).message }),
                },
            ],
        } satisfies CallToolResult;
    }
}

export function getListOrganizationsTool(client: LogToClient) {
    return {
        ...listOrganizationsMetadata,
        cb: partial(listOrganizationsToolCallback, client),
    } as const satisfies Tool<typeof listOrganizationsMetadata.config.inputSchema, ZodRawShape>;
}
