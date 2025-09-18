# Cline Workflow: Add New MCP Tool

This workflow automates the creation of a new tool within an existing MCP tool library, following the established consolidated pattern.

## Prerequisites

- An existing MCP tool library (e.g., `packages/mcp-tools-logto`).

---

### **Step 1: Gather Information**

1.  **Ask the user for the target library.**
    -   Example: `packages/mcp-tools-logto`
2.  **Ask the user for the feature group (e.g., organization, user).**
    -   Example: `organization`
3.  **Ask the user for the new tool's name (in camelCase).**
    -   Example: `getOrganizationDetails`
4.  **Ask the user for the tool's description.**
    -   Example: "Retrieves the detailed profile of a specific organization."
5.  **Ask the user for the Zod input schema.**
    -   Provide an example: `{ organizationId: z.string().describe("The ID of the organization.") }`
6.  **Determine the core client interaction logic.**
    -   **CRITICAL:** Do not guess the implementation.
    -   **Action:** Ask the user for the exact client method call(s).
    -   **Alternative Action:** Read existing SDK files in the same feature group to identify patterns.

---

### **Step 2: Generate Consolidated Tool File**

**File to create:** `[target-library]/src/sdk/[feature]/[toolName].ts`

**Template:**
```typescript
import { AuthInfo, checkRequiredScopes, toCallToolResultFn, Tool, ToolMetadata, toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodRawShape, ZodTypeAny } from "zod";
// Note: The client import path will need to be adjusted.
import type { Client } from "../../Client.js";

// 1. Input Schema
export const {{toolName}}InputSchema = {
    // {{zodSchema}}
};

// 2. SDK Function
export async function {{toolName}}(client: Client, params: z.objectOutputType<typeof {{toolName}}InputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }) {
    // ... business logic ...
}

// 3. MCP Tool Metadata
export const {{toolName}}ToolMetadata = {
    name: "logto_{{snake_case_tool_name}}",
    config: {
        title: "{{Title Case Tool Name}}",
        description: "{{description}}",
        inputSchema: {{toolName}}InputSchema,
    },
} as const satisfies ToolMetadata<typeof {{toolName}}InputSchema, ZodRawShape>;

// 4. MCP Tool Factory
export function get{{ToolName}}Tool(client: Client) {
    return {
        ...{{toolName}}ToolMetadata,
        cb: partial(toCallToolResultFn({{toolName}}), client),
    } as const satisfies Tool<typeof {{toolName}}InputSchema, ZodRawShape>;
}

// 5. tRPC Procedure Metadata
export const {{toolName}}ProcedureMetadata = {
    openapi: {
        // TODO: Adjust method and path
        method: "POST",
        path: `/${{{toolName}}ToolMetadata.name}`,
        tags: ["tools", "logto"],
        summary: {{toolName}}ToolMetadata.config.title,
    },
} as OpenApiMeta;

// 6. tRPC Procedure Factory
export const create{{ToolName}}Procedure = toProcedurePluginFn({{toolName}}InputSchema, {{toolName}}, {{toolName}}ProcedureMetadata);
```

---

### **Step 3: Update Barrel Files and Rebuild**

1.  **Append exports** to the relevant `index.ts` files.
2.  **Run the build command** for the target library.
