# Template Creation Workflow

1.  **Find Template:** Find the most relevant template for the new package (e.g., `starter-typescript` for TS libraries, `starter-react` for React projects).
2.  **Confirm Template:** If a more relevant template might exist, confirm with the user or ask them to add it.
3.  **Copy and Rename:** Use `cp -R` to copy the template to the new package directory (e.g., `cp -R packages/starter-typescript packages/my-sdk`).
4.  **Update `package.json`:**
    *   Change the `name` field to the new package name.
    *   Add any additional dependencies required for the new package.
5.  **Update Source Code:** Replace the example source code in the `src/` directory with the new package's source code.
