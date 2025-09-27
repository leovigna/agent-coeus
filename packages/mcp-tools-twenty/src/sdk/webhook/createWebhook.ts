import { randomBytes } from "crypto";

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

import type { Webhook } from "../../schemas/metadata-components.js";
import { WebhookSchema } from "../../schemas/metadata-components.js";
import type { TwentyMetadataClientProvider } from "../../TwentyClient.js";
import { resolveTwentyMetadataClient } from "../../TwentyClient.js";

export const createWebhookInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    webhook: WebhookSchema,
};

async function _createWebhook(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
    },
    params: z.objectOutputType<typeof createWebhookInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, webhook } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const response = await client.POST("/webhooks", {
        body: {
            ...webhook,
            secret: randomBytes(32).toString("hex"),
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data! as Webhook; // metadata api does not match OpenAPI spec
    return { ...data, secret: "hidden" };
}

export const createWebhook = withScopeCheck(
    withOrganizationUserRolesCheck(_createWebhook, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const createWebhookToolMetadata = {
    name: "twenty_createWebhook",
    config: {
        title: "Create Webhook",
        description: "Create Webhook in Twenty",
        inputSchema: createWebhookInputSchema,
    },
} as const satisfies ToolMetadata<typeof createWebhookInputSchema, ZodRawShape>;

export function createWebhookToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
}) {
    return {
        ...createWebhookToolMetadata,
        name: createWebhookToolMetadata.name,
        cb: partial(toCallToolResultFn(createWebhook), ctx),
    } as const satisfies Tool<typeof createWebhookInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createWebhookProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organizations/{orgId}/twenty/webhooks",
        tags: ["twenty/webhooks"],
        summary: createWebhookToolMetadata.config.title,
        description: createWebhookToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createWebhookProcedureFactory = toProcedurePluginFn(
    createWebhookInputSchema,
    createWebhook,
    createWebhookProcedureMetadata,
);
