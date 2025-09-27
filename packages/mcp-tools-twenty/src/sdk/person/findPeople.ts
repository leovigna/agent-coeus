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

export const findPeopleInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    filter: filterSchema.optional(),
    depth: depthSchema.optional(),
    orderBy: orderBySchema.optional(),
    limit: limitSchema.optional(),
};

async function _findPeople(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof findPeopleInputSchema, z.ZodTypeAny>,
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

    const response = await client.GET("/people", {
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

    const data = response.data!.data!.people!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findPeople = withScopeCheck(
    withOrganizationUserRolesCheck(_findPeople, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const findPeopleToolMetadata = {
    name: "twenty_findPeople",
    config: {
        title: "Find People",
        description: "Find People in Twenty CRM",
        inputSchema: findPeopleInputSchema,
    },
} as const satisfies ToolMetadata<typeof findPeopleInputSchema, ZodRawShape>;

export function findPeopleToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...findPeopleToolMetadata,
        name: findPeopleToolMetadata.name,
        cb: partial(toCallToolResultFn(findPeople), ctx),
    } as const satisfies Tool<typeof findPeopleInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findPeopleProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/people",
        tags: ["twenty/people"],
        summary: findPeopleToolMetadata.config.title,
        description: findPeopleToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findPeopleProcedureFactory = toProcedurePluginFn(
    findPeopleInputSchema,
    findPeople,
    findPeopleProcedureMetadata,
);
