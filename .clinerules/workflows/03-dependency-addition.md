# Dependency Addition Workflow

1.  **Identify Need:** Determine that a new dependency is the best solution for the task.
2.  **Justify:** Formulate a clear justification for the new dependency, citing documentation or best practices.
3.  **Verify:**
    *   Check for the package's existence on the npm registry.
    *   Find the latest stable (non-beta) version.
    *   Check for consistent versions already in use within the monorepo.
4.  **Propose:** Present the justification and the specific package/version to the user.
5.  **Get Approval:** Use the `ask_followup_question` tool to get explicit approval from the user.
6.  **Install:** Once approved, add the dependency and its corresponding `@types` package (if applicable, with aligned versions) to the correct `package.json`.
