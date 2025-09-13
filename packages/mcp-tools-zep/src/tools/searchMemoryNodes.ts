import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { searchMemoryNodes, searchMemoryNodesMetadata } from "../sdk/searchMemoryNodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function searchMemoryNodesToolCallback(...params: Parameters<typeof searchMemoryNodes>) {
    const result = await searchMemoryNodes(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getSearchMemoryNodesTool(provider: ZepClientProvider) {
    return {
        ...searchMemoryNodesMetadata,
        // partial application to add provider to searchMemoryNodesToolCallback
        cb: partial(searchMemoryNodesToolCallback, provider),
    } as const satisfies Tool<typeof searchMemoryNodesMetadata.config.inputSchema, ZodRawShape>;
}
