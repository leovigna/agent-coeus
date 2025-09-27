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

import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const deleteMessageInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the message to delete."),
};

async function _deleteMessage(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof deleteMessageInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.DELETE("/messages/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deleteMessage!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deleteMessage = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteMessage, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const deleteMessageToolMetadata = {
    name: "twenty_deleteMessage",
    config: {
        title: "Delete Message",
        description: "Delete Message in Twenty CRM",
        inputSchema: deleteMessageInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteMessageInputSchema, ZodRawShape>;

export function deleteMessageToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...deleteMessageToolMetadata,
        name: deleteMessageToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteMessage), ctx),
    } as const satisfies Tool<typeof deleteMessageInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteMessageProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organizations/{orgId}/twenty/messages/{id}",
        tags: ["twenty/messages"],
        summary: deleteMessageToolMetadata.config.title,
        description: deleteMessageToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteMessageProcedureFactory = toProcedurePluginFn(
    deleteMessageInputSchema,
    deleteMessage,
    deleteMessageProcedureMetadata,
);
