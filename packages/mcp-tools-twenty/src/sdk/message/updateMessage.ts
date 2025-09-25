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

import { depthSchema, MessageSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updateMessageInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the message to update."),
    message: MessageSchema,
    depth: depthSchema,
};

async function _updateMessage(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updateMessageInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, message, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/messages/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
        body: message,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateMessage!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updateMessage = withScopeCheck(
    withOrganizationUserRolesCheck(_updateMessage, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const updateMessageToolMetadata = {
    name: "twenty_updateMessage",
    config: {
        title: "Update Message",
        description: "Update Message in Twenty CRM",
        inputSchema: updateMessageInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateMessageInputSchema, ZodRawShape>;

export function updateMessageToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...updateMessageToolMetadata,
        name: updateMessageToolMetadata.name,
        cb: partial(toCallToolResultFn(updateMessage), ctx),
    } as const satisfies Tool<typeof updateMessageInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updateMessageProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organization/{orgId}/twenty/messages/{id}",
        tags: ["message"],
        summary: updateMessageToolMetadata.config.title,
        description: updateMessageToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateMessageProcedureFactory = toProcedurePluginFn(
    updateMessageInputSchema,
    updateMessage,
    updateMessageProcedureMetadata,
);
