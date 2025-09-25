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

export const deleteCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the company to delete."),
};

async function _deleteCompany(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof deleteCompanyInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.DELETE("/companies/{id}", {
        params: { path: { id } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.deleteCompany!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const deleteCompany = withScopeCheck(
    withOrganizationUserRolesCheck(_deleteCompany, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

// MCP Tool
export const deleteCompanyToolMetadata = {
    name: "twenty_deleteCompany",
    config: {
        title: "Delete Company",
        description: "Delete Company in Twenty CRM",
        inputSchema: deleteCompanyInputSchema,
    },
} as const satisfies ToolMetadata<typeof deleteCompanyInputSchema, ZodRawShape>;

export function deleteCompanyToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...deleteCompanyToolMetadata,
        name: deleteCompanyToolMetadata.name,
        cb: partial(toCallToolResultFn(deleteCompany), ctx),
    } as const satisfies Tool<typeof deleteCompanyInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const deleteCompanyProcedureMetadata = {
    openapi: {
        method: "DELETE",
        path: "/organizations/{orgId}/twenty/companies/{id}",
        tags: ["company"],
        summary: deleteCompanyToolMetadata.config.title,
        description: deleteCompanyToolMetadata.config.description,
    },
} as OpenApiMeta;

export const deleteCompanyProcedureFactory = toProcedurePluginFn(
    deleteCompanyInputSchema,
    deleteCompany,
    deleteCompanyProcedureMetadata,
);
