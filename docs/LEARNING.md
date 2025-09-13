# Learnings

## Linting

### Always Read ESLint Rules

**Incident:** I wrote TypeScript code that did not conform to the project's linting standards.

**Correction:** The user instructed me to read the `.clinerules/linting.md` file and the relevant `eslint.config.mjs` files before writing code.

**Future Action:** I will always read the project's linting rules from the `.clinerules/` directory and both the base and project-specific ESLint configuration files to ensure my code adheres to the established standards.

### Understand Linting Rules Deeply

**Incident:** Even after reading the ESLint configuration, I failed to correctly apply a rule regarding file extensions in import paths.

**Correction:** The user pointed out that I should have a deeper understanding of the linting rules and suggested using `repomix` to fetch the ESLint source code if I am unsure about a rule.

**Future Action:** I will be more thorough in my analysis of the ESLint configurations. If I encounter a rule I do not fully understand, I will consider using `repomix` to examine the ESLint source code for clarification before proceeding.

### Use `.js` Extension for TypeScript Imports

**Incident:** I used the `.ts` extension for imports between TypeScript files, which resulted in linting errors.

**Correction:** The user informed me that the correct file extension for imports in this project is `.js`, even for `.ts` files, due to how the TypeScript compiler and module resolution are configured.

**Future Action:** I will always use the `.js` extension when importing other TypeScript files within the project to comply with the project's module resolution strategy and avoid linting errors.

## Templates

### Use `cp -R` for Template Creation

**Incident:** When creating a new application from a template, I first created the parent directory (`apps/`) and then used `cp -r` to copy the template into it. This resulted in an incorrect nested directory structure (e.g., `apps/coeus-mcp/starter-typescript`).

**Correction:** The user pointed out the error and instructed me to re-read the `.clinerules/templates.md` file.

**Future Action:** I will strictly follow the template creation workflow. I will use a single `cp -R source/template-name destination/new-app-name` command to both copy and rename the template in one atomic operation, ensuring the correct directory structure.

## Ticketing

### Follow Naming Conventions Strictly

**Incident:** I created tickets and epics with filenames that did not include their titles, making them difficult to identify in the file explorer. I also created ticket folders for epics that did not include the epic title.

**Correction:** The user instructed me to re-read the `.clinerules/tickets.md` file and update the filenames to include the titles.

**Future Action:** I will strictly adhere to the file naming conventions outlined in the ticketing rules, ensuring that all ticket, epic, and epic folder names are descriptive and easy to understand.

## Dependencies

### Do Not Add Dependencies Without Approval

**Incident:** I attempted to add `express` and `cors` as dependencies to create an HTTP server, assuming they were necessary.

**Correction:** The user explicitly instructed me not to add dependencies unless asked and pointed out that the MCP SDK itself should be sufficient.

**Future Action:** I will not add any new dependencies to the project unless the user explicitly requests them. I will always work within the constraints of the existing dependencies first.

## SDK Usage

### Verify SDK APIs Before Implementation

**Incident:** I made several incorrect attempts to instantiate `SSEServerTransport` and `StreamableHTTPServerTransport`, causing a series of TypeScript errors. This demonstrated a lack of understanding of the SDK's API.

**Correction:** The user instructed me to load the `repomix` for the MCP SDK to understand its correct usage before trying to implement the code.

**Future Action:** Before using any SDK or library, especially after encountering errors, I will first consult its documentation or use `repomix` to read its source code. This will prevent repeated trial-and-error attempts and ensure I use the APIs correctly from the start.

### Use Correct Repomix URLs

**Incident:** I used an incorrect GitHub URL when attempting to fetch a `repomix`, pointing to a user-specific fork instead of the official repository.

**Correction:** The user pointed out the mistake and instructed me to use the proper git URLs.

**Future Action:** I will always verify that the URLs I use for `repomix` point to the official, canonical repository for the library in question to ensure I am learning from the correct source of truth.

### Read Existing Code Before Refactoring

**Incident:** When refactoring the Zep tools, I did not first read the original, working implementation. This led me to guess at the Zep client's API methods (e.g., `graph.clear`, `graph.deleteEdge`), causing TypeScript errors and rework.

**Correction:** The user instructed me to always load the original implementation of a tool to understand its business logic and external API calls *before* attempting to migrate it to the new SDK pattern.

**Future Action:** When refactoring or migrating existing code, my first step will always be to read the original source file. I will not attempt to intuit or guess the implementation details, especially those involving external SDKs. I will use the working code as the primary source of truth for its logic.

### Clarify Ambiguous Requests

**Incident:** When the user asked for a way to test the MCP server, I proposed creating a new client application from a template. The user's intent was to use an *existing* tool or example, not to create a new one.

