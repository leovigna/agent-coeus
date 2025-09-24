import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import { CompanySchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updateCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the company to update."),
    company: CompanySchema,
};

export async function updateCompany(
    ctx: {
        logToClient: LogToClient;
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updateCompanyInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["write:crm"]); // 403 if auth has insufficient scopes

    const { orgId, id, company } = params;

    // Check user has access to org
    await checkOrganizationUserRoles(
        ctx,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/companies/{id}", {
        params: { path: { id } },
        body: company,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateCompany!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

// MCP Tool
export const updateCompanyToolMetadata = {
    name: "twenty_updateCompany",
    config: {
        title: "Update Company",
        description: "Update Company in Twenty CRM",
        inputSchema: updateCompanyInputSchema,
    },
} as const satisfies ToolMetadata<typeof updateCompanyInputSchema, ZodRawShape>;

export function updateCompanyToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...updateCompanyToolMetadata,
        name: updateCompanyToolMetadata.name,
        cb: partial(toCallToolResultFn(updateCompany), ctx),
    } as const satisfies Tool<typeof updateCompanyInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updateCompanyProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/twenty/company/{id}",
        tags: ["company"],
        summary: updateCompanyToolMetadata.config.title,
        description: updateCompanyToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updateCompanyProcedureFactory = toProcedurePluginFn(
    updateCompanyInputSchema,
    updateCompany,
    updateCompanyProcedureMetadata,
);
