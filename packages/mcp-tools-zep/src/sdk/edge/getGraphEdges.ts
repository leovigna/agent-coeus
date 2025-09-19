import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { getMeOrgId } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import { graphIdParamsSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";
import { getGraph } from "../graph/getGraph.js";

export const getGraphEdgesInputSchema = {
    ...graphIdParamsSchema,
    limit: z.number().optional().describe("Maximum number of items to return"),
    uuidCursor: z
        .string()
        .optional()
        .describe(
            "UUID based cursor, used for pagination. Should be the UUID of the last item in the previous page",
        ),
};

// https://help.getzep.com/sdk-reference/graph/edge/get-by-graph-id
export async function getGraphEdges(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphEdgesInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityEdge[]> {
    const { logToClient, zepClientProvider } = ctx;

    const orgId = params.orgId ?? (await getMeOrgId(logToClient, { authInfo }));
    const graphUUID = params.graphUUID ?? "default";

    const zepClient = await resolveZepClient(zepClientProvider, authInfo);

    // Ensure graph exists
    const graph = await getGraph(
        {
            logToClient: ctx.logToClient,
            zepClientProvider: zepClient,
        },
        { orgId, graphUUID },
        { authInfo },
    );

    return zepClient.graph.edge.getByGraphId(graph.graphId!, params);
}

export const getGraphEdgesToolMetadata = {
    name: "zep_get_graph_edges",
    config: {
        title: "Get Graph Edges",
        description: "Returns all edges for a graph.",
        inputSchema: getGraphEdgesInputSchema,
    },
} as const satisfies ToolMetadata<typeof getGraphEdgesInputSchema, ZodRawShape>;

// MCP Tool
export function getGetGraphEdgesTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...getGraphEdgesToolMetadata,
        name: `zep_${getGraphEdgesToolMetadata.name}`,
        cb: partial(toCallToolResultFn(getGraphEdges), ctx),
    } as const satisfies Tool<typeof getGraphEdgesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getGraphEdgesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: `/${getGraphEdgesToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: getGraphEdgesToolMetadata.config.title,
        description: getGraphEdgesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetGraphEdgesProcedure = toProcedurePluginFn(
    getGraphEdgesInputSchema,
    getGraphEdges,
    getGraphEdgesProcedureMetadata,
);
