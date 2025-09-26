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
import { omit, partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import type { TwentyMetadataClientProvider } from "../../TwentyClient.js";
import { resolveTwentyMetadataClient } from "../../TwentyClient.js";

export const createWebhookCoeusInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
};

/**
 * Set the Coeus Webhook if it does not exist yet
 * @param ctx
 * @param params
 * @param _
 * @returns
 */
async function _createWebhookCoeus(
    ctx: {
        twentyMetadataClientProvider: TwentyMetadataClientProvider;
        twentyWebhookUrlProvider: (orgId: string) => string;
    },
    params: z.objectOutputType<
        typeof createWebhookCoeusInputSchema,
        z.ZodTypeAny
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId } = params;

    const client = await resolveTwentyMetadataClient(
        ctx.twentyMetadataClientProvider,
        orgId,
    );

    const secret = randomBytes(32).toString("hex");

    // Check if existing webhook
    const targetUrl = ctx.twentyWebhookUrlProvider(orgId);
    // Find Twenty Webhook with targetUrl
    const findResponse = await client.GET("/webhooks");
    if (!findResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const existingWebhooks = findResponse.data!.data!.webhooks!; // parse response (a bit weird due to GraphQL adapter)
    const existingCoeusWebhook = existingWebhooks.find(
        (wh) => wh.targetUrl === targetUrl,
    );
    if (existingCoeusWebhook) {
        return omit(existingCoeusWebhook, "secret");
    }

    // Create Twenty Webhook
    const createResponse = await client.POST("/webhooks", {
        body: {
            targetUrl,
            operations: ["*.*"],
            description: "Coeus webhook",
            secret,
        },
    });
    if (!createResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = createResponse.data!.data!.createOneWebhook!; // parse response (a bit weird due to GraphQL adapter)
    return omit(data, "secret");
}

export const createWebhookCoeus = withScopeCheck(
    withOrganizationUserRolesCheck(_createWebhookCoeus, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const createWebhookCoeusToolMetadata = {
    name: "twenty_createWebhookCoeus",
    config: {
        title: "Create Webhook Coeus",
        description: "Create Webhook in Twenty to synchronize data with Coeus",
        inputSchema: createWebhookCoeusInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof createWebhookCoeusInputSchema,
    ZodRawShape
>;

export function createWebhookCoeusToolFactory(ctx: {
    logToClient: LogToClient;
    twentyMetadataClientProvider: TwentyMetadataClientProvider;
    twentyWebhookUrlProvider: (orgId: string) => string;
}) {
    return {
        ...createWebhookCoeusToolMetadata,
        name: createWebhookCoeusToolMetadata.name,
        cb: partial(toCallToolResultFn(createWebhookCoeus), ctx),
    } as const satisfies Tool<
        typeof createWebhookCoeusInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
export const createWebhookCoeusProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organizations/{orgId}/twenty/webhooks/coeus",
        tags: ["twenty/webhooks"],
        summary: createWebhookCoeusToolMetadata.config.title,
        description: createWebhookCoeusToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createWebhookCoeusProcedureFactory = toProcedurePluginFn(
    createWebhookCoeusInputSchema,
    createWebhookCoeus,
    createWebhookCoeusProcedureMetadata,
);
