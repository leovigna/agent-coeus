import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { checkRequiredRole } from "@coeus-agent/mcp-tools-base";

import type { LogToClient } from "../../LogToClient.js";

import { getOrganizationUserRoles } from "./getOrganizationUserRoles.js";

/**
 * Fetch organization roles for user and throw proper HTTP Errors
 * - 404: If user not part of organization (avoids leaking valid orgIds)
 * - 403: If user is parto of organization but does not have a valid role
 * @param client
 * @param param1
 * @param validRoles
 * @returns user roles
 */
export async function checkOrganizationUserRoles(
    ctx: { logToClient: LogToClient },
    { orgId, validRoles }: { orgId: string; validRoles: string[] },
    { authInfo }: { authInfo: AuthInfo },
) {
    const roles = await getOrganizationUserRoles(ctx, { orgId }, { authInfo });
    checkRequiredRole(roles, validRoles); // 403 if has insufficient role

    return roles;
}
