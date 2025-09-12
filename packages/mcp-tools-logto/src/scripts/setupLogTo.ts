import { createManagementApi } from "@logto/api/management";

import { LOGTO_API_INDICATOR_BASE_URL, LOGTO_M2M_CLIENT_ID, LOGTO_M2M_CLIENT_SECRET, LOGTO_TENANT_ID } from "../envvars.js";

type LogToClient = ReturnType<typeof createManagementApi>["apiClient"];

function getLogToClient() {
    if (!LOGTO_TENANT_ID) throw new Error("LOGTO_TENANT_ID is not set");
    if (!LOGTO_M2M_CLIENT_ID) throw new Error("LOGTO_M2M_CLIENT_ID is not set");
    if (!LOGTO_M2M_CLIENT_SECRET) throw new Error("LOGTO_M2M_CLIENT_SECRET is not set");

    const managementApi = createManagementApi(LOGTO_TENANT_ID, {
        clientId: LOGTO_M2M_CLIENT_ID,
        clientSecret: LOGTO_M2M_CLIENT_SECRET,
    });
    const client = managementApi.apiClient;

    return client;
}

/**
 * Creates a basic CRUD resource on LogTo with the following scopes
 * - create:resource
 * - read:resource
 * - update:resource
 * - delete:resource
 *
 * @param client
 * @param data name, indicatoer (eg. https://api.yourapp.com/<name>/)
 */
async function getOrCreateCRUDResource(client: LogToClient, { name, indicator }: { name: string; indicator: string }, scopeNames = ["create", "read", "update", "delete"]) {
    // Get or create resource
    let resource = (await client.GET("/api/resources")).data!.find(r => r.name === name);
    resource ??= (await client.POST("/api/resources", {
        body: {
            name,
            indicator,
        },
    })).data!;
    // Get resource scopes
    const resourceScopes = (await client.GET("/api/resources/{resourceId}/scopes", {
        params: { path: { resourceId: resource.id } },
    })).data!;
    // Get or create resource scope
    for (const scopeName of scopeNames) {
        let scope = resourceScopes.find(s => s.name === `${scopeName}:${resource.name}`);
        scope ??= (await client.POST("/api/resources/{resourceId}/scopes", {
            params: { path: { resourceId: resource.id } },
            body: {
                name: `${scopeName}:${resource.name}`,
                description: `${scopeName} ${resource.name}`,
            },
        })).data!;
    }

    const resourceScopesUpdated = (await client.GET("/api/resources/{resourceId}/scopes", {
        params: { path: { resourceId: resource.id } },
    })).data!;

    return {
        resource,
        resourceScopes: resourceScopesUpdated,
    };
}

/**
 * Create roles
 * @param client
 * @param roleNames
 * @returns roles
 */
