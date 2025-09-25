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

import { depthSchema, TaskSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updateTaskInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the task to update."),
    task: TaskSchema,
    depth: depthSchema,
};

async function _updateTask(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updateTaskInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, task, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/tasks/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
        body: task,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateTask!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updateTask = withScopeCheck(
    withOrganizationUserRolesCheck(_updateTask, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const updateTaskToolMetadata = {
    name: "twenty_updateTask",
    config: {
        title: "Update Task",
        description: "Update Task in Twenty CRM",
        inputSchema: updateTaskInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateTaskInputSchema, ZodRawShape>;

export function updateTaskToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...updateTaskToolMetadata,
        name: updateTaskToolMetadata.name,
        cb: partial(toCallToolResultFn(updateTask), ctx),
    } as const satisfies Tool<typeof updateTaskInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updateTaskProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organizations/{orgId}/twenty/tasks/{id}",
        tags: ["task"],
        summary: updateTaskToolMetadata.config.title,
        description: updateTaskToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateTaskProcedureFactory = toProcedurePluginFn(
    updateTaskInputSchema,
    updateTask,
    updateTaskProcedureMetadata,
);
