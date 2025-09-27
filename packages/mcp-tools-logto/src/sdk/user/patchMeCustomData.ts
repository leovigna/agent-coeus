import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape } from "zod";
import { z } from "zod";

import type { LogToClient } from "../../LogToClient.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _patchMeCustomData<T extends Record<string, any>>(
    ctx: { logToClient: LogToClient },
    customData: T,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const userId = authInfo.subject!;

    const userCustomDataResponse = await client.PATCH(
        "/api/users/{userId}/custom-data",
        {
            params: {
                path: {
                    userId,
                },
            },
            body: {
                // cast to Record<string, never> as customData can have any type
                customData: customData as unknown as Record<string, never>,
            },
        },
    );
    if (!userCustomDataResponse.response.ok)
        throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const userCustomData = userCustomDataResponse.data!;

    return userCustomData as unknown as T;
}

export const patchMeCustomData = withScopeCheck(_patchMeCustomData, [
    "write:user:custom-data",
]);

export const setMeOrgId = patchMeCustomData<{ currentOrgId: string }>;

export const setMeOrgIdInputSchema = {
    currentOrgId: z.string().describe("Current orgId of the user"),
};

// MCP Tool
export const setMeOrgIdToolMetadata = {
    name: "logto_setMeOrgId",
    config: {
        title: "Set Me Org Id",
        description: "Set Me Org Id in LogTo",
        inputSchema: setMeOrgIdInputSchema,
    },
} as const satisfies ToolMetadata<typeof setMeOrgIdInputSchema, ZodRawShape>;

export function setMeOrgIdToolFactory(ctx: { logToClient: LogToClient }) {
    return {
        ...setMeOrgIdToolMetadata,
        name: setMeOrgIdToolMetadata.name,
        cb: partial(toCallToolResultFn(setMeOrgId), ctx),
    } as const satisfies Tool<typeof setMeOrgIdInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const setMeOrgIdProcedureMetadata = {
    openapi: {
        method: "PATCH",
        path: "/me/current-org-id",
        tags: ["logto/me"],
        summary: setMeOrgIdToolMetadata.config.title,
        description: setMeOrgIdToolMetadata.config.description,
    },
} as OpenApiMeta;

export const setMeOrgIdProcedureFactory = toProcedurePluginFn(
    setMeOrgIdInputSchema,
    setMeOrgId,
    setMeOrgIdProcedureMetadata,
);
