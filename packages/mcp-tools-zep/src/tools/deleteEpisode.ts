import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { deleteEpisode, deleteEpisodeMetadata } from "../sdk/deleteEpisode.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function deleteEpisodeToolCallback(...params: Parameters<typeof deleteEpisode>) {
    const result = await deleteEpisode(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getDeleteEpisodeTool(provider: ZepClientProvider) {
    return {
        ...deleteEpisodeMetadata,
        // partial application to add provider to deleteEpisodeToolCallback
        cb: partial(deleteEpisodeToolCallback, provider),
    } as const satisfies Tool<typeof deleteEpisodeMetadata.config.inputSchema, ZodRawShape>;
}