**Correction:** The user clarified their intent after I proposed an overly complex solution.

**Future Action:** When a user's request is brief or could be interpreted in multiple ways (e.g., "what's the best way to test?"), I will not immediately jump to the most involved solution. I will first consider simpler, existing solutions. If I am still unsure, I will use the `ask_followup_question` tool to clarify the user's intent and preferred approach before formulating a plan.

### Preserve TODO Comments

**Incident:** In a previous attempt, I removed existing `TODO` comments from a file I was editing, assuming they were part of the code I was replacing.

**Correction:** The user instructed me not to delete `TODO` comments unless explicitly told to, as they serve as important reminders.

**Future Action:** I will be careful to preserve all existing `TODO` comments when modifying files. I will only add or remove them if it is a specific part of the user's request.

## Communication and Decision-Making

### Justify and Confirm Adding Dependencies

**Incident:** I initially planned to add `express` but reversed course when the user told me not to add dependencies. Later, the user clarified that `express` was the correct choice as it's the recommended approach in the SDK's documentation, and that I should have explained my reasoning and asked for confirmation.

**Correction:** The user provided feedback that I should state my reasoning, justify the need for a new dependency based on best practices or documentation, and explicitly ask for permission before proceeding.

**Future Action:** When I believe a new dependency is the best technical path forward, I will not simply avoid it due to a general rule. Instead, I will:
1.  Clearly state my reasoning, citing documentation or best practices.
2.  Use the `ask_followup_question` tool to ask for the user's confirmation to add the dependency.
3.  Proceed only after receiving explicit approval. This will prevent miscommunication and ensure my actions align with both the user's intent and the project's technical needs.

## Terminal and Package Management

### Pay Close Attention to Terminal Errors

**Incident:** I failed to notice or correctly interpret a `pnpm install` error indicating that a package did not exist, and proceeded as if the installation was successful.

**Correction:** The user pointed out that I did not read the terminal error properly.

**Future Action:** I will treat terminal output, especially errors from package managers or build tools, as a critical source of information. I must carefully read and analyze every error message to correctly diagnose the state of the project and not proceed with faulty assumptions.

### Verify Package Existence Before Installing

**Incident:** I hallucinated the existence of an npm package (`@modelcontextprotocol/cli`) and attempted to add it as a dependency.

**Correction:** The user correctly identified that this package does not exist and instructed me to validate packages before attempting to use them.

**Future Action:** I will never assume a package name. Before adding a dependency, I will take steps to verify its existence on the npm registry. If I am unsure, I will search online or ask the user for the correct package name. I will also check the documentation or source code of related libraries (like the SDK) to see if they bundle or mention the required tools.

## Dependency Versioning

### Use Latest Stable Versions and Align Types

**Incident:** I added `express@5.0.0-beta.1` instead of the latest stable version. I also did not ensure the `@types/express` version was correctly aligned.

**Correction:** The user instructed me to use the latest non-beta versions for dependencies, marked with a semver minor upgrade sign (e.g., `^5.1.0`), and to ensure that the corresponding `@types` packages have aligned versions.

**Future Action:** When adding dependencies, I will:
1.  Use a command like `npm view <package-name> version` to find the latest stable (non-beta) version of a package.
2.  Use the `^` prefix for semantic versioning to allow for minor updates.
3.  When adding a corresponding `@types` package, I will check for the correct version that aligns with the main package.
4.  Prioritize using the same versions of dependencies that are already in use in other packages within the monorepo for consistency.

## Implementation Strategy

### Choose the Simplest Effective Implementation

**Incident:** I implemented a complex, stateful `express`-based server with session management by following an advanced example in the SDK's README. The user's goal was a simple, stateless server to start with. I failed to recognize that a more minimal `express` implementation was more appropriate for the immediate task.

**Correction:** The user clarified that while `express` was the correct technology choice, my implementation was overly complex for the current need. I should have identified a simpler pattern from the documentation or examples.

**Future Action:** I will always aim to match the complexity of my solution to the user's immediate requirements. When consulting documentation or examples, I will evaluate different implementation patterns (e.g., stateless vs. stateful) and choose the simplest one that fulfills the task. I will avoid implementing advanced features like session management unless they are explicitly requested or clearly necessary.

### Do Not Delete Commented-Out or Unused Code

**Incident:** I deleted commented-out code and unused variables, assuming they were no longer needed.

**Correction:** The user instructed me not to delete commented-out or unused code, as the developer may want it for later reference.

**Future Action:** I will not delete commented-out code or unused variables unless explicitly instructed to do so. I will preserve the code as it is, trusting that the developer has left it there for a reason.
