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
    ctx: { logToClient: LogToClient },
    _: z.objectOutputType<typeof getMeProfileInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;

    const userCustomData = (await getMeCustomData(ctx, {
        authInfo,
    })) as unknown as { currentOrgId?: string };

    return { userId, scopes, currentOrgId: userCustomData.currentOrgId };
}

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
        tags: ["logto"],
        summary: getMeProfileToolMetadata.config.title,
        description: getMeProfileToolMetadata.config.description,
    },
} as OpenApiMeta;

export const getMeProfileProcedureFactory = toProcedurePluginFn(
    getMeProfileInputSchema,
    getMeProfile,
    getMeProfileProcedureMetadata,
);
