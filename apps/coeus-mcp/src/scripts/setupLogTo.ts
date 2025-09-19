/* eslint-disable @typescript-eslint/ban-ts-comment */

import { createManagementApi } from "@logto/api/management";

import {
    LOGTO_API_INDICATOR_BASE_URL,
    LOGTO_M2M_CLIENT_ID,
    LOGTO_M2M_CLIENT_SECRET,
    LOGTO_TENANT_ID,
} from "../envvars.js";

type LogToClient = ReturnType<typeof createManagementApi>["apiClient"];

// @ts-ignore unused
function getLogToClient() {
    if (!LOGTO_TENANT_ID) throw new Error("LOGTO_TENANT_ID is not set");
    if (!LOGTO_M2M_CLIENT_ID) throw new Error("LOGTO_M2M_CLIENT_ID is not set");
    if (!LOGTO_M2M_CLIENT_SECRET)
        throw new Error("LOGTO_M2M_CLIENT_SECRET is not set");

    const managementApi = createManagementApi(LOGTO_TENANT_ID, {
        clientId: LOGTO_M2M_CLIENT_ID,
        clientSecret: LOGTO_M2M_CLIENT_SECRET,
    });
    const client = managementApi.apiClient;

    return client;
}

/**
 * Create an API Resource
 *
 * @param client
 * @param data name, indicator (eg. https://api.yourapp.com/<name>/)
 * @returns resource
 */
export async function getOrCreateApiResource(
    client: LogToClient,
    { name, indicator }: { name: string; indicator: string },
) {
    // Get or create resource
    let resource = (await client.GET("/api/resources")).data!.find(
        (r) => r.name === name,
    );
    resource ??= (
        await client.POST("/api/resources", {
            body: {
                name,
                indicator,
            },
        })
    ).data!;

    return resource;
}

/**
 * Get or create API resource scopes
 * @param client
 * @param resourceId
 * @param scopes
 * @returns resource scopes
 */
async function getOrCreateApiResourceScopes(
    client: LogToClient,
    resourceId: string,
    scopes: string[],
) {
    // Get resource scopes
    const resourceScopes = (
        await client.GET("/api/resources/{resourceId}/scopes", {
            params: { path: { resourceId } },
        })
    ).data!;

    for (const scopeName of scopes) {
        let scope = resourceScopes.find((s) => s.name === scopeName);

        scope ??= (
            await client.POST("/api/resources/{resourceId}/scopes", {
                params: { path: { resourceId } },
                body: {
                    name: scopeName,
                    description: scopeName.split(":").join(" "),
                },
            })
        ).data!;
    }

    const resourceScopesUpdated = (
        await client.GET("/api/resources/{resourceId}/scopes", {
            params: { path: { resourceId } },
        })
    ).data!;

    return resourceScopesUpdated;
}

/**
 * Create roles
 * @param client
 * @param roleNames
 * @returns roles
 */
export async function getOrCreateRoles(
    client: LogToClient,
    roleNames: string[],
) {
    // Get or create roles
    const existingRoles = (await client.GET("/api/roles")).data!;

    for (const roleName of roleNames) {
        const role = existingRoles.find((r) => r.name === roleName);
        if (!role) {
            await client.POST("/api/roles", {
                body: {
                    name: roleName,
                    description: `${roleName} role`,
                    type: "User",
                },
            });
        }
    }

    const roles = (await client.GET("/api/roles")).data!;
    return roles;
}

/**
 * Create basic organization roles: owner, admin, member
 * @param client
 * @param roleNames
 * @returns organization roles
 */
export async function getOrCreateOrganizationRoles(
    client: LogToClient,
    roleNames = ["owner", "admin", "member"],
) {
    // Get or create organization roles
    const existingRoles = (await client.GET("/api/organization-roles")).data!;

    for (const roleName of roleNames) {
        const role = existingRoles.find((r) => r.name === roleName);
        if (!role) {
            await client.POST("/api/organization-roles", {
                body: {
                    name: roleName,
                    description: `${roleName} role`,
                    type: "User",
                    organizationScopeIds: [],
                    resourceScopeIds: [],
                },
            });
        }
    }

    const organizationRoles = (await client.GET("/api/organization-roles"))
        .data!;
    return organizationRoles;
}

