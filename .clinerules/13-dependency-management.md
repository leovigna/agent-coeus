# Dependency Management

- Do not add any new dependencies to the project unless the user explicitly requests them.
- When proposing a new dependency, justify its need by citing documentation or best practices and ask for confirmation.
- Verify a package's existence on the npm registry before attempting to install it.
- Use the latest stable (non-beta) version of a package, preferably with a `^` prefix for semantic versioning.
- When adding a corresponding `@types` package, ensure the version is correctly aligned with the main package.
- Prioritize using the same versions of dependencies that are already in use in other packages within the monorepo for consistency.
