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

import { depthSchema, NoteSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updateNoteInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the note to update."),
    note: NoteSchema,
    depth: depthSchema,
};

async function _updateNote(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updateNoteInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, note, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/notes/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
        body: note,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateNote!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updateNote = withScopeCheck(
    withOrganizationUserRolesCheck(_updateNote, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const updateNoteToolMetadata = {
    name: "twenty_updateNote",
    config: {
        title: "Update Note",
        description: "Update Note in Twenty CRM",
        inputSchema: updateNoteInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateNoteInputSchema, ZodRawShape>;

export function updateNoteToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...updateNoteToolMetadata,
        name: updateNoteToolMetadata.name,
        cb: partial(toCallToolResultFn(updateNote), ctx),
    } as const satisfies Tool<typeof updateNoteInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updateNoteProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organization/{orgId}/twenty/notes/{id}",
        tags: ["note"],
        summary: updateNoteToolMetadata.config.title,
        description: updateNoteToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateNoteProcedureFactory = toProcedurePluginFn(
    updateNoteInputSchema,
    updateNote,
    updateNoteProcedureMetadata,
);
