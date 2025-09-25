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

import type { TwentyMetadataClientProvider } from "../../TwentyClient.js";
import { resolveTwentyMetadataClient } from "../../TwentyClient.js";

export const getWebhookInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the webhook to get."),
};

async function _getWebhook(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
    },
    params: z.objectOutputType<typeof getWebhookInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const response = await client.GET("/webhooks/{id}", {
        params: {
            path: { id },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.webhook!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getWebhook = withScopeCheck(
    withOrganizationUserRolesCheck(_getWebhook, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getWebhookToolMetadata = {
    name: "twenty_getWebhook",
    config: {
        title: "Get Webhook",
        description: "Get Webhook in Twenty CRM",
        inputSchema: getWebhookInputSchema,
    },
} as const satisfies ToolMetadata<typeof getWebhookInputSchema, ZodRawShape>;

export function getWebhookToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    return {
        ...getWebhookToolMetadata,
        name: getWebhookToolMetadata.name,
        cb: partial(toCallToolResultFn(getWebhook), ctx),
    } as const satisfies Tool<typeof getWebhookInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getWebhookProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/webhooks/{id}",
        tags: ["twenty/webhooks"],
        summary: getWebhookToolMetadata.config.title,
        description: getWebhookToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getWebhookProcedureFactory = toProcedurePluginFn(
    getWebhookInputSchema,
    getWebhook,
    getWebhookProcedureMetadata,
);
