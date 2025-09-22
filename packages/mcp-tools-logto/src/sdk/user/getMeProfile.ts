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

import { getMeCustomData } from "./getMeCustomData.js";

export const getMeProfileInputSchema = {};

export async function getMeProfile(
    client: LogToClient,
    _: z.objectOutputType<typeof getMeProfileInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;

    const userCustomData = (await getMeCustomData(client, {
        authInfo,
    })) as unknown as { currentOrgId?: string };

    return { userId, scopes, currentOrgId: userCustomData.currentOrgId };
}

// MCP Tool
export const getMeProfileToolMetadata = {
    name: "logto_get_me_profile",
    config: {
        title: "Get Me Profile",
        description: "Get the profile of the authenticated user.",
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
