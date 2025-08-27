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
