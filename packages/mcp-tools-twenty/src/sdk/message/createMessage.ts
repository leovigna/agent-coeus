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

import { MessageSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createMessageInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    message: MessageSchema,
};

async function _createMessage(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createMessageInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, message } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/messages", { body: message });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createMessage!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const createMessage = withScopeCheck(
    withOrganizationUserRolesCheck(_createMessage, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const createMessageToolMetadata = {
    name: "twenty_createMessage",
    config: {
        title: "Create Message",
        description: "Create Message in Twenty",
        inputSchema: createMessageInputSchema,
    },
} as const satisfies ToolMetadata<typeof createMessageInputSchema, ZodRawShape>;

export function createMessageToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createMessageToolMetadata,
        name: createMessageToolMetadata.name,
        cb: partial(toCallToolResultFn(createMessage), ctx),
    } as const satisfies Tool<typeof createMessageInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createMessageProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organizations/{orgId}/twenty/messages",
        tags: ["twenty/messages"],
        summary: createMessageToolMetadata.config.title,
        description: createMessageToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createMessageProcedureFactory = toProcedurePluginFn(
    createMessageInputSchema,
    createMessage,
    createMessageProcedureMetadata,
);
