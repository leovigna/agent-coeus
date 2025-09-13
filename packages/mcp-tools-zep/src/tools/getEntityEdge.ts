import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { getEntityEdge, getEntityEdgeMetadata } from "../sdk/getEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function getEntityEdgeToolCallback(...params: Parameters<typeof getEntityEdge>) {
    const result = await getEntityEdge(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getGetEntityEdgeTool(provider: ZepClientProvider) {
    return {
        ...getEntityEdgeMetadata,
        // partial application to add provider to getEntityEdgeToolCallback
        cb: partial(getEntityEdgeToolCallback, provider),
    } as const satisfies Tool<typeof getEntityEdgeMetadata.config.inputSchema, ZodRawShape>;
}
