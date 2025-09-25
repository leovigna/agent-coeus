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

import { CompanySchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    company: CompanySchema,
};

async function _createCompany(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createCompanyInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, company } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/companies", { body: company });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createCompany!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const createCompany = withScopeCheck(
    withOrganizationUserRolesCheck(_createCompany, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

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
        path: "/organizations/{orgId}/twenty/companies",
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