async function getOrCreateRoles(client: LogToClient, roleNames: string[]) {
    // Get or create roles
    const existingRoles = (await client.GET("/api/roles")).data!;

    for (const roleName of roleNames) {
        const role = existingRoles.find(r => r.name === roleName);
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
async function getOrCreateOrganizationRoles(client: LogToClient, roleNames = ["owner", "admin", "member"]) {
    // Get or create organization roles
    const existingRoles = (await client.GET("/api/organization-roles")).data!;

    for (const roleName of roleNames) {
        const role = existingRoles.find(r => r.name === roleName);
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

    const organizationRoles = (await client.GET("/api/organization-roles")).data!;
    return organizationRoles;
}

/**
 * Sets resource scopes to a role
 * @param client
 * @param roleId
 * @param resourceScopeIds
 * @returns
 */
async function setResourceScopesToRole(client: LogToClient, roleId: string, resourceScopeIds: string[]) {
    const existingResourceScopes = (await client.GET("/api/roles/{id}/scopes", {
        params: { path: { id: roleId } },
    })).data!;
    const existingScopeIds = existingResourceScopes.map(s => s.id);

    const missingScopeIds = resourceScopeIds.filter(id => !existingScopeIds.includes(id));
    if (missingScopeIds.length > 0) {
        await client.POST("/api/roles/{id}/scopes", {
            params: { path: { id: roleId } },
            body: {
                scopeIds: missingScopeIds,
            },
        });
    }

    const resourceScopes = (await client.GET("/api/roles/{id}/scopes", {
        params: { path: { id: roleId } },
    })).data!;
    return resourceScopes;
}

/**
 * Sets resource scopes to an organization role
 * @param client
 * @param roleId
 * @param resourceScopeIds
 * @returns
 */
async function setResourceScopesToOrganizationRole(client: LogToClient, roleId: string, resourceScopeIds: string[]) {
    const existingResourceScopes = (await client.GET("/api/organization-roles/{id}/resource-scopes", {
        params: { path: { id: roleId } },
    })).data!;
    const existingScopeIds = existingResourceScopes.map(s => s.id);

    const missingScopeIds = resourceScopeIds.filter(id => !existingScopeIds.includes(id));
    if (missingScopeIds.length > 0) {
        await client.POST("/api/organization-roles/{id}/resource-scopes", {
            params: { path: { id: roleId } },
            body: {
                scopeIds: missingScopeIds,
            },
        });
    }

    const resourceScopes = (await client.GET("/api/organization-roles/{id}/resource-scopes", {
        params: { path: { id: roleId } },
    })).data!;
    return resourceScopes;
}

/*
async function getLogToData(client: LogToClient) {
    // Global Roles
    const roles = (await client.GET("/api/roles")).data!;
    // Organization Roles
    const organizationRoles = (await client.GET("/api/organization-roles")).data!;
    // Resources
    const resources = (await client.GET("/api/resources")).data!;
    console.debug({ roles, organizationRoles, resources });

    // Resource scopes (aka permissions)
    const orgResource = resources.find(r => r.name === "org");
    if (orgResource) {
        const orgResourceScopes = (await client.GET("/api/resources/{resourceId}/scopes", {
            params: { path: { resourceId: orgResource.id } },
        })).data!;
        console.debug(orgResourceScopes);
    }

    // Organization Role scopes (aka permissions)
    const ownerRole = organizationRoles.find(r => r.name === "owner");
    if (ownerRole) {
        const ownerRolePermissions = (await client.GET("/api/organization-roles/{id}/resource-scopes", {
            params: { path: { id: ownerRole.id } },
        })).data!;
        console.debug(ownerRolePermissions);
    }
}
*/

/**
 * Setup LogTo with standard SaaS resources, scopes, and roles
 * @param client LogTo client
 */
async function setupLogTo(client: LogToClient, indicatorBaseUrl: string) {
    // Create org resource with CRUD scopes
    const orgResource = await getOrCreateCRUDResource(client, {
        name: "org",
        indicator: new URL("/org/", indicatorBaseUrl).toString(),
    });
    // Org resource scopes
    const createOrgScope = orgResource.resourceScopes.find(s => s.name === "create:org")!;
    const readOrgScope = orgResource.resourceScopes.find(s => s.name === "read:org")!;
    const updateOrgScope = orgResource.resourceScopes.find(s => s.name === "update:org")!;
    const deleteOrgScope = orgResource.resourceScopes.find(s => s.name === "delete:org")!;

    // User role (Note: Go to console to set this as default role)
    const roles = await getOrCreateRoles(client, ["user"]);
    const userRole = roles.find(r => r.name === "user")!;
    // User role gets CREATE org scope
    const userResourceScopes = await setResourceScopesToRole(client, userRole.id, [createOrgScope.id]);

    // Owner/Admin/Member organization roles
    const orgRoles = await getOrCreateOrganizationRoles(client);

    // Owner roles get READ/UPDATE/DELETE org scopes
    const ownerRole = orgRoles.find(r => r.name === "owner")!;
    const ownerResourceScopes = await setResourceScopesToOrganizationRole(client, ownerRole.id, [readOrgScope.id, updateOrgScope.id, deleteOrgScope.id]);
    // Admin roles get READ/UPDATE org scopes
    const adminRole = orgRoles.find(r => r.name === "admin")!;
    const adminResourceScopes = await setResourceScopesToOrganizationRole(client, adminRole.id, [readOrgScope.id, updateOrgScope.id]);
    // Member roles get READ org scopes
    const memberRole = orgRoles.find(r => r.name === "member")!;
    const memberResourceScopes = await setResourceScopesToOrganizationRole(client, memberRole.id, [readOrgScope.id]);

    return {
        orgResource,
        userRole,
        userResourceScopes,
        orgRoles,
        ownerResourceScopes,
        adminResourceScopes,
        memberResourceScopes,
    };
}

async function main() {
    if (!LOGTO_API_INDICATOR_BASE_URL) throw new Error("LOGTO_API_INDICATOR_BASE_URL is not set");
    const indicatorBaseUrl = new URL(LOGTO_API_INDICATOR_BASE_URL);
    const client = getLogToClient();

    const result = await setupLogTo(client, indicatorBaseUrl.toString());
    console.debug(result);

    // Global role gets CREATE org scope
    // const globalRoles = (await client.GET("/api/roles")).data!;
    // const globalAdminRole = globalRoles.find(r => r.name === "admin")!;
    // const globalAdminResourceScopes = await setResourceScopesToOrganizationRole(client, globalAdminRole.id, [createOrgScope.id]);
    // console.debug({ globalRoles });
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});
