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

import { depthSchema, PersonSchema } from "../../schemas/core-components.js";
import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const updatePersonInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the person to update."),
    person: PersonSchema,
    depth: depthSchema,
};

async function _updatePerson(
    ctx: {
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof updatePersonInputSchema, z.ZodTypeAny>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, person, depth } = params;

    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );

    const response = await client.PATCH("/people/{id}", {
        params: {
            path: { id },
            query: { depth },
        },
        body: person,
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 Twenty API call failed

    const data = response.data!.data!.updatePerson!; // parse response (a bit weird due to GraphQL adapter)
    return data;
}

export const updatePerson = withScopeCheck(
    withOrganizationUserRolesCheck(_updatePerson, ["owner", "admin", "member"]),
    ["write:crm"],
);

// MCP Tool
export const updatePersonToolMetadata = {
    name: "twenty_updatePerson",
    config: {
        title: "Update Person",
        description: "Update Person in Twenty CRM",
        inputSchema: updatePersonInputSchema,
    },
} as const satisfies ToolMetadata<typeof updatePersonInputSchema, ZodRawShape>;

export function updatePersonToolFactory(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...updatePersonToolMetadata,
        name: updatePersonToolMetadata.name,
        cb: partial(toCallToolResultFn(updatePerson), ctx),
    } as const satisfies Tool<typeof updatePersonInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const updatePersonProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/organizations/{orgId}/twenty/people/{id}",
        tags: ["person"],
        summary: updatePersonToolMetadata.config.title,
        description: updatePersonToolMetadata.config.description,
    },
} as OpenApiMeta;

export const updatePersonProcedureFactory = toProcedurePluginFn(
    updatePersonInputSchema,
    updatePerson,
    updatePersonProcedureMetadata,
);
