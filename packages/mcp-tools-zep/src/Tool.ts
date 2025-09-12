import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape } from "zod";

export interface Tool<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape> {
    name: string;
    config: {
        title?: string;
        description?: string;
        inputSchema?: InputArgs;
        outputSchema?: OutputArgs;
        annotations?: ToolAnnotations;
    };
    cb: ToolCallback<InputArgs>;
}
