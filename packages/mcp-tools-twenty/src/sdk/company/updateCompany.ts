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

import { CompanySchema, depthSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updateCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the company to update."),
    company: CompanySchema,
    depth: depthSchema,
};

async function _updateCompany(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updateCompanyInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, company, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/companies/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
        body: company,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updateCompany!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updateCompany = withScopeCheck(
    withOrganizationUserRolesCheck(_updateCompany, [
        "owner",
        "admin",
        "member",
    ]),
    ["write:crm"],
);

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
        path: "/organization/{orgId}/twenty/companies/{id}",
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
