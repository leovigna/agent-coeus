# Templates
We have several templates in this repo that serve as pre-configured project structures. This keeps the initial build tooling consistent such as the package.json configuration, shared eslint/esbuild/tsconfig rules, common build/test scripts, testing framework, and more.

* Some templates might be missing from the repo since the user may have not have needed them before: Ask the user to add the template if you need to use it.
* Do NOT modify templates unless with explicit precise confirmation from the user

## How To Use Templates
When creating a new sdk/backend/frontend you should always first start with a template or ask the user to add a template if you need one.
* Copy over the best template (eg. starter-typescript for TS libraries, starter-react for React projects) and rename folder (eg. my-sdk)
* Update the package.json with the package name, add any additional dependencies the project might need (both devDependencies and regular dependencies). Note these could also be local workspace dependencies
* Update the `/src` folder the new packages source code instead of the hello world example in hello.ts

## Typescript Template
Cline uses the [starter-typescript](../packages/starter-typescript/) template for any new Typescript projects that simply create an SDK or generic Typescript library. This is the most general Typescript template and is only opinionated with regards to build tools and their configuration (esbuild, vite, eslint).

## React Template
Cline uses the [starter=react](../packages/starter-react/) template for any new React projects. This template is more opinionated, adding ShadCN, Tanstack Query, Tanstack Router, Tailwind CSS and other patterns as a base for all React projects.
