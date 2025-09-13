import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { searchMemoryFacts, searchMemoryFactsMetadata } from "../sdk/searchMemoryFacts.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function searchMemoryFactsToolCallback(...params: Parameters<typeof searchMemoryFacts>) {
    const result = await searchMemoryFacts(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getSearchMemoryFactsTool(provider: ZepClientProvider) {
    return {
        ...searchMemoryFactsMetadata,
        // partial application to add provider to searchMemoryFactsToolCallback
        cb: partial(searchMemoryFactsToolCallback, provider),
    } as const satisfies Tool<typeof searchMemoryFactsMetadata.config.inputSchema, ZodRawShape>;
}
