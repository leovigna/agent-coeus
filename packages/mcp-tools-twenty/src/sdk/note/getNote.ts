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
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { depthSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const getNoteInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the note to get."),
    depth: depthSchema,
};

async function _getNote(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof getNoteInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/notes/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.note!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getNote = withScopeCheck(
    withOrganizationUserRolesCheck(_getNote, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getNoteToolMetadata = {
    name: "twenty_getNote",
    config: {
        title: "Get Note",
        description: "Get Note in Twenty CRM",
        inputSchema: getNoteInputSchema,
    },
} as const satisfies ToolMetadata<typeof getNoteInputSchema, ZodRawShape>;

export function getNoteToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...getNoteToolMetadata,
        name: getNoteToolMetadata.name,
        cb: partial(toCallToolResultFn(getNote), ctx),
    } as const satisfies Tool<typeof getNoteInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getNoteProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/notes/{id}",
        tags: ["note"],
        summary: getNoteToolMetadata.config.title,
        description: getNoteToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getNoteProcedureFactory = toProcedurePluginFn(
    getNoteInputSchema,
    getNote,
    getNoteProcedureMetadata,
);
