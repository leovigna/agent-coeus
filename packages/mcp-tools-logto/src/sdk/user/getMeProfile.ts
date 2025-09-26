import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
    withScopeCheck,
} from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape, ZodTypeAny } from "zod";

import type { LogToClient } from "../../LogToClient.js";

export const getMeProfileInputSchema = {};

async function _getMeProfile(
    ctx: { logToClient: LogToClient },
    _: z.objectOutputType<typeof getMeProfileInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const { scopes } = authInfo;
    const userId = authInfo.subject!;

    const userCustomDataResponse = await client.GET(
        "/api/users/{userId}/custom-data",
        {
            params: {
                path: {
                    userId,
                },
            },
        },
    );
    if (!userCustomDataResponse.response.ok)
        throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const userCustomData = userCustomDataResponse.data!;

    return { userId, scopes, currentOrgId: userCustomData.currentOrgId };
}

export const getMeProfile = withScopeCheck(_getMeProfile, [
    "read:user:custom-data",
]);

// MCP Tool
export const getMeProfileToolMetadata = {
    name: "logto_getMeProfile",
    config: {
        title: "Get Me Profile",
        description: "Get Me Profile in LogTo",
        inputSchema: getMeProfileInputSchema,
    },
} as const satisfies ToolMetadata<typeof getMeProfileInputSchema, ZodRawShape>;

export function getMeProfileToolFactory(ctx: { logToClient: LogToClient }) {
    return {
        ...getMeProfileToolMetadata,
        name: getMeProfileToolMetadata.name,
        cb: partial(toCallToolResultFn(getMeProfile), ctx),
    } as const satisfies Tool<typeof getMeProfileInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getMeProfileProcedureMetadata = {
    openapi: {
        method: "GET",
        path: "/me/profile",
        tags: ["logto/me"],
        summary: getMeProfileToolMetadata.config.title,
        description: getMeProfileToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getMeProfileProcedureFactory = toProcedurePluginFn(
    getMeProfileInputSchema,
    getMeProfile,
    getMeProfileProcedureMetadata,
);
