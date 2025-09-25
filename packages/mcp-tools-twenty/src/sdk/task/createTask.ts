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

import { TaskSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createTaskInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    task: TaskSchema,
};

async function _createTask(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createTaskInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, task } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/tasks", { body: task });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createTask!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const createTask = withScopeCheck(
    withOrganizationUserRolesCheck(_createTask, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const createTaskToolMetadata = {
    name: "twenty_createTask",
    config: {
        title: "Create Task",
        description: "Create Task in Twenty",
        inputSchema: createTaskInputSchema,
    },
} as const satisfies ToolMetadata<typeof createTaskInputSchema, ZodRawShape>;

export function createTaskToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createTaskToolMetadata,
        name: createTaskToolMetadata.name,
        cb: partial(toCallToolResultFn(createTask), ctx),
    } as const satisfies Tool<typeof createTaskInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createTaskProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organization/{orgId}/twenty/tasks",
        tags: ["task"],
        summary: createTaskToolMetadata.config.title,
        description: createTaskToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createTaskProcedureFactory = toProcedurePluginFn(
    createTaskInputSchema,
    createTask,
    createTaskProcedureMetadata,
);
