# **Pattern: MCP Tool Libraries**

This document outlines the standard patterns for creating new MCP tool libraries and adding tools to them. Following these patterns ensures consistency, modularity, and maintainability across the Coeus ecosystem.

The process is divided into two main parts:
1.  **Creating the Library**: The initial setup of a new `mcp-tools-*` package.
2.  **Adding a Tool**: The consolidated pattern for adding a new tool within an existing library.

---

## **Part 1: Creating a New MCP Tool Library**

A "tool library" is a self-contained package (e.g., `@coeus-agent/mcp-tools-new-service`) that provides a cohesive set of functionalities.

### **Step 1: Scaffold from Template**

All new TypeScript libraries MUST be created by copying the `templates/starter-typescript` directory.

```bash
# Example: Create a new library for a "Stripe" service
cp -R templates/starter-typescript packages/mcp-tools-stripe
```

### **Step 2: Update `package.json` and `src` Directory**

Modify the `package.json` in the new directory:
1.  **`name`**: Change the package name (e.g., `"@coeus-agent/mcp-tools-stripe"`).
2.  **`description`**: Add a clear, one-sentence description.

In the `src` directory:
1.  **Delete placeholder file**: Remove the template's `src/hello.ts`.
2.  **Keep test file**: Leave `src/index.test.ts` as is. This ensures the `vitest` script in `package.json` remains functional.

### **Step 3: Add Core Dependencies**

Add the following dependencies to `package.json`.

```json
"dependencies": {
  "@coeus-agent/mcp-tools-base": "workspace:*",
  "lodash-es": "^4.17.21"
},
"peerDependencies": {
  "@modelcontextprotocol/sdk": "^1.17.4",
  "@trpc/server": "^11.5.1",
  "trpc-to-openapi": "^2.4.0",
  "zod": "^3.22.4"
},
"devDependencies": {
  "@types/lodash-es": "^4.17.12"
}
```
*Note: Add any service-specific SDKs (e.g., `stripe`) as `peerDependencies` as well.*

### **Step 4: Install Dependencies**

Run `pnpm install` from the root of the monorepo to link the new package and install its dependencies.

---

## **Part 2: The Consolidated Tool Pattern**

Each tool is defined in a **single file** that contains its core logic (SDK), its MCP tool definition, and its tRPC procedure definition. This consolidated approach simplifies the structure and reduces boilerplate. Files are organized by feature within the `src/sdk/` directory.

*Example file location:* `src/sdk/organization/createOrganization.ts`

### **The Consolidated Tool File**

Each `[action].ts` file must export the following:
1.  `{action}InputSchema`: A Zod schema for the tool's input.
2.  `{action}`: The core async SDK function containing the business logic.
3.  `{action}ToolMetadata`: A metadata object for the MCP tool.
4.  `{action}ToolFactory`: A factory function that creates the MCP tool.
5.  `{action}ProcedureMetadata`: A metadata object for the tRPC procedure.
6.  `{action}ProcedureFactory`: A factory function that creates the tRPC procedure plugin.

*Example: `sdk/organization/createOrganization.ts`*
```typescript
import { AuthInfo, checkRequiredScopes, toCallToolResultFn, Tool, ToolMetadata, toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// ... other imports

// 1. Input Schema
export const createOrganizationInputSchema = { /* ... */ };

// 2. SDK Function
export async function createOrganization(client: LogToClient, params: ..., { authInfo }: { authInfo: AuthInfo }) {
    // ... business logic ...
}

// 3. MCP Tool Metadata
export const createOrganizationToolMetadata = { /* ... */ };

// 4. MCP Tool Factory
export function createOrganizationToolFactory(client: LogToClient) { /* ... */ }

// 5. tRPC Procedure Metadata
export const createOrganizationProcedureMetadata = { /* ... */ };

// 6. tRPC Procedure Factory
export const createOrganizationProcedureFactory = toProcedurePluginFn(...);
```

### **The Plugin Aggregator**

A `plugin.ts` file at the root of the `src` directory acts as the single entry point for all tRPC procedures in the package.

*   It imports all `{action}ProcedureFactory` factories from the SDK files.
*   It exports a single `create...Plugin` function that takes the necessary clients and returns an object containing all the initialized procedure plugins.

*Example: `src/plugin.ts`*
```typescript
import { createOrganizationProcedureFactory, deleteOrganizationProcedureFactory, ... } from "./sdk/index.js";
import type { LogToClient } from "./LogToClient.js";

export function createLogToPlugin(ctx: { logToClient: LogToClient }) {
    const createOrganization = createOrganizationProcedureFactory(ctx.logToClient);
    const deleteOrganization = deleteOrganizationProcedureFactory(ctx.logToClient);
    // ... and so on for all procedures

    return {
        createOrganization,
        deleteOrganization,
        // ...
    };
}
```

### **Authorization with Higher-Order Functions**

For tools that require authorization (e.g., checking scopes or user roles), we use a pattern of wrapping the core logic with higher-order functions. This keeps the business logic clean and separates authorization concerns.

*   **`withScopeCheck`**: Ensures the authenticated user has the required permissions.
*   **`withOrganizationUserRolesCheck`**: Ensures the user is a member of the organization with a valid role.

