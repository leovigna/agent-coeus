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

import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const deleteNoteInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the note to delete."),
};

async function _deleteNote(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof deleteNoteInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.DELETE("/notes/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deleteNote!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deleteNote = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteNote, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const deleteNoteToolMetadata = {
    name: "twenty_deleteNote",
    config: {
        title: "Delete Note",
        description: "Delete Note in Twenty CRM",
        inputSchema: deleteNoteInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteNoteInputSchema, ZodRawShape>;

export function deleteNoteToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...deleteNoteToolMetadata,
        name: deleteNoteToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteNote), ctx),
    } as const satisfies Tool<typeof deleteNoteInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteNoteProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organization/{orgId}/twenty/notes/{id}",
        tags: ["note"],
        summary: deleteNoteToolMetadata.config.title,
        description: deleteNoteToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteNoteProcedureFactory = toProcedurePluginFn(
    deleteNoteInputSchema,
    deleteNote,
    deleteNoteProcedureMetadata,
);
