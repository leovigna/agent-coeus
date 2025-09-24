import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    getMeOrgId,
    withOrganizationUserRolesCheck,
} from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { graphIdSchema } from "../../schemas/GraphIdParams.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const listGraphsInputSchema = {
    orgId: z.string().describe("Organization unique identifier"),
};

// https://help.getzep.com/sdk-reference/graph/list-all
/**
 * Hacky implementation to list all graphs for a user in an org, since Zep doesn't provide a direct method.
 * @param ctx
 * @param params
 * @param param2
 * @returns
 */
async function _listGraphs(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof listGraphsInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph[]> {
    const { subject } = authInfo;
    const userId = subject!;

    const { zepClientProvider } = ctx;

    const orgId = params.orgId ?? (await getMeOrgId(ctx, { authInfo }));

    const zepClient = await resolveZepClient(zepClientProvider, orgId);

    const graphs = await zepClient.graph.listAll();

    const filteredGraphs = (graphs.graphs ?? []).filter((graph) => {
        const parseResult = graphIdSchema.safeParse(graph.graphId);
        if (!parseResult.success) return false;

        const graphId = parseResult.data;

        return orgId === graphId.orgId && userId === graphId.userId;
    });

    return filteredGraphs;
}

export const listGraphs = withScopeCheck(
    withOrganizationUserRolesCheck(_listGraphs, ["owner", "admin", "member"]),
    ["list:graphs"],
);

// MCP Tool
export const listGraphsToolMetadata = {
    name: "zep_listGraphs",
    config: {
        title: "List Graphs",
        description: "List Graphs in Zep",
        inputSchema: listGraphsInputSchema,
    },
} as const satisfies ToolMetadata<typeof listGraphsInputSchema, ZodRawShape>;

export function listGraphsToolFactory(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...listGraphsToolMetadata,
        name: listGraphsToolMetadata.name,
        cb: partial(toCallToolResultFn(listGraphs), ctx),
    } as const satisfies Tool<typeof listGraphsInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const listGraphsProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/zep/graphs/list",
        tags: ["zep"],
        summary: listGraphsToolMetadata.config.title,
        description: listGraphsToolMetadata.config.description,
    },
} as OpenApiMeta;

export const listGraphsProcedureFactory = toProcedurePluginFn(
    listGraphsInputSchema,
    listGraphs,
    listGraphsProcedureMetadata,
);
