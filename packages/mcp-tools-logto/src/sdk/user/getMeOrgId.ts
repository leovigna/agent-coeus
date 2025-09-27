import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import type { LogToClient } from "../../LogToClient.js";
import { createOrganization } from "../organization/createOrganization.js";

import { patchMeCustomData } from "./patchMeCustomData.js";

/**
 * Get (or create) current user org id (no role check)
 * @param client
 * @param authInfo
 * @returns
 */
export async function getMeOrgId(
    ctx: { logToClient: LogToClient },
    { authInfo }: { authInfo: AuthInfo },
): Promise<string> {
    const { logToClient: client } = ctx;
    const userId = authInfo.subject!;
    // Get current orgId
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
    const userCustomData = userCustomDataResponse.data! as unknown as {
        currentOrgId?: string;
    };
    let orgId = userCustomData.currentOrgId;

    if (!orgId) {
        // Create personal org
        const org = await createOrganization(
            ctx,
            {
                name: "Personal",
                description: "Personal Organization",
            },
            { authInfo },
        );
        orgId = org.id;
        // Set as personal org
        await patchMeCustomData(ctx, { currentOrgId: orgId }, { authInfo });
    }

    return orgId;
}
