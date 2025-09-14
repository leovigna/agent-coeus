import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { getEntityEdge, getEntityEdgeMetadata } from "../sdk/getEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getGetEntityEdgeTool(provider: ZepClientProvider) {
    return {
        ...getEntityEdgeMetadata,
        cb: partial(toCallToolResultFn(getEntityEdge), provider),
    } as const satisfies Tool<typeof getEntityEdgeMetadata.config.inputSchema, ZodRawShape>;
}
