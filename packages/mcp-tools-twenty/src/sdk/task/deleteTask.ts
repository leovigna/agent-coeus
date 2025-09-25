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

export const deleteTaskInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the task to delete."),
};

async function _deleteTask(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof deleteTaskInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.DELETE("/tasks/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deleteTask!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deleteTask = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteTask, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const deleteTaskToolMetadata = {
    name: "twenty_deleteTask",
    config: {
        title: "Delete Task",
        description: "Delete Task in Twenty CRM",
        inputSchema: deleteTaskInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteTaskInputSchema, ZodRawShape>;

export function deleteTaskToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...deleteTaskToolMetadata,
        name: deleteTaskToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteTask), ctx),
    } as const satisfies Tool<typeof deleteTaskInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteTaskProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organization/{orgId}/twenty/tasks/{id}",
        tags: ["task"],
        summary: deleteTaskToolMetadata.config.title,
        description: deleteTaskToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteTaskProcedureFactory = toProcedurePluginFn(
    deleteTaskInputSchema,
    deleteTask,
    deleteTaskProcedureMetadata,
);
