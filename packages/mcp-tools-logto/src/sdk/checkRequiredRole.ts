import { checkRequiredRole } from "@coeus-agent/mcp-tools-base";
import { createError, NOT_FOUND } from "http-errors-enhanced";

import { LogToClient } from "../LogToClient.js";

/**
 * Fetch organization roles for user and throw proper HTTP Errors
 * - 404: If user not part of organization (avoids leaking valid orgIds)
 * - 403: If user is parto of organization but does not have a valid role
 * @param client
 * @param param1
 * @param validRoles
 * @returns user roles
 */
export async function checkUserOrganizationRole(client: LogToClient, { orgId, userId }: { orgId: string; userId: string }, validRoles: string[]) {
    const rolesResponse = (await client.GET("/api/organizations/{id}/users/{userId}/roles", {
        params: {
            path: {
                id: orgId,
                userId,
            },
        },
    }));
    if (!rolesResponse.response.ok) throw createError(NOT_FOUND); // 404 if user not part of organization

    const roles = rolesResponse.data!.map(r => r.name);
    checkRequiredRole(roles, validRoles); // 403 if has insufficient role

    return roles;
}
