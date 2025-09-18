import { type AuthInfo, checkRequiredScopes, type ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { createOrganization, getUserCustomData, LogToClient } from "@coeus-agent/mcp-tools-logto";
import { Zep } from "@getzep/zep-cloud";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { v7 } from "uuid";
import { z, ZodRawShape } from "zod";

import { UserCustomData } from "../../UserCustomData.js";
import { resolveZepClient, ZepClientProvider } from "../../ZepClientProvider.js";

export const createGraphInputSchema = {
    orgId: z.string().optional().describe("The ID of the organization. If not provided, uses the user's current org."),
    name: z.string().optional().describe("Name of the graph"),
};

export async function createGraph(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}, params: z.objectOutputType<typeof createGraphInputSchema, z.ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<Zep.Graph> {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["create:graph"]); // 403 if auth has insufficient scopes

    const { logToClient, zepClientProvider } = ctx;

    const { name } = params;
    let orgId = params.orgId;
    if (!orgId) {
        // Get current orgId
        const userCustomData = await getUserCustomData(logToClient, {}, { authInfo }) as unknown as UserCustomData;
        orgId = userCustomData.status?.orgId;
    }

    if (!orgId) {
        // Create personal org
        const org = await createOrganization(logToClient, {
            name: "Personal",
            description: "Personal Organization",
        }, { authInfo });
        orgId = org.id;
        // Set as personal org
        const updateCustomDataResponse = await logToClient.PATCH("/api/users/{userId}/custom-data", {
            params: {
                path: {
                    userId,
                },
            },
            body: {
                // cast to Record<string, never> as customData can have any type
                customData: { currentOrgId: orgId } as unknown as Record<string, never>,
            },
        });
        if (!updateCustomDataResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR);
    };

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);
    const graphId = `${orgId}:${userId}:${v7()}`; // unique graphId

    const graph = await zepClient.graph.create({
        graphId,
        name: name,
    });
    return graph;
}

export const createGraphToolMetadata = {
    name: "zep_create_graph",
    config: {
        title: "create Graph",
        description: "creates all data from a specific graph. This operation is irreversible.",
        inputSchema: createGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof createGraphInputSchema, ZodRawShape>;
