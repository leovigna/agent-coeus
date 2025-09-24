import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { withScopeCheck } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import type { LogToClient } from "../../LogToClient.js";

async function _getMeCustomData(
    ctx: { logToClient: LogToClient },
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userCustomData as unknown as Record<string, any>;
}

export const getMeCustomData = withScopeCheck(_getMeCustomData, [
    "read:user:custom-data",
]);
