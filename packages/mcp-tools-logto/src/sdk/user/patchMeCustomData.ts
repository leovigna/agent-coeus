import type { AuthInfo, Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    checkRequiredScopes,
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodRawShape } from "zod";
import { z } from "zod";

import type { LogToClient } from "../../LogToClient.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function patchMeCustomData<T extends Record<string, any>>(
    client: LogToClient,
    customData: T,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;
    checkRequiredScopes(scopes, ["update:user:custom-data"]); // 403 if auth has insufficient scopes

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

export const setMeOrgId = patchMeCustomData<{ currentOrgId: string }>;

export const setMeOrgIdInputSchema = {
    currentOrgId: z.string().describe("Current orgId of the user"),
};

// MCP Tool
export const setMeOrgIdToolMetadata = {
    name: "logto_set_me_current_org_id",
    config: {
        title: "Set Me Current Org ID",
        description: "Set the current orgId of the authenticated user.",
        inputSchema: setMeOrgIdInputSchema,
    },
} as const satisfies ToolMetadata<typeof setMeOrgIdInputSchema, ZodRawShape>;

export function getSetMeOrgIdTool(client: LogToClient) {
    return {
        ...setMeOrgIdToolMetadata,
        cb: partial(toCallToolResultFn(setMeOrgId), client),
    } as const satisfies Tool<typeof setMeOrgIdInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const setMeOrgIdProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/logto/users/me/current-org-id",
        tags: ["logto"],
        summary: setMeOrgIdToolMetadata.config.title,
        description: setMeOrgIdToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createSetMeOrgIdProcedure = toProcedurePluginFn(
    setMeOrgIdInputSchema,
    setMeOrgId,
    setMeOrgIdProcedureMetadata,
);
