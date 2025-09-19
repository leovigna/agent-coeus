import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";

import { episodeDataSchema, graphIdParamsSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

import { getGraph } from "./getGraph.js";

export const addDataBatchInputSchema = {
    ...graphIdParamsSchema,
    episodes: z.array(z.object(episodeDataSchema)),
};

export async function addDataBatch(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof addDataBatchInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Episode[]> {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["write:graph"]); // 403 if auth has insufficient scopes

    const zepClient = await resolveZepClient(ctx.zepClientProvider, authInfo);

    const { episodes } = params;

    const { orgId, graphUUID } = params;

    // Ensure graph exists
    const graph = await getGraph(
        {
            logToClient: ctx.logToClient,
            zepClientProvider: zepClient,
        },
        { orgId, graphUUID },
        { authInfo },
    );
    // Add episodes to graph
    return zepClient.graph.addBatch({
        episodes,
        graphId: graph.graphId!,
    });
}

export const addDataBatchToolMetadata = {
    name: "zep_add_data_batch",
    config: {
        title: "Add DataBatch",
        description:
            "Add an episode to memory. This is the primary way to add information to the graph.",
        inputSchema: addDataBatchInputSchema,
    },
} as const satisfies ToolMetadata<typeof addDataBatchInputSchema, ZodRawShape>;

// MCP Tool
export function getAddDataBatchTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...addDataBatchToolMetadata,
        name: addDataBatchToolMetadata.name,
        cb: partial(toCallToolResultFn(addDataBatch), ctx),
    } as const satisfies Tool<typeof addDataBatchInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const addDataBatchProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${addDataBatchToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: addDataBatchToolMetadata.config.title,
        description: addDataBatchToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createAddDataBatchProcedure = toProcedurePluginFn(
    addDataBatchInputSchema,
    addDataBatch,
    addDataBatchProcedureMetadata,
);
