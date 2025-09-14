import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { getEpisodes, getEpisodesMetadata } from "../sdk/getEpisodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getGetEpisodesTool(provider: ZepClientProvider) {
    return {
        ...getEpisodesMetadata,
        cb: partial(toCallToolResultFn(getEpisodes), provider),
    } as const satisfies Tool<typeof getEpisodesMetadata.config.inputSchema, ZodRawShape>;
}
