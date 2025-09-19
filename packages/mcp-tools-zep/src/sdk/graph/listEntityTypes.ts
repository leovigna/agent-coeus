import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { getMeOrgId } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape } from "zod";

import { graphIdParamsSchema } from "../../schemas/index.js";
import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";
import { getGraph } from "../index.js";

export const listEntityTypesInputSchema = {
    ...graphIdParamsSchema,
};

// https://help.getzep.com/sdk-reference/graph/list-entity-types
export async function listEntityTypes(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof listEntityTypesInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.EntityTypeResponse> {
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

    return zepClient.graph.listEntityTypes({ graphId: graph.graphId! });
}

// MCP Tool
export const listEntityTypesToolMetadata = {
    name: "zep_list_entity_types",
    config: {
        title: "List Entity Types",
        description: "Lists all entity types from a specific graph.",
        inputSchema: listEntityTypesInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof listEntityTypesInputSchema,
    ZodRawShape
>;

export function getListEntityTypesTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    return {
        ...listEntityTypesToolMetadata,
        name: listEntityTypesToolMetadata.name,
        cb: partial(toCallToolResultFn(listEntityTypes), ctx),
    } as const satisfies Tool<typeof listEntityTypesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getListEntityTypesProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${listEntityTypesToolMetadata.name}`,
        tags: ["tools", "zep"],
        summary: listEntityTypesToolMetadata.config.title,
        description: listEntityTypesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createListEntityTypesProcedure = toProcedurePluginFn(
    listEntityTypesInputSchema,
    listEntityTypes,
    getListEntityTypesProcedureMetadata,
);
