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

export const getPersonInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the person to get."),
    depth: depthSchema,
};

async function _getPerson(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof getPersonInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.GET("/people/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.person!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const getPerson = withScopeCheck(
    withOrganizationUserRolesCheck(_getPerson, ["owner", "admin", "member"]),
    ["read:crm"],
);

// MCP Tool
export const getPersonToolMetadata = {
    name: "twenty_getPerson",
    config: {
        title: "Get Person",
        description: "Get Person in Twenty CRM",
        inputSchema: getPersonInputSchema,
    },
} as const satisfies ToolMetadata<typeof getPersonInputSchema, ZodRawShape>;

export function getPersonToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...getPersonToolMetadata,
        name: getPersonToolMetadata.name,
        cb: partial(toCallToolResultFn(getPerson), ctx),
    } as const satisfies Tool<typeof getPersonInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getPersonProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/organizations/{orgId}/twenty/people/{id}",
        tags: ["person"],
        summary: getPersonToolMetadata.config.title,
        description: getPersonToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getPersonProcedureFactory = toProcedurePluginFn(
    getPersonInputSchema,
    getPerson,
    getPersonProcedureMetadata,
);
