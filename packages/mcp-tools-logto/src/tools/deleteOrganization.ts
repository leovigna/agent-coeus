import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { deleteOrganization, deleteOrganizationMetadata } from "../sdk/deleteOrganization.js";

export async function deleteOrganizationToolCallback(...params: Parameters<typeof deleteOrganization>) {
    try {
        const result = await deleteOrganization(...params);
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

export function getDeleteOrganizationTool(client: LogToClient) {
    return {
        ...deleteOrganizationMetadata,
        cb: partial(deleteOrganizationToolCallback, client),
    } as const satisfies Tool<typeof deleteOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
