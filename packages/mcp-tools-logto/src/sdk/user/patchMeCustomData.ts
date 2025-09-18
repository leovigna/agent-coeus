import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { checkRequiredScopes } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import type { LogToClient } from "../../LogToClient.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function patchMeCustomData<T extends Record<string, any>>(
    client: LogToClient,
    customData: T,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { scopes } = authInfo;
    const userId = authInfo.subject!;
    checkRequiredScopes(scopes, ["profile"]); // 403 if auth has insufficient scopes

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
