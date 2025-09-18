import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Converts a function that returns a Promise into a function that returns a CallToolResult.
 * @param fn
 * @returns A function that takes the same parameters as `fn` and returns a CallToolResult.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCallToolResultFn<T extends (...args: any[]) => Promise<any>>(
    fn: T,
) {
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
