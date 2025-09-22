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

export const getGraphEpisodesInputSchema = {
    ...graphIdParamsSchema,
    lastn: z
        .number()
        .optional()
        .describe("The number of most recent episodes to retrieve."),
};

// https://help.getzep.com/sdk-reference/graph/edge/get-by-graph-id
export async function getGraphEpisodes(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof getGraphEpisodesInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EpisodeResponse> {
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

    return zepClient.graph.episode.getByGraphId(graph.graphId!, params);
}

export const getGraphEpisodesToolMetadata = {
    name: "zep_get_graph_episodes",
    config: {
        title: "Get Graph Episodes",
        description: "Returns episodes by graph id.",
        inputSchema: getGraphEpisodesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof getGraphEpisodesInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getGetGraphEpisodesTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...getGraphEpisodesToolMetadata,
        name: getGraphEpisodesToolMetadata.name,
        cb: partial(toCallToolResultFn(getGraphEpisodes), ctx),
    } as const satisfies Tool<typeof getGraphEpisodesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getGraphEpisodesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/zep/graph/episode/graph",
        tags: ["zep"],
        summary: getGraphEpisodesToolMetadata.config.title,
        description: getGraphEpisodesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetGraphEpisodesProcedure = toProcedurePluginFn(
    getGraphEpisodesInputSchema,
    getGraphEpisodes,
    getGraphEpisodesProcedureMetadata,
);
