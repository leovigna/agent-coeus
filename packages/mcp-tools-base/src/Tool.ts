import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { CallToolResult, ServerNotification, ServerRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { z, ZodRawShape, ZodTypeAny } from "zod";

import { AuthInfo } from "./AuthInfo.js";

// Overrides MCP SDK types to include AuthInfo in extra param
export type ToolExtraParams = Omit<RequestHandlerExtra<ServerRequest, ServerNotification>, "authInfo"> & {
    authInfo: AuthInfo;
};
export type ToolCallback<Args extends undefined | ZodRawShape = undefined> = Args extends ZodRawShape ? (args: z.objectOutputType<Args, ZodTypeAny>, extra: ToolExtraParams) => CallToolResult | Promise<CallToolResult> : (extra: ToolExtraParams) => CallToolResult | Promise<CallToolResult>;

/**
 * Converts a function that returns a Promise into a callback that returns a CallToolResult.
 * @param fn
 * @returns A function that takes the same parameters as `fn` and returns a CallToolResult.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCallToolResultFn<T extends (...args: any[]) => Promise<any>>(fn: T) {
    return async (...params: Parameters<T>) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await fn(...params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        } satisfies CallToolResult;
    };
}

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
