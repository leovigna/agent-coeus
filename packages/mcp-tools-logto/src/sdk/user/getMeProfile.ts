import {
    type AuthInfo,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { z, ZodRawShape, ZodTypeAny } from "zod";

import type { LogToClient } from "../../LogToClient.js";

export const getMeProfileInputSchema = {};

// eslint-disable-next-line @typescript-eslint/require-await
export async function getMeProfile(
    _: LogToClient,
    __: z.objectOutputType<typeof getMeProfileInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;

    return { userId, scopes };
}

// MCP Tool
export const getMeProfileToolMetadata = {
    name: "logto_get_me_profile",
    config: {
        title: "Create Organization",
        description: "Create a new organization.",
        inputSchema: getMeProfileInputSchema,
    },
} as const satisfies ToolMetadata<typeof getMeProfileInputSchema, ZodRawShape>;

export function getGetMeProfileTool(client: LogToClient) {
    return {
        ...getMeProfileToolMetadata,
        cb: partial(toCallToolResultFn(getMeProfile), client),
    } as const satisfies Tool<typeof getMeProfileInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const getMeProfileProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/logto/users/me/profile",
        tags: ["logto"],
        summary: getMeProfileToolMetadata.config.title,
        description: getMeProfileToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetMeProfileProcedure = toProcedurePluginFn(
    getMeProfileInputSchema,
    getMeProfile,
    getMeProfileProcedureMetadata,
);
