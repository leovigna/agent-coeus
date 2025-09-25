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

export const deleteWebhookInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the webhook to delete."),
};

async function _deleteWebhook(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
    },
    params: z.objectOutputType<typeof deleteWebhookInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const response = await client.DELETE("/webhooks/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deleteOneWebhook!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deleteWebhook = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteWebhook, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const deleteWebhookToolMetadata = {
    name: "twenty_deleteWebhook",
    config: {
        title: "Delete Webhook",
        description: "Delete Webhook in Twenty CRM",
        inputSchema: deleteWebhookInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteWebhookInputSchema, ZodRawShape>;

export function deleteWebhookToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    return {
        ...deleteWebhookToolMetadata,
        name: deleteWebhookToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteWebhook), ctx),
    } as const satisfies Tool<typeof deleteWebhookInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteWebhookProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organizations/{orgId}/twenty/webhooks/{id}",
        tags: ["webhook"],
        summary: deleteWebhookToolMetadata.config.title,
        description: deleteWebhookToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteWebhookProcedureFactory = toProcedurePluginFn(
    deleteWebhookInputSchema,
    deleteWebhook,
    deleteWebhookProcedureMetadata,
);
