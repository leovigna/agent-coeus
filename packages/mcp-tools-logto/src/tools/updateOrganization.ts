import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { updateOrganization, updateOrganizationMetadata } from "../sdk/updateOrganization.js";

export async function updateOrganizationToolCallback(...params: Parameters<typeof updateOrganization>) {
    try {
        const result = await updateOrganization(...params);
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

export function getUpdateOrganizationTool(client: LogToClient) {
    return {
        ...updateOrganizationMetadata,
        cb: partial(updateOrganizationToolCallback, client),
    } as const satisfies Tool<typeof updateOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
