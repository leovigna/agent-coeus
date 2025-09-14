import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { CallToolResult, ServerNotification, ServerRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { z, ZodRawShape, ZodTypeAny } from "zod";

import { AuthInfo } from "./AuthInfo.js";

// Overrides MCP SDK types to include AuthInfo in extra param
export type ToolExtraParams = Omit<RequestHandlerExtra<ServerRequest, ServerNotification>, "authInfo"> & {
    authInfo: AuthInfo;
};
export type ToolCallback<Args extends undefined | ZodRawShape = undefined> = Args extends ZodRawShape ? (args: z.objectOutputType<Args, ZodTypeAny>, extra: ToolExtraParams) => CallToolResult | Promise<CallToolResult> : (extra: ToolExtraParams) => CallToolResult | Promise<CallToolResult>;

export interface ToolMetadata<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape> {
    name: string;
    config: {
        title?: string;
        description?: string;
        inputSchema?: InputArgs;
        outputSchema?: OutputArgs;
        annotations?: ToolAnnotations;
    };
}

export interface Tool<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape> extends ToolMetadata<InputArgs, OutputArgs> {
    cb: ToolCallback<InputArgs>;
}
