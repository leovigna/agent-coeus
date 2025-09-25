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

import { PersonSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createPersonInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    person: PersonSchema,
};

async function _createPerson(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createPersonInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, person } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.POST("/people", { body: person });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.createPerson!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const createPerson = withScopeCheck(
    withOrganizationUserRolesCheck(_createPerson, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const createPersonToolMetadata = {
    name: "twenty_createPerson",
    config: {
        title: "Create Person",
        description: "Create Person in Twenty",
        inputSchema: createPersonInputSchema,
    },
} as const satisfies ToolMetadata<typeof createPersonInputSchema, ZodRawShape>;

export function createPersonToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createPersonToolMetadata,
        name: createPersonToolMetadata.name,
        cb: partial(toCallToolResultFn(createPerson), ctx),
    } as const satisfies Tool<typeof createPersonInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createPersonProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/organizations/{orgId}/twenty/people",
        tags: ["twenty/people"],
        summary: createPersonToolMetadata.config.title,
        description: createPersonToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createPersonProcedureFactory = toProcedurePluginFn(
    createPersonInputSchema,
    createPerson,
    createPersonProcedureMetadata,
);
