import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { createOrganization, createOrganizationMetadata } from "../sdk/createOrganization.js";

export async function createOrganizationToolCallback(...params: Parameters<typeof createOrganization>) {
    const result = await createOrganization(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getCreateOrganizationTool(client: LogToClient) {
    return {
        ...createOrganizationMetadata,
        cb: partial(createOrganizationToolCallback, client),
    } as const satisfies Tool<typeof createOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