/**
 * Sets resource scopes to a role
 * @param client
 * @param roleId
 * @param resourceScopeIds
 * @returns
 */
export async function setResourceScopesToRole(
    client: LogToClient,
    roleId: string,
    resourceScopeIds: string[],
) {
    const existingResourceScopes = (
        await client.GET("/api/roles/{id}/scopes", {
            params: { path: { id: roleId } },
        })
    ).data!;
    const existingScopeIds = existingResourceScopes.map((s) => s.id);

    const missingScopeIds = resourceScopeIds.filter(
        (id) => !existingScopeIds.includes(id),
    );
    if (missingScopeIds.length > 0) {
        await client.POST("/api/roles/{id}/scopes", {
            params: { path: { id: roleId } },
            body: {
                scopeIds: missingScopeIds,
            },
            parseAs: "stream",
        });
    }

    const resourceScopes = (
        await client.GET("/api/roles/{id}/scopes", {
            params: { path: { id: roleId } },
        })
    ).data!;
    return resourceScopes;
}

/**
 * Sets resource scopes to an organization role
 * @param client
 * @param roleId
 * @param resourceScopeIds
 * @returns
 */
async function setResourceScopesToOrganizationRole(
    client: LogToClient,
    roleId: string,
    resourceScopeIds: string[],
) {
    const existingResourceScopes = (
        await client.GET("/api/organization-roles/{id}/resource-scopes", {
            params: { path: { id: roleId } },
        })
    ).data!;
    const existingScopeIds = existingResourceScopes.map((s) => s.id);

    const missingScopeIds = resourceScopeIds.filter(
        (id) => !existingScopeIds.includes(id),
    );
    if (missingScopeIds.length > 0) {
        await client.POST("/api/organization-roles/{id}/resource-scopes", {
            params: { path: { id: roleId } },
            body: {
                scopeIds: missingScopeIds,
            },
            parseAs: "stream",
        });
    }

    const resourceScopes = (
        await client.GET("/api/organization-roles/{id}/resource-scopes", {
            params: { path: { id: roleId } },
        })
    ).data!;
    return resourceScopes;
}

// Helper to create standard CRUD scopes
function getCrudScopes(resourceName: string) {
    return [
        `list:${resourceName}s`,
        `create:${resourceName}`,
        `read:${resourceName}`,
        `update:${resourceName}`,
        `delete:${resourceName}`,
    ];
}

/**
 * Setup LogTo with standard SaaS resources, scopes, and roles
 * @param client LogTo client
 */
