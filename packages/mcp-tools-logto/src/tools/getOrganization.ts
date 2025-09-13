import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { getOrganization, getOrganizationMetadata } from "../sdk/getOrganization.js";

export async function getOrganizationToolCallback(...params: Parameters<typeof getOrganization>) {
    try {
        const result = await getOrganization(...params);
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

export function getGetOrganizationTool(client: LogToClient) {
    return {
        ...getOrganizationMetadata,
        cb: partial(getOrganizationToolCallback, client),
    } as const satisfies Tool<typeof getOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
