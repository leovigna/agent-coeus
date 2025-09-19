import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { checkRequiredScopes } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import type { LogToClient } from "../../LogToClient.js";

export async function getMeCustomData(
    client: LogToClient,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;
    checkRequiredScopes(scopes, ["read:user:custom-data"]); // 403 if auth has insufficient scopes

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userCustomData as unknown as Record<string, any>;
}
