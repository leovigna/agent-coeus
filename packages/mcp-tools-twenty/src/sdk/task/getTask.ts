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

export const getTaskInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the task to get."),
    depth: depthSchema,
};

async function _getTask(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof getTaskInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/tasks/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.task!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getTask = withScopeCheck(
    withOrganizationUserRolesCheck(_getTask, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getTaskToolMetadata = {
    name: "twenty_getTask",
    config: {
        title: "Get Task",
        description: "Get Task in Twenty CRM",
        inputSchema: getTaskInputSchema,
    },
} as const satisfies ToolMetadata<typeof getTaskInputSchema, ZodRawShape>;

export function getTaskToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...getTaskToolMetadata,
        name: getTaskToolMetadata.name,
        cb: partial(toCallToolResultFn(getTask), ctx),
    } as const satisfies Tool<typeof getTaskInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getTaskProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/tasks/{id}",
        tags: ["twenty/tasks"],
        summary: getTaskToolMetadata.config.title,
        description: getTaskToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getTaskProcedureFactory = toProcedurePluginFn(
    getTaskInputSchema,
    getTask,
    getTaskProcedureMetadata,
);
