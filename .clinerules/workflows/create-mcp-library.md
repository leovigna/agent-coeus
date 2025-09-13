# Cline Workflow: Create New MCP Tool Library

This workflow automates the creation of a new, empty MCP tool library from the standard TypeScript template.

## Prerequisites

- The `templates/starter-typescript` directory must exist.

---

### **Step 1: Gather Information**

1.  **Ask the user for the new library's name (kebab-case).**
    -   Example: `mcp-tools-stripe`
2.  **Ask the user for the package scope.**
    -   Example: `@coeus-agent`
3.  **Ask the user for a short description.**
    -   Example: "MCP Tools for interacting with the Stripe API."

---

### **Step 2: Scaffold from Template**

1.  **Execute the copy command.**
    -   `cp -R templates/starter-typescript packages/{{library-name}}`

---

### **Step 3: Update `package.json`**

1.  **Read the new `package.json` file.**
    -   `packages/{{library-name}}/package.json`
2.  **Perform a series of replacements:**
    -   Replace `"@coeus-agent/starter-typescript"` with `"{{package-scope}}/{{library-name}}"`.
    -   Replace the placeholder description with the user-provided description.
3.  **Add the required dependencies.**
    -   Insert the following JSON block into the `package.json`.

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
*Note: Remind the user to add any service-specific SDKs (e.g., `stripe`) as `peerDependencies` manually.*

---

### **Step 4: Clean Up `src` Directory**

1.  **Delete the placeholder file.**
    -   `rm packages/{{library-name}}/src/hello.ts`
2.  **Keep the test file.**
    -   `packages/{{library-name}}/src/index.test.ts` remains untouched to ensure Vitest scripts function correctly.

---

### **Step 5: Install Dependencies**

1.  **Run `pnpm install` from the project root.**
    -   This will link the new workspace package and install its dependencies.
    -   `pnpm install`

This workflow provides a structured and repeatable process for creating new MCP tool libraries.
