import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { checkRequiredScopes } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import type { z, ZodTypeAny } from "zod";

import type { LogToClient } from "../../LogToClient.js";

export const getUserInputSchema = {};

export async function getUser(
    client: LogToClient,
    _: z.objectOutputType<typeof getUserInputSchema, ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;
    checkRequiredScopes(scopes, ["profile"]); // 403 if auth has insufficient scopes

    const userResponse = await client.GET("/api/users/{userId}", {
        params: {
            path: {
                userId,
            },
        },
    });
    if (!userResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const user = userResponse.data!;

    return user;
}
