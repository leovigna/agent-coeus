import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { deleteEntityEdge, deleteEntityEdgeMetadata } from "../sdk/deleteEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getDeleteEntityEdgeTool(provider: ZepClientProvider) {
    return {
        ...deleteEntityEdgeMetadata,
        cb: partial(toCallToolResultFn(deleteEntityEdge), provider),
    } as const satisfies Tool<typeof deleteEntityEdgeMetadata.config.inputSchema, ZodRawShape>;
}
