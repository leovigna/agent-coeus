import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { deleteEntityEdge, deleteEntityEdgeMetadata } from "../sdk/deleteEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function deleteEntityEdgeToolCallback(...params: Parameters<typeof deleteEntityEdge>) {
    const result = await deleteEntityEdge(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getDeleteEntityEdgeTool(provider: ZepClientProvider) {
    return {
        ...deleteEntityEdgeMetadata,
        // partial application to add provider to deleteEntityEdgeToolCallback
        cb: partial(deleteEntityEdgeToolCallback, provider),
    } as const satisfies Tool<typeof deleteEntityEdgeMetadata.config.inputSchema, ZodRawShape>;
}
