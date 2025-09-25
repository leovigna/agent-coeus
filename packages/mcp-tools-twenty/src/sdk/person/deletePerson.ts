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

export const deletePersonInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the person to delete."),
};

async function _deletePerson(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof deletePersonInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.DELETE("/people/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deletePerson!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deletePerson = withScopeCheck(
    withOrganizationUserRolesCheck(_deletePerson, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const deletePersonToolMetadata = {
    name: "twenty_deletePerson",
    config: {
        title: "Delete Person",
        description: "Delete Person in Twenty CRM",
        inputSchema: deletePersonInputSchema,
    },
} as const satisfies ToolMetadata<typeof deletePersonInputSchema, ZodRawShape>;

export function deletePersonToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...deletePersonToolMetadata,
        name: deletePersonToolMetadata.name,
        cb: partial(toCallToolResultFn(deletePerson), ctx),
    } as const satisfies Tool<typeof deletePersonInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deletePersonProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organization/{orgId}/twenty/people/{id}",
        tags: ["person"],
        summary: deletePersonToolMetadata.config.title,
        description: deletePersonToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deletePersonProcedureFactory = toProcedurePluginFn(
    deletePersonInputSchema,
    deletePerson,
    deletePersonProcedureMetadata,
);
