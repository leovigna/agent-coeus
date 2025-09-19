import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    checkOrganizationUserRoles,
    getMeOrgId,
} from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { v7 } from "uuid";
import { z, type ZodRawShape } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const createGraphInputSchema = {
    orgId: z
        .string()
        .optional()
        .describe(
            "The ID of the organization. If not provided, uses the user's current org.",
        ),
    name: z.string().optional().describe("Name of the graph"),
};

// https://help.getzep.com/sdk-reference/graph/create
export async function createGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof createGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph> {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["create:graph"]); // 403 if auth has insufficient scopes

    const { logToClient, zepClientProvider } = ctx;

    const { name } = params;
    const orgId = params.orgId ?? (await getMeOrgId(logToClient, { authInfo }));

    // Check user has access to org
    await checkOrganizationUserRoles(
        logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);
    const graphId = `${orgId}:${userId}:${v7()}`; // unique graphId

    return zepClient.graph.create({
        graphId,
        name: name,
    });
}

// MCP Tool
export const createGraphToolMetadata = {
    name: "zep_create_graph",
    config: {
        title: "create Graph",
        description:
            "creates all data from a specific graph. This operation is irreversible.",
        inputSchema: createGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof createGraphInputSchema, ZodRawShape>;

export function getCreateGraphTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...createGraphToolMetadata,
        name: createGraphToolMetadata.name,
        cb: partial(toCallToolResultFn(createGraph), ctx),
    } as const satisfies Tool<typeof createGraphInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createGraphProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${createGraphToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: createGraphToolMetadata.config.title,
        description: createGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createCreateGraphProcedure = toProcedurePluginFn(
    createGraphInputSchema,
    createGraph,
    createGraphProcedureMetadata,
);
