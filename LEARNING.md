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
