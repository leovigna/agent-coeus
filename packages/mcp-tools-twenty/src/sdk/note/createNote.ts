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

import { NoteSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createNoteInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    note: NoteSchema,
};

async function _createNote(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createNoteInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, note } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/notes", { body: note });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createNote!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const createNote = withScopeCheck(
    withOrganizationUserRolesCheck(_createNote, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const createNoteToolMetadata = {
    name: "twenty_createNote",
    config: {
        title: "Create Note",
        description: "Create Note in Twenty",
        inputSchema: createNoteInputSchema,
    },
} as const satisfies ToolMetadata<typeof createNoteInputSchema, ZodRawShape>;

export function createNoteToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createNoteToolMetadata,
        name: createNoteToolMetadata.name,
        cb: partial(toCallToolResultFn(createNote), ctx),
    } as const satisfies Tool<typeof createNoteInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createNoteProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organization/{orgId}/twenty/notes",
        tags: ["note"],
        summary: createNoteToolMetadata.config.title,
        description: createNoteToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createNoteProcedureFactory = toProcedurePluginFn(
    createNoteInputSchema,
    createNote,
    createNoteProcedureMetadata,
);
