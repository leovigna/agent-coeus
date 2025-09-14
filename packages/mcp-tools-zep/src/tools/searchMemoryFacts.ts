import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { searchMemoryFacts, searchMemoryFactsMetadata } from "../sdk/searchMemoryFacts.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getSearchMemoryFactsTool(provider: ZepClientProvider) {
    return {
        ...searchMemoryFactsMetadata,
        cb: partial(toCallToolResultFn(searchMemoryFacts), provider),
    } as const satisfies Tool<typeof searchMemoryFactsMetadata.config.inputSchema, ZodRawShape>;
}
