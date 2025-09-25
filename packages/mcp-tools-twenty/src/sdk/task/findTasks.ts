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

export const findTasksInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    filter: filterSchema.optional(),
    depth: depthSchema.optional(),
    orderBy: orderBySchema.optional(),
    limit: limitSchema.optional(),
};

async function _findTasks(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof findTasksInputSchema, z.ZodTypeAny>,
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

    const response = await client.GET("/tasks", {
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

    const data = response.data!.data!.tasks!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findTasks = withScopeCheck(
    withOrganizationUserRolesCheck(_findTasks, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const findTasksToolMetadata = {
    name: "twenty_findTasks",
    config: {
        title: "Find Tasks",
        description: "Find Tasks in Twenty CRM",
        inputSchema: findTasksInputSchema,
    },
} as const satisfies ToolMetadata<typeof findTasksInputSchema, ZodRawShape>;

export function findTasksToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...findTasksToolMetadata,
        name: findTasksToolMetadata.name,
        cb: partial(toCallToolResultFn(findTasks), ctx),
    } as const satisfies Tool<typeof findTasksInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findTasksProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/tasks",
        tags: ["task"],
        summary: findTasksToolMetadata.config.title,
        description: findTasksToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findTasksProcedureFactory = toProcedurePluginFn(
    findTasksInputSchema,
    findTasks,
    findTasksProcedureMetadata,
);
