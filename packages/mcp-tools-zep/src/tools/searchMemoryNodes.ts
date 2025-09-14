import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { searchMemoryNodes, searchMemoryNodesMetadata } from "../sdk/searchMemoryNodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getSearchMemoryNodesTool(provider: ZepClientProvider) {
    return {
        ...searchMemoryNodesMetadata,
        cb: partial(toCallToolResultFn(searchMemoryNodes), provider),
    } as const satisfies Tool<typeof searchMemoryNodesMetadata.config.inputSchema, ZodRawShape>;
}
