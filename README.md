# Agent Coeus

Agent Coeus. The AI Assistant of the gods.

## Deploy

### Build Docker Image
As a sanity check you can build the Docker image locally.
```bash
docker build .
```

## Google Cloud Run
Deploy to Google Cloud Run [from source](https://cloud.google.com/run/docs/deploying-source-code#deploy-from-source)


```bash
gcloud run deploy coeus --env-vars-file=.env.yaml --source .
```

## Workspace Dev Tools
Comes out of the box with configuration for helpful devtools
- [pnpm](https://pnpm.io/): Efficient package manager used for [workspace](https://pnpm.io/workspaces) management configured in [pnpm-workspace.yaml](./pnpm-workspace.yaml) and hoisting configured in [.npmrc](./.npmrc)
- [fixpack](https://github.com/HenrikJoreteg/fixpack): Standardize package.json key sorting. Configured in [.fixpackrc](.fixpackrc)
- [syncpack](https://github.com/JamieMason/syncpack): Sync dependency Versions. Configured in [.syncpackrc](.syncpackrc)
- [depcheck](https://github.com/depcheck/depcheck): Eliminate unused dependencies. Configured in [.depcheckrc](.depcheckrc) (and nested packages)
- [dotenv](https://github.com/motdotla/dotenv) & [dotenv-vault](https://github.com/dotenv-org/dotenv-vault): For local & remote envvar management
- [turborepo](https://turbo.build/repo/docs): For build step caching in large monorepos with configuration in [turbo.json](./turbo.json)
- [mprocs](https://github.com/pvolok/mprocs): Run multiple commands in parrallel. Useful for dev environment setup with multiple running processes. Configured in [mprocs.yaml](./mprocs.yaml)
- [changesets](https://github.com/changesets/changesets): For automated package release management
- [esbuild](https://esbuild.github.io/): For fast Typescript transpilation to JS with shared config
- [eslint](https://eslint.org/): For linting with shared config

Additional configs include
- [.vscode/extensions.json](./.vscode/extensions.json): Recommended VSCode extensions
- [.vscode/settings.json](./.vscode/settings.json): Recommended VSCode settings
- [.github/workflows/build.yml](./github/workflows/build.yml): Github Action CI
- [.clinerules](.clinerules): Cline AI Agent configuration
