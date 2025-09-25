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

export const findCompaniesInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    filter: filterSchema.optional(),
    depth: depthSchema.optional(),
    orderBy: orderBySchema.optional(),
    limit: limitSchema.optional(),
};

async function _findCompanies(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof findCompaniesInputSchema, z.ZodTypeAny>,
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

    const response = await client.GET("/companies", {
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

    const data = response.data!.data!.companies!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findCompanies = withScopeCheck(
    withOrganizationUserRolesCheck(_findCompanies, [
        "owner",
        "admin",
        "member",
    ]),
    ["read:crm"],
);

// MCP Tool
export const findCompaniesToolMetadata = {
    name: "twenty_findCompanies",
    config: {
        title: "Find Companies",
        description: "Find Companies in Twenty CRM",
        inputSchema: findCompaniesInputSchema,
    },
} as const satisfies ToolMetadata<typeof findCompaniesInputSchema, ZodRawShape>;

export function findCompaniesToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...findCompaniesToolMetadata,
        name: findCompaniesToolMetadata.name,
        cb: partial(toCallToolResultFn(findCompanies), ctx),
    } as const satisfies Tool<typeof findCompaniesInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findCompaniesProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organization/{orgId}/twenty/companies",
        tags: ["company"],
        summary: findCompaniesToolMetadata.config.title,
        description: findCompaniesToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findCompaniesProcedureFactory = toProcedurePluginFn(
    findCompaniesInputSchema,
    findCompanies,
    findCompaniesProcedureMetadata,
);
