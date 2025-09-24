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

export const createCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    company: CompanySchema,
};

export async function createCompany(
    ctx: {
        logToClient: LogToClient;
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createCompanyInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    checkRequiredScopes(scopes, ["write:crm"]); // 403 if auth has insufficient scopes

    const { orgId, company } = params;

    // Check user has access to org
    await checkOrganizationUserRoles(
        ctx.logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/companies", { body: company });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createCompany!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

// MCP Tool
export const createCompanyToolMetadata = {
    name: "twenty_createCompany",
    config: {
        title: "Create Company",
        description: "Create Company in Twenty",
        inputSchema: createCompanyInputSchema,
    },
} as const satisfies ToolMetadata<typeof createCompanyInputSchema, ZodRawShape>;

export function createCompanyToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createCompanyToolMetadata,
        name: createCompanyToolMetadata.name,
        cb: partial(toCallToolResultFn(createCompany), ctx),
    } as const satisfies Tool<typeof createCompanyInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createCompanyProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/twenty/company",
        tags: ["company"],
        summary: createCompanyToolMetadata.config.title,
        description: createCompanyToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createCompanyProcedureFactory = toProcedurePluginFn(
    createCompanyInputSchema,
    createCompany,
    createCompanyProcedureMetadata,
);
