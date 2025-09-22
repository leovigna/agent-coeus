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
export function getCreateOrganizationTool(client: LogToClient) { /* ... */ }

// 5. tRPC Procedure Metadata
export const createOrganizationProcedureMetadata = { /* ... */ };

// 6. tRPC Procedure Factory
export const createCreateOrganizationProcedure = toProcedurePluginFn(...);
```

### **The Plugin Aggregator**

A `plugin.ts` file at the root of the `src` directory acts as the single entry point for all tRPC procedures in the package.

*   It imports all `create...Procedure` factories from the SDK files.
*   It exports a single `create...Plugin` function that takes the necessary clients and returns an object containing all the initialized procedure plugins.

*Example: `src/plugin.ts`*
```typescript
import { createCreateOrganizationProcedure, createDeleteOrganizationProcedure, ... } from "./sdk/index.js";
import type { LogToClient } from "./LogToClient.js";

export function createLogToPlugin(ctx: { logToClient: LogToClient }) {
    const createOrganization = createCreateOrganizationProcedure(ctx);
    const deleteOrganization = createDeleteOrganizationProcedure(ctx);
    // ... and so on for all procedures

    return {
        createOrganization,
        deleteOrganization,
        // ...
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
