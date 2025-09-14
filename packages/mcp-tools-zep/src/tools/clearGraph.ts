import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { clearGraph, clearGraphMetadata } from "../sdk/clearGraph.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getClearGraphTool(provider: ZepClientProvider) {
    return {
        ...clearGraphMetadata,
        cb: partial(toCallToolResultFn(clearGraph), provider),
    } as const satisfies Tool<typeof clearGraphMetadata.config.inputSchema, ZodRawShape>;
}