*Example: `sdk/organization/getOrganization.ts`*
```typescript
// 1. Core logic is in a private function
async function _getOrganization(ctx: ..., params: ...) {
  // ... business logic without auth checks ...
}

// 2. Core logic is wrapped with authorization helpers
export const getOrganization = withScopeCheck(
    withOrganizationUserRolesCheck(_getOrganization, ["owner", "admin", "member"]),
    ["read:org"],
);

// 3. Factories use the wrapped function
export function getOrganizationToolFactory(ctx: ...) {
    return {
        // ...
        cb: partial(toCallToolResultFn(getOrganization), ctx),
    };
}
```

### **The Final Router (in `coeus-mcp`)**

The main server application (`coeus-mcp`) consumes these plugins to build its router in a clean, declarative way.

*Example: `apps/coeus-mcp/src/trpcAppRouter.ts`*
```typescript
import { createLogToPlugin } from "@coeus-agent/mcp-tools-logto";
import { createZepPlugin } from "@coeus-agent/mcp-tools-zep";
import { logToClient, zepClient } from "./clients/index.js";
import { publicProcedure, router } from "./trpc.js";

// 1. Initialize Plugins
const logToPlugin = createLogToPlugin({ logToClient });
const zepPlugin = createZepPlugin({ zepClientProvider: zepClient, ... });

// 2. Create Routers
const logToRouter = router({
    createOrganization: publicProcedure.concat(logToPlugin.createOrganization).mutation(...),
    deleteOrganization: publicProcedure.concat(logToPlugin.deleteOrganization).mutation(...),
    // ...
});

const zepRouter = router({
    addData: publicProcedure.concat(zepPlugin.addData).mutation(...),
    // ...
});

// 3. Combine Routers
export const appRouter = router({
    logTo: logToRouter,
    zep: zepRouter,
});

### **Pattern: OpenAPI REST Service as a Tenant Proxy**

When an MCP tool library's primary purpose is to expose an existing OpenAPI REST service, it should act as a "tenant proxy." This pattern ensures that the MCP server enforces tenancy and security while keeping the tool implementation minimal and consistent with the underlying API.

**Core Principles:**

1.  **Tenant-Aware Proxy**: The MCP server exposes the service's API under a tenant-specific base path, typically `/organization/{orgId}`. This ensures that all requests are scoped to the correct organization.
2.  **ClientProvider Pattern**: A `ClientProvider` is used to resolve the correct API client for the given `orgId`. This pattern encapsulates the logic for creating and configuring the client, including authentication.
3.  **Code Generation**:
    *   **OpenAPI JSON Spec**: An OpenAPI JSON specification is required to generate types.
    *   **`openapi-typescript`**: Generate TypeScript types from the OpenAPI specification.
    *   **`openapi-fetch`**: Use the generated types to create a fully typed API client. Note that this is not always used; other SDKs (e.g., the Zep SDK) may be used instead.
4.  **Zod Schemas**: Create Zod schemas for all API inputs (request bodies and query parameters). These schemas should map directly to the generated TypeScript types and include descriptions from the OpenAPI specification.
5.  **Client Export**: The MCP tool library should export the typed client and a client factory, as seen in `packages/mcp-tools-twenty/src/TwentyClient.ts`.

This approach provides a robust, type-safe, and maintainable way to expose existing REST services through the MCP server, while still allowing for the addition of custom business logic and authorization as needed.

*Example: `sdk/company/getCompany.ts`*
```typescript
import { AuthInfo, toCallToolResultFn, Tool, ToolMetadata, toProcedurePluginFn, withScopeCheck } from "@coeus-agent/mcp-tools-base";
import { withOrganizationUserRolesCheck } from "@coeus-agent/mcp-tools-logto";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import { z } from "zod";

import { depthSchema } from "../../schemas/core-components.js";
import { TwentyCoreClientProvider, resolveTwentyCoreClient } from "../../TwentyClient.js";

// 1. Input Schema maps to OpenAPI params
export const getCompanyInputSchema = {
    orgId: z.string().describe("The ID of the organization."),
    id: z.string().describe("The ID of the company to get."),
    depth: depthSchema,
};

// 2. SDK Function uses the ClientProvider
async function _getCompany(
    ctx: { twentyCoreClientProvider: TwentyCoreClientProvider },
    params: z.objectOutputType<typeof getCompanyInputSchema, z.ZodTypeAny>,
    _: { authInfo: AuthInfo },
) {
    const { orgId, id, depth } = params;
    const client = await resolveTwentyCoreClient(ctx.twentyCoreClientProvider, orgId);

    // 3. Mimic the REST API call
    const response = await client.GET("/companies/{id}", {
        params: { path: { id }, query: { depth } },
    });
    if (!response.response.ok) throw createError(INTERNAL_SERVER_ERROR);

    return response.data!.data!.company!;
}

// 4. Factories and Metadata follow the standard pattern
export const getCompany = withScopeCheck(...);
export const getCompanyToolMetadata = { ... };
export function getCompanyToolFactory(ctx: ...) { ... }
export const getCompanyProcedureMetadata = { ... };
export const getCompanyProcedureFactory = toProcedurePluginFn(...);
```
