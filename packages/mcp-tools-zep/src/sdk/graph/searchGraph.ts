import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { graphIdSchema, searchFiltersSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const searchGraphInputSchema = {
    graphId: graphIdSchema,
    query: z
        .string()
        .max(400, { message: "query <= 400 characters" })
        .describe("The string to search for (required)"),
    bfsOriginNodeUuids: z
        .array(z.string())
        .optional()
        .describe("Nodes that are the origins of the BFS searches"),
    centerNodeUuid: z
        .string()
        .optional()
        .describe("Node to rerank around for node distance reranking"),
    limit: z
        .number()
        .max(50)
        .optional()
        .describe(
            "The maximum number of facts to retrieve. Defaults to 10. Limited to 50.",
        ),
    minFactRating: z
        .number()
        .optional()
        .describe("The minimum rating by which to filter relevant facts"),
    mmrLambda: z
        .number()
        .optional()
        .describe("weighting for maximal marginal relevance"),
    reranker: z
        .enum([
            "rrf",
            "mmr",
            "node_distance",
            "episode_mentions",
            "cross_encoder",
        ])
        .optional()
        .describe("Defaults to RRF"),
    scope: z.enum(["edges", "nodes", "episodes"]),
    searchFilters: searchFiltersSchema,
};

// https://help.getzep.com/sdk-reference/graph/search
export async function searchGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof searchGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.GraphSearchResults> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["read:graph"]); // 403 if auth has insufficient scopes

    const { graphId } = params;

    if (graphId.userId != authInfo.subject) {
        throw createError(
            FORBIDDEN,
            `graphId userId ${graphId.userId} does not match auth subject ${authInfo.subject}`,
        ); // 403 if has insufficient permissions
    }

    // Check user has access to org
    await checkOrganizationUserRoles(
        ctx.logToClient,
        { orgId: graphId.orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const zepClient = await resolveZepClient(ctx.zepClientProvider, authInfo);

    return zepClient.graph.search({
        ...params,
        graphId: graphId.graphId,
    });
}

// MCP Tool
export const searchGraphToolMetadata = {
    name: "zep_search_graph",
    config: {
        title: "Search Graph",
        description:
            "Searches for a specific graph. This operation is irreversible.",
        inputSchema: searchGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof searchGraphInputSchema, ZodRawShape>;

export function getSearchGraphTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...searchGraphToolMetadata,
        name: searchGraphToolMetadata.name,
        cb: partial(toCallToolResultFn(searchGraph), ctx),
    } as const satisfies Tool<typeof searchGraphInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const searchGraphProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/zep/graph/search",
        tags: ["zep"],
        summary: searchGraphToolMetadata.config.title,
        description: searchGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createSearchGraphProcedure = toProcedurePluginFn(
    searchGraphInputSchema,
    searchGraph,
    searchGraphProcedureMetadata,
);
