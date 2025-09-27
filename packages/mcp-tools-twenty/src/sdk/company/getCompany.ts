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

export const getCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the company to get."),
    depth: depthSchema,
};

async function _getCompany(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof getCompanyInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/companies/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.company!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getCompany = withScopeCheck(
    withOrganizationUserRolesCheck(_getCompany, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getCompanyToolMetadata = {
    name: "twenty_getCompany",
    config: {
        title: "Get Company",
        description: "Get Company in Twenty CRM",
        inputSchema: getCompanyInputSchema,
    },
} as const satisfies ToolMetadata<typeof getCompanyInputSchema, ZodRawShape>;

export function getCompanyToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...getCompanyToolMetadata,
        name: getCompanyToolMetadata.name,
        cb: partial(toCallToolResultFn(getCompany), ctx),
    } as const satisfies Tool<typeof getCompanyInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getCompanyProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/companies/{id}",
        tags: ["twenty/companies"],
        summary: getCompanyToolMetadata.config.title,
        description: getCompanyToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getCompanyProcedureFactory = toProcedurePluginFn(
    getCompanyInputSchema,
    getCompany,
    getCompanyProcedureMetadata,
);
