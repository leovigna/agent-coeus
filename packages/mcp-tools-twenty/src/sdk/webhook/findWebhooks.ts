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
    endingBeforeSchema,
    limitSchema,
    startingAfterSchema,
} from "../../schemas/core-components.js";
import type { TwentyMetadataClientProvider } from "../../TwentyClient.js";
import { resolveTwentyMetadataClient } from "../../TwentyClient.js";

export const findWebhooksInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    startingAfter: startingAfterSchema.optional(),
    endingBefore: endingBeforeSchema.optional(),
    limit: limitSchema.optional(),
};

async function _findWebhooks(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
    },
    params: z.objectOutputType<typeof findWebhooksInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, startingAfter, endingBefore, limit } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const response = await client.GET("/webhooks", {
        params: {
            query: {
                starting_after: startingAfter,
                ending_before: endingBefore,
                limit,
            },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.webhooks!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const findWebhooks = withScopeCheck(
    withOrganizationUserRolesCheck(_findWebhooks, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const findWebhooksToolMetadata = {
    name: "twenty_findWebhooks",
    config: {
        title: "Find Webhooks",
        description: "Find Webhooks in Twenty CRM",
        inputSchema: findWebhooksInputSchema,
    },
} as const satisfies ToolMetadata<typeof findWebhooksInputSchema, ZodRawShape>;

export function findWebhooksToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    return {
        ...findWebhooksToolMetadata,
        name: findWebhooksToolMetadata.name,
        cb: partial(toCallToolResultFn(findWebhooks), ctx),
    } as const satisfies Tool<typeof findWebhooksInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const findWebhooksProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/webhooks",
        tags: ["twenty/webhooks"],
        summary: findWebhooksToolMetadata.config.title,
        description: findWebhooksToolMetadata.config.description,
    },
} as OpenApiMeta;

export const findWebhooksProcedureFactory = toProcedurePluginFn(
    findWebhooksInputSchema,
    findWebhooks,
    findWebhooksProcedureMetadata,
);
