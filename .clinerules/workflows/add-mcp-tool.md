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
// ... other imports

// 1. Input Schema
export const {{action}}InputSchema = { /* ... */ };

// 2. SDK Function
export async function {{action}}(client: Client, params: ..., { authInfo }: { authInfo: AuthInfo }) { /* ... */ }

// 3. MCP Tool Metadata
export const {{action}}ToolMetadata = { /* ... */ };

// 4. MCP Tool Factory
export function {{action}}ToolFactory(client: Client) { /* ... */ }

// 5. tRPC Procedure Metadata
export const {{action}}ProcedureMetadata = { /* ... */ };

// 6. tRPC Procedure Factory
export const {{action}}ProcedureFactory = toProcedurePluginFn(...);
```

---

### **Step 3: Update Plugin and Barrel Files**

1.  **Update `plugin.ts`:** Add the new `{action}ProcedureFactory` factory to the `create...Plugin` function.
2.  **Update Barrel Files:** Append exports for the new tool to the relevant `index.ts` files.
3.  **Run the build command** for the target library.
