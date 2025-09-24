import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { withOrganizationUserRolesCheck } from "@coeus-agent/mcp-tools-logto";
import type { Zep } from "@getzep/zep-cloud";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import type { ZepClientProvider } from "../../ZepClientProvider.js";
import { resolveZepClient } from "../../ZepClientProvider.js";

export const createGraphInputSchema = {
    orgId: z
        .string()
        .describe(
            "The ID of the organization. If not provided, uses the user's current org.",
        ),
    name: z
        .string()
        .regex(/^[a-zA-Z0-9-_]+$/)
        .describe("Name of the graph, no spaces or special characters."),
    description: z.string().optional().describe("Graph description."),
};

// https://help.getzep.com/sdk-reference/graph/create
async function _createGraph(
    ctx: {
        logToClient: LogToClient;
        zepClientProvider: ZepClientProvider;
    },
    params: z.objectOutputType<typeof createGraphInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<Zep.Graph> {
    const { subject } = authInfo;
    const userId = subject!;

    const { orgId, name } = params;

    const zepClient = await resolveZepClient(ctx.zepClientProvider, orgId);
    const graphId = `${orgId}:${userId}:${name.toLowerCase()}`; // unique graphId

    return zepClient.graph.create({
        graphId,
        name,
    });
}

export const createGraph = withScopeCheck(
    withOrganizationUserRolesCheck(_createGraph, ["owner", "admin", "member"]),
    ["create:graph"],
);

// MCP Tool
export const createGraphToolMetadata = {
    name: "zep_createGraph",
    config: {
        title: "Create Graph",
        description: "Create Graph in Zep",
        inputSchema: createGraphInputSchema,
    },
} as const satisfies ToolMetadata<typeof createGraphInputSchema, ZodRawShape>;

export function createGraphToolFactory(ctx: {
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
        path: "/zep/graphs",
        tags: ["zep"],
        summary: createGraphToolMetadata.config.title,
        description: createGraphToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGraphProcedureFactory = toProcedurePluginFn(
    createGraphInputSchema,
    createGraph,
    createGraphProcedureMetadata,
);
