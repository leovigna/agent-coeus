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

## **Part 2: Adding a New Tool to a Library**

Each tool is defined in a single file that contains its core logic (SDK), its MCP tool definition, and its tRPC procedure definition. This consolidated approach simplifies the structure and reduces boilerplate.

Files are organized by feature within the `src/sdk/` directory.

*Example file location:* `src/sdk/organization/createOrganization.ts`

### **The Consolidated Tool File**

Each `[toolName].ts` file must export the following:
1.  `inputSchema`: A Zod schema for the tool's input.
2.  `[toolName]`: The core async SDK function containing the business logic.
3.  `[toolName]ToolMetadata`: A metadata object for the MCP tool.
4.  `get[ToolName]Tool`: A factory function that creates the MCP tool.
5.  `[toolName]ProcedureMetadata`: A metadata object for the tRPC procedure.
6.  `create[ToolName]Procedure`: A factory function that creates the tRPC procedure plugin.

*Example: `sdk/organization/createOrganization.ts`*
```typescript
import { AuthInfo, checkRequiredScopes, toCallToolResultFn, Tool, ToolMetadata, toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodRawShape, ZodTypeAny } from "zod";
import type { LogToClient } from "../../LogToClient.js";

// 1. Input Schema
export const createOrganizationInputSchema = {
    name: z.string().min(1).max(128).describe("The name of the organization."),
    description: z.string().max(256).optional(),
};

// 2. SDK Function
export async function createOrganization(client: LogToClient, params: z.objectOutputType<typeof createOrganizationInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    checkRequiredScopes(authInfo.scopes, ["create:org"]);
    // ... business logic ...
    const orgResponse = await client.POST("/api/organizations", { body: params });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR);
    return orgResponse.data!;
}

// 3. MCP Tool Metadata
export const createOrganizationToolMetadata = {
    name: "logto_create_organization",
    config: {
        title: "Create Organization",
        description: "Create a new organization.",
        inputSchema: createOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<typeof createOrganizationInputSchema, ZodRawShape>;

// 4. MCP Tool Factory
export function getCreateOrganizationTool(client: LogToClient) {
    return {
        ...createOrganizationToolMetadata,
        cb: partial(toCallToolResultFn(createOrganization), client),
    } as const satisfies Tool<typeof createOrganizationInputSchema, ZodRawShape>;
}

// 5. tRPC Procedure Metadata
export const createOrganizationProcedureMetadata = {
    openapi: {
        method: "POST",
        path: `/${createOrganizationToolMetadata.name}`,
        tags: ["tools", "logto"],
        summary: createOrganizationToolMetadata.config.title,
    },
} as OpenApiMeta;

// 6. tRPC Procedure Factory
export const createCreateOrganizationProcedure = toProcedurePluginFn(createOrganizationInputSchema, createOrganization, createOrganizationProcedureMetadata);
```

### **Final Step: Update Barrel Files**

Ensure the new modules are exported from the relevant `index.ts` files (e.g., `sdk/organization/index.ts` and `sdk/index.ts`).
