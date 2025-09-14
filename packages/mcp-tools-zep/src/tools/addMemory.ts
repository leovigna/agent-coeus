import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { addMemory, addMemoryMetadata } from "../sdk/addMemory.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function getAddMemoryTool(provider: ZepClientProvider) {
    return {
        ...addMemoryMetadata,
        cb: partial(toCallToolResultFn(addMemory), provider),
    } as const satisfies Tool<typeof addMemoryMetadata.config.inputSchema, ZodRawShape>;
}
