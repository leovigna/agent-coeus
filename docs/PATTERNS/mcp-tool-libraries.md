# **Pattern: MCP Tool Libraries**

This document outlines the standard patterns for creating new MCP tool libraries and adding tools to them. Following these patterns ensures consistency, modularity, and maintainability across the Coeus ecosystem.

The process is divided into two main parts:
1.  **Creating the Library**: The initial setup of a new `mcp-tools-*` package.
2.  **Adding a Tool**: The layered pattern for adding a new tool within an existing library.

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

Add the following dependencies to `package.json`. These are required for the three-layer tool architecture.

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
*Note: Add any service-specific SDKs (e.g., `@getzep/zep-cloud`, `stripe`) as `peerDependencies` as well.*

### **Step 4: Install Dependencies**

Run `pnpm install` from the root of the monorepo to link the new package and install its dependencies.

---

## **Part 2: Adding a New Tool to a Library**

Once the library is created, it must be populated with tools that follow a strict three-layer architecture. This pattern separates core business logic from its exposure mechanism. The required directory structure within `src/` is:
*   `src/sdk/`: Core business logic.
*   `src/tools/`: Adapters for the MCP server.
*   `src/procedures/`: Adapters for the tRPC/OpenAPI server.

### **Layer 1: The SDK (`src/sdk/`)**

This layer contains the pure, framework-agnostic business logic.

*   **`[toolName].ts`**:
    *   Exports an `inputSchema` using Zod for validation.
    *   Exports a `metadata` object containing the tool's `name`, `title`, `description`, and `inputSchema`.
    *   Exports the main async SDK function. Its signature is `(provider, params, { authInfo })`.

*Example: `sdk/getWidget.ts`*
```typescript
import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";
import { WidgetClient, widgetClientProvider } from "../WidgetClientProvider.js";

export const getWidgetInputSchema = {
    widgetId: z.string().describe("The unique ID of the widget."),
};

export async function getWidget(provider: WidgetClientProvider, params: z.objectOutputType<typeof getWidgetInputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const widgetClient = await widgetClientProvider(authInfo);
    const { widgetId } = params;
    return await widgetClient.fetchWidget(widgetId);
}

export const getWidgetMetadata = {
    name: "get_widget",
    config: {
        title: "Get Widget",
        description: "Retrieves a specific widget by its ID.",
        inputSchema: getWidgetInputSchema,
    },
} as const satisfies ToolMetadata<typeof getWidgetInputSchema, ZodRawShape>;
```

### **Layer 2: The MCP Tool Adapter (`src/tools/`)**

This layer adapts the SDK function for consumption by the MCP server.

*   **`[toolName].ts`**:
    *   Creates a `...ToolCallback` function that calls the SDK function and formats the output into a `CallToolResult`.
    *   Exports a `get...Tool` factory function that uses `lodash/partial` to inject the client provider and bundles the metadata with the callback.

*Example: `tools/getWidget.ts`*
```typescript
import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";
import { getWidget, getWidgetMetadata } from "../sdk/getWidget.js";
import { WidgetClientProvider } from "../WidgetClientProvider.js";

export function getGetWidgetTool(provider: WidgetClientProvider) {
    return {
        ...getWidgetMetadata,
        cb: partial(toCallToolResultFn(getWidget), provider),
    } as const satisfies Tool<typeof getWidgetMetadata.config.inputSchema, ZodRawShape>;
}
```

### **Layer 3: The tRPC Procedure Plugin (`src/procedures/`)**

This layer adapts the SDK function into a modular tRPC procedure for the OpenAPI server.

*   **`[toolName].ts`**:
    *   Exports a `create...Procedure` factory function that accepts the client provider.
    *   This function defines a tRPC procedure with appropriate OpenAPI metadata (`method: 'GET'`, `path`, etc.).
    *   It uses a middleware (`.use()`) to call the SDK function and attach the result to the tRPC context (`ctx`).

*Example: `procedures/getWidget.ts`*
```typescript
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";
import { getWidget, getWidgetMetadata } from "../sdk/getWidget.js";

const getWidgetProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${getWidgetMetadata.name}/{widgetId}`,
        tags: ["tools", "widgets"],
        summary: getWidgetMetadata.config.title,
        description: getWidgetMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetWidgetProcedure = toProcedurePluginFn(getWidgetMetadata.config.inputSchema, getWidget, getWidgetProcedureMeta);
```

### **Final Step: Update Barrel Files**

Ensure the new modules are exported from the `sdk/index.ts`, `tools/index.ts`, and `procedures/index.ts` files.
