import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { clearGraph, clearGraphMetadata } from "../sdk/clearGraph.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function clearGraphToolCallback(...params: Parameters<typeof clearGraph>) {
    const result = await clearGraph(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getClearGraphTool(provider: ZepClientProvider) {
    return {
        ...clearGraphMetadata,
        // partial application to add provider to clearGraphToolCallback
        cb: partial(clearGraphToolCallback, provider),
    } as const satisfies Tool<typeof clearGraphMetadata.config.inputSchema, ZodRawShape>;
}
