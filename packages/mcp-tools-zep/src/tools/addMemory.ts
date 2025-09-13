import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { addMemory, addMemoryMetadata } from "../sdk/addMemory.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function addMemoryToolCallback(...params: Parameters<typeof addMemory>) {
    const episode = await addMemory(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(episode),
            },
        ],
    } satisfies CallToolResult;
}

export function getAddMemoryTool(provider: ZepClientProvider) {
    return {
        ...addMemoryMetadata,
        // partial application to add provider to addMemoryToolCallback
        cb: partial(addMemoryToolCallback, provider),
    } as const satisfies Tool<typeof addMemoryMetadata.config.inputSchema, ZodRawShape>;
}
