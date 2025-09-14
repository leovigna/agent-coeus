import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { deleteEpisode, deleteEpisodeMetadata } from "../sdk/deleteEpisode.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getDeleteEpisodeTool(provider: ZepClientProvider) {
    return {
        ...deleteEpisodeMetadata,
        cb: partial(toCallToolResultFn(deleteEpisode), provider),
    } as const satisfies Tool<typeof deleteEpisodeMetadata.config.inputSchema, ZodRawShape>;
}
