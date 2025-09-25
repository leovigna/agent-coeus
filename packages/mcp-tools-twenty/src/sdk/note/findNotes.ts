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

import {
    depthSchema,
    endingBeforeSchema,
    filterSchema,
    limitSchema,
    orderBySchema,
    startingAfterSchema,
} from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const findNotesInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    filter: filterSchema.optional(),
    depth: depthSchema.optional(),
    orderBy: orderBySchema.optional(),
    limit: limitSchema.optional(),
};

async function _findNotes(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof findNotesInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const {
        orgId,
        startingAfter,
        endingBefore,
        filter,
        depth,
        orderBy,
        limit,
    } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/notes", {
        params: {
            query: {
                starting_after: startingAfter,
                ending_before: endingBefore,
                filter,
                depth,
                order_by: orderBy,
                limit,
            },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.notes!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findNotes = withScopeCheck(
    withOrganizationUserRolesCheck(_findNotes, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const findNotesToolMetadata = {
    name: "twenty_findNotes",
    config: {
        title: "Find Notes",
        description: "Find Notes in Twenty CRM",
        inputSchema: findNotesInputSchema,
    },
} as const satisfies ToolMetadata<typeof findNotesInputSchema, ZodRawShape>;

export function findNotesToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...findNotesToolMetadata,
        name: findNotesToolMetadata.name,
        cb: partial(toCallToolResultFn(findNotes), ctx),
    } as const satisfies Tool<typeof findNotesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findNotesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/notes",
        tags: ["note"],
        summary: findNotesToolMetadata.config.title,
        description: findNotesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findNotesProcedureFactory = toProcedurePluginFn(
    findNotesInputSchema,
    findNotes,
    findNotesProcedureMetadata,
);
