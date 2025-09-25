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

export const findMessagesInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    filter: filterSchema.optional(),
    depth: depthSchema.optional(),
    orderBy: orderBySchema.optional(),
    limit: limitSchema.optional(),
};

async function _findMessages(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof findMessagesInputSchema, z.ZodTypeAny>,
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

    const response = await client.GET("/messages", {
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

    const data = response.data!.data!.messages!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findMessages = withScopeCheck(
    withOrganizationUserRolesCheck(_findMessages, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const findMessagesToolMetadata = {
    name: "twenty_findMessages",
    config: {
        title: "Find Messages",
        description: "Find Messages in Twenty CRM",
        inputSchema: findMessagesInputSchema,
    },
} as const satisfies ToolMetadata<typeof findMessagesInputSchema, ZodRawShape>;

export function findMessagesToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...findMessagesToolMetadata,
        name: findMessagesToolMetadata.name,
        cb: partial(toCallToolResultFn(findMessages), ctx),
    } as const satisfies Tool<typeof findMessagesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findMessagesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organization/{orgId}/twenty/messages",
        tags: ["message"],
        summary: findMessagesToolMetadata.config.title,
        description: findMessagesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findMessagesProcedureFactory = toProcedurePluginFn(
    findMessagesInputSchema,
    findMessages,
    findMessagesProcedureMetadata,
);
