# Linting

## Typescript Linting
Typescript code should be linted using the `lint` and `lint:fix` commands as described in each package's [package.json](../packages/starter-typescript/package.json) file (starter template linked here for reference). Usually, this command will run `eslint` which will then load the [eslint.config.mjs](../packages/starter-typescript/eslint.config.mjs) file which imports our shared [eslint.config.mjs](../configs/eslint-config/eslint.config.mjs) as a base and adds any necessary overrides. When writing Typescript code, make sure to load the base eslint config file, and the project specific one to be aware of the linting rules and avoid any linting errors as you contribute code.

For more info on modern ESLint configuration, see https://eslint.org/docs/latest/use/configure/configuration-files that explains flat config files.

## Solidity Linting
Solidity code should be formatted using `forge fmt`
