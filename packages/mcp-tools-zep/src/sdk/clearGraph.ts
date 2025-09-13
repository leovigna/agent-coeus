import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape } from "zod";

import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

export const clearGraphInputSchema = {
    group_id: z.string().optional().describe("A unique ID for this graph. If not provided, uses the default group_id from auth sub."),
};

/**
 * Clears all data from a specific graph.
 *
 * @param {string} [group_id] - A unique ID for this graph. If not provided, uses the default group_id from auth sub.
 *
 * This function deletes all episodes, entities, and relationships associated with the specified graph.
 * This operation is irreversible.
 *
 * @example
 * ```typescript
 * await clearGraph(provider, { group_id: "some_arbitrary_string" }, { authInfo });
 * ```
 */
export async function clearGraph(provider: ZepClientProvider, params: z.objectOutputType<typeof clearGraphInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    const zepClient = await resolveZepClient(provider, authInfo);

    const { subject } = authInfo;
    const group_id = params.group_id ?? subject!;

    await zepClient.graph.delete(group_id);

    return { success: true, message: `Graph ${group_id} cleared successfully.` };
}

export const clearGraphMetadata = {
    name: "clear_graph",
    config: {
        title: "Clear Graph",
        description: "Clears all data from a specific graph. This operation is irreversible.",
        inputSchema: clearGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof clearGraphInputSchema, ZodRawShape>;
