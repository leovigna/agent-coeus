import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { checkRequiredScopes } from "@coeus-agent/mcp-tools-base";
import { createError, NOT_FOUND } from "http-errors-enhanced";

import type { LogToClient } from "../../LogToClient.js";

/**
 * Fetch organization roles for user
 * - 404: If user not part of organization (avoids leaking valid orgIds)
 * @param client
 * @param param1
 * @returns user roles
 */
export async function getOrganizationUserRoles(
    ctx: { logToClient: LogToClient },
    { orgId }: { orgId: string },
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient: client } = ctx;
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["read:org"]); // 403 if auth has insufficient scopes

    const rolesResponse = await client.GET(
        "/api/organizations/{id}/users/{userId}/roles",
        {
            params: {
                path: {
                    id: orgId,
                    userId,
                },
            },
        },
    );
    if (!rolesResponse.response.ok) throw createError(NOT_FOUND); // 404 if user not part of organization

    const roles = rolesResponse.data!.map((r) => r.name);
    return roles;
}
