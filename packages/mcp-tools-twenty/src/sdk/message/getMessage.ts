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

import { depthSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const getMessageInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the message to get."),
    depth: depthSchema,
};

async function _getMessage(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof getMessageInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/messages/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.message!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getMessage = withScopeCheck(
    withOrganizationUserRolesCheck(_getMessage, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getMessageToolMetadata = {
    name: "twenty_getMessage",
    config: {
        title: "Get Message",
        description: "Get Message in Twenty CRM",
        inputSchema: getMessageInputSchema,
    },
} as const satisfies ToolMetadata<typeof getMessageInputSchema, ZodRawShape>;

export function getMessageToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...getMessageToolMetadata,
        name: getMessageToolMetadata.name,
        cb: partial(toCallToolResultFn(getMessage), ctx),
    } as const satisfies Tool<typeof getMessageInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getMessageProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/messages/{id}",
        tags: ["message"],
        summary: getMessageToolMetadata.config.title,
        description: getMessageToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getMessageProcedureFactory = toProcedurePluginFn(
    getMessageInputSchema,
    getMessage,
    getMessageProcedureMetadata,
);
