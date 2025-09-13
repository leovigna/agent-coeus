import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { getEpisodes, getEpisodesMetadata } from "../sdk/getEpisodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export async function getEpisodesToolCallback(...params: Parameters<typeof getEpisodes>) {
    const result = await getEpisodes(...params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    } satisfies CallToolResult;
}

export function getGetEpisodesTool(provider: ZepClientProvider) {
    return {
        ...getEpisodesMetadata,
        // partial application to add provider to getEpisodesToolCallback
        cb: partial(getEpisodesToolCallback, provider),
    } as const satisfies Tool<typeof getEpisodesMetadata.config.inputSchema, ZodRawShape>;
}
