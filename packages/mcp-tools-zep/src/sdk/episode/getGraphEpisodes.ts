import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { createError, FORBIDDEN } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

import { graphIdSchema } from "../../schemas/GraphIdParams.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const getGraphEpisodesInputSchema = {
    graphId: graphIdSchema,
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

    const zepClient = await resolveZepClient(
        ctx.zepClientProvider,
        graphId.orgId,
    );

    return zepClient.graph.episode.getByGraphId(graphId.graphId, params);
}

export const getGraphEpisodesToolMetadata = {
    name: "zep_getGraphEpisodes",
    config: {
        title: "Get Graph Episodes",
        description: "Get Graph Episodes in Zep",
        inputSchema: getGraphEpisodesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof getGraphEpisodesInputSchema,
    ZodRawShape
>;

// MCP Tool
export function getGraphEpisodesToolFactory(ctx: {
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
        path: "/zep/graph/episodes",
        tags: ["zep"],
        summary: getGraphEpisodesToolMetadata.config.title,
        description: getGraphEpisodesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getGraphEpisodesProcedureFactory = toProcedurePluginFn(
    getGraphEpisodesInputSchema,
    getGraphEpisodes,
    getGraphEpisodesProcedureMetadata,
);