export async function setupLogTo(
    client: LogToClient,
    indicatorBaseUrl: string,
) {
    // Create MCP API resource with CRUD scopes
    const mcpResource = await getOrCreateApiResource(client, {
        name: "mcp",
        indicator: new URL("/mcp/", indicatorBaseUrl).toString(),
    });
    // Make default resource (to get JWT with this audience)
    await client.PATCH("/api/resources/{id}/is-default", {
        params: { path: { id: mcpResource.id } },
        body: {
            isDefault: true,
        },
    });

    // Resource scopes
    const resourceScopes = await getOrCreateApiResourceScopes(
        client,
        mcpResource.id,
        [
            ...getCrudScopes("org"),
            ...getCrudScopes("graph"),
            "read:user:custom-data",
            "update:user:custom-data",
        ],
    );
    const listOrgsScope = resourceScopes.find((s) => s.name === "list:orgs")!;
    const createOrgScope = resourceScopes.find((s) => s.name === "create:org")!;
    const readOrgScope = resourceScopes.find((s) => s.name === "read:org")!;
    const updateOrgScope = resourceScopes.find((s) => s.name === "update:org")!;
    const deleteOrgScope = resourceScopes.find((s) => s.name === "delete:org")!;
    const listGraphsScope = resourceScopes.find(
        (s) => s.name === "list:graphs",
    )!;
    const createGraphScope = resourceScopes.find(
        (s) => s.name === "create:graph",
    )!;
    const readGraphScope = resourceScopes.find((s) => s.name === "read:graph")!;
    const updateGraphScope = resourceScopes.find(
        (s) => s.name === "update:graph",
    )!;
    const deleteGraphScope = resourceScopes.find(
        (s) => s.name === "delete:graph",
    )!;
    const readUserCustomDataScope = resourceScopes.find(
        (s) => s.name === "read:user:custom-data",
    )!;
    const updateUserCustomDataScope = resourceScopes.find(
        (s) => s.name === "update:user:custom-data",
    )!;

    // User role (Note: Go to console to set this as default role)
    const roles = await getOrCreateRoles(client, ["user"]);
    const userRole = roles.find((r) => r.name === "user")!;
    // Make default role (to get this role assigned to new users)
    await client.PATCH("/api/roles/{id}", {
        params: { path: { id: userRole.id } },
        body: {
            isDefault: true,
        },
    });
    // User: create:org list:orgs
    const userResourceScopes = await setResourceScopesToRole(
        client,
        userRole.id,
        [
            createOrgScope.id,
            listOrgsScope.id,
            readUserCustomDataScope.id,
            updateUserCustomDataScope.id,
        ],
    );

    // Owner/Admin/Member organization roles
    const orgRoles = await getOrCreateOrganizationRoles(client);

    // Owner: read:org update:org delete:org list:graphs create:graph read:graph update:graph delete:graph
    const ownerRole = orgRoles.find((r) => r.name === "owner")!;
    const ownerResourceScopes = await setResourceScopesToOrganizationRole(
        client,
        ownerRole.id,
        [
            readOrgScope.id,
            updateOrgScope.id,
            deleteOrgScope.id,
            createGraphScope.id,
            listGraphsScope.id,
            readGraphScope.id,
            updateGraphScope.id,
            deleteGraphScope.id,
        ],
    );
    // Admin: read:org update:org list:graphs create:graph read:graph update:graph delete:graph
    const adminRole = orgRoles.find((r) => r.name === "admin")!;
    const adminResourceScopes = await setResourceScopesToOrganizationRole(
        client,
        adminRole.id,
        [
            readOrgScope.id,
            updateOrgScope.id,
            listGraphsScope.id,
            createGraphScope.id,
            readGraphScope.id,
            updateGraphScope.id,
            deleteGraphScope.id,
        ],
    );
    // Member: read:org list:graphs create:graph read:graph update:graph
    const memberRole = orgRoles.find((r) => r.name === "member")!;
    const memberResourceScopes = await setResourceScopesToOrganizationRole(
        client,
        memberRole.id,
        [
            readOrgScope.id,
            listGraphsScope.id,
            createGraphScope.id,
            readGraphScope.id,
            updateGraphScope.id,
        ],
    );

    return {
        mcpResource,
        userRole,
        userResourceScopes,
        orgRoles,
        ownerResourceScopes,
        adminResourceScopes,
        memberResourceScopes,
    };
}

export async function deleteAllOrgs(client: LogToClient) {
    const orgs = (await client.GET("/api/organizations")).data!;
    for (const org of orgs) {
        await client.DELETE("/api/organizations/{id}", {
            params: { path: { id: org.id } },
        });
    }
}

async function main() {
    if (!LOGTO_API_INDICATOR_BASE_URL)
        throw new Error("LOGTO_API_INDICATOR_BASE_URL is not set");
    const indicatorBaseUrl = new URL(LOGTO_API_INDICATOR_BASE_URL);
    const client = getLogToClient();
    const result = await setupLogTo(client, indicatorBaseUrl.toString());
    console.debug(result);
    // await deleteAllOrgs(client);
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});
