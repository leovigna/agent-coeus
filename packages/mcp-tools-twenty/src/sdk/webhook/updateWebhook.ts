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

import { WebhookSchema } from "../../schemas/metadata-components.js";
import type { TwentyMetadataClientProvider } from "../../TwentyClient.js";
import { resolveTwentyMetadataClient } from "../../TwentyClient.js";

export const updateWebhookInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the webhook to update."),
    webhook: WebhookSchema,
};

async function _updateWebhook(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
    },
    params: z.objectOutputType<typeof updateWebhookInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, webhook } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const response = await client.PATCH("/webhooks/{id}", {
        params: {
            path: { id },
        },
        body: webhook,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateOneWebhook!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updateWebhook = withScopeCheck(
    withOrganizationUserRolesCheck(_updateWebhook, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const updateWebhookToolMetadata = {
    name: "twenty_updateWebhook",
    config: {
        title: "Update Webhook",
        description: "Update Webhook in Twenty CRM",
        inputSchema: updateWebhookInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateWebhookInputSchema, ZodRawShape>;

export function updateWebhookToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    return {
        ...updateWebhookToolMetadata,
        name: updateWebhookToolMetadata.name,
        cb: partial(toCallToolResultFn(updateWebhook), ctx),
    } as const satisfies Tool<typeof updateWebhookInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updateWebhookProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organization/{orgId}/twenty/webhooks/{id}",
        tags: ["webhook"],
        summary: updateWebhookToolMetadata.config.title,
        description: updateWebhookToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateWebhookProcedureFactory = toProcedurePluginFn(
    updateWebhookInputSchema,
    updateWebhook,
    updateWebhookProcedureMetadata,
);
