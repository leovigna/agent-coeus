# Cline Workflow: Add New MCP Tool

This workflow automates the creation of a new tool within an existing MCP tool library, following the established three-layer architecture.

## Prerequisites

- An existing MCP tool library (e.g., `packages/mcp-tools-zep`).
- The library's client provider (e.g., `ZepClientProvider`) must be available.

---

### **Step 1: Gather Information**

1.  **Ask the user for the target library.**
    -   Example: `packages/mcp-tools-zep`
2.  **Ask the user for the new tool's name (in camelCase).**
    -   Example: `getSpecialWidget`
3.  **Ask the user for the tool's description.**
    -   Example: "Retrieves a special widget and its configuration."
4.  **Ask the user for the Zod input schema.**
    -   Provide an example: `{ widgetId: z.string().describe("The ID of the widget.") }`
5.  **Determine the core client interaction logic.**
    -   **CRITICAL:** Do not guess the implementation.
    -   **Action:** Ask the user: "What is the exact client method call to implement this tool's logic? For example, `client.widgets.get(widgetId)`."
    -   **Alternative Action:** If other tools exist in the library, read their SDK files to identify common usage patterns before asking the user.

---

### **Step 2: Generate SDK Layer**

**File to create:** `[target-library]/src/sdk/[toolName].ts`

**Template:**
```typescript
import type { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { z, ZodRawShape, ZodTypeAny } from "zod";
// Note: The provider/client import path will need to be adjusted based on the library.
import { Client } from "../Client.js";

export const {{toolName}}InputSchema = {
    // {{zodSchema}}
};

// CHOOSE ONE PATTERN:
// Pattern A: Static Client (e.g., LogTo)
export async function {{toolName}}(client: Client, params: z.objectOutputType<typeof {{toolName}}InputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    // Business logic uses 'client' directly

// Pattern B: Dynamic Client Provider (e.g., Zep)
export async function {{toolName}}(provider: ClientProvider, params: z.objectOutputType<typeof {{toolName}}InputSchema, ZodTypeAny>, { authInfo }: { authInfo: AuthInfo }): Promise<unknown> {
    const client = await provider(authInfo);
    // const { ... } = params; // Deconstruct params here

    // !!! IMPLEMENTATION LOGIC GOES HERE !!!
    // Example: return await client.widgets.get(params.widgetId);
}

export const {{toolName}}Metadata = {
    name: "{{snake_case_tool_name}}",
    config: {
        title: "{{Title Case Tool Name}}",
        description: "{{description}}",
        inputSchema: {{toolName}}InputSchema,
    },
} as const satisfies ToolMetadata<typeof {{toolName}}InputSchema, ZodRawShape>;
```

---

### **Step 3: Generate MCP Tool Adapter Layer**

**File to create:** `[target-library]/src/tools/[toolName].ts`

**Template:**
```typescript
import type { Tool } from "@coeus-agent/mcp-tools-base";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";
import { {{toolName}}, {{toolName}}Metadata } from "../sdk/{{toolName}}.js";
// Note: The provider import path will need to be adjusted.
import { Client } from "../Client.js";

async function {{toolName}}ToolCallback(...params: Parameters<typeof {{toolName}}>) {
    const result = await {{toolName}}(...params);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    } satisfies CallToolResult;
}

export function get{{ToolName}}Tool(clientOrProvider: Client | ClientProvider) {
    return {
        ...{{toolName}}Metadata,
        cb: partial({{toolName}}ToolCallback, clientOrProvider),
    } as const satisfies Tool<typeof {{toolName}}Metadata.config.inputSchema, ZodRawShape>;
}
```

---

### **Step 4: Generate tRPC Procedure Plugin Layer**

**File to create:** `[target-library]/src/procedures/[toolName].ts`

**Template:**
```typescript
import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";
import { {{toolName}}, {{toolName}}Metadata } from "../sdk/{{toolName}}.js";
// Note: The provider import path will need to be adjusted.
import { Client } from "../Client.js";

export function create{{ToolName}}Procedure(clientOrProvider: Client | ClientProvider, tags = ["tools"]) {
    const {{toolName}}WithProvider = partial({{toolName}}, clientOrProvider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            // TODO: Adjust method and path as needed (e.g., GET vs POST)
            method: "POST",
            path: `/${{{toolName}}Metadata.name}`,
            tags,
            summary: {{toolName}}Metadata.config.title,
        },
    }).input(z.object({{toolName}}Metadata.config.inputSchema))
      .use(async ({ input, ctx, next }) => {
          const result = await {{toolName}}WithProvider(input, { authInfo: ctx.authInfo });
          return next({ ctx: { result } });
      });
}
```

---

### **Step 5: Update Barrel Files and Rebuild**

1.  **Append exports** to `sdk/index.ts`, `tools/index.ts`, and `procedures/index.ts`.
    -   `export * from "./{{toolName}}.js";`
2.  **Run the build command** for the target library.
    -   `pnpm --filter [target-library-name] build`

This workflow provides a structured and repeatable process for extending our MCP tool libraries.
