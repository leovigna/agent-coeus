# Agent Coeus

Agent Coeus. The AI Assistant of the gods.

Connect CRMs, Calendars, Email & more

Coeus is an open-source knowledge graph and memory layer for AI agents and teams. Built on [Zep](https://www.getzep.com/) for shared memory and [MCP](https://modelcontextprotocol.io/) / [OpenAPI](https://www.openapis.org/) for interfaces, it ingests and continuously syncs data across apps into a unified, queryable AI-native data lake.

## Table of Contents
* [Features](#features)
    * [Supported Apps](#supported-apps)
    * [Roadmap Apps](#roadmap-apps)
* [Deploy](#deploy)
* [Contribute](#contribute)

## Features

### Supported Apps
These apps are currently live with Coeus Agent it some capacity.

**Clients**
- [Coeus GPT](https://chatgpt.com/g/g-68bea1c9625881918615156829f9b66c-coeus-gpt): Custom GPT on OpenAI's ChatGPT platform. Uses the OpenAPI interface to interact with the knowledge base. Less robust than using MCP but serves as easy solution to distribute on ChatGPT due to beta support for MCP.
- Coeus Bot (coming soon): A Telegram bot connected to the knowledge base using OpenAI API & MCP

**Memory Layer**
- [Zep](https://www.getzep.com/): Syncs memory across apps into a single searchable AI-native database with entity extraction and semantic search

**CRM**
- [Twenty CRM](https://twenty.com/): "The #1 Open-Source CRM" with fully customizable data models & automation workflows

### Roadmap Apps
Future app integrations that could be implemented based on user feedback.

**Calendar**
- [Google Calendar](https://developers.google.com/workspace/calendar/api/guides/overview)

**Email**
- [Gmail](https://developers.google.com/workspace/gmail/api/guides/overview)

## Self Host
> 🚧 Work in progress on self host instructions

> 💡Make sure to update **both** envvar files to be able to run local scripts and deploy to Google Cloud Run

The following steps should enable you to run Coeus locally / self host. You will first have to setup several services Coeus relies on.

* [Environemnt Variables](#environment-variables): These store all the credentials to the various services
* [Logto](#setup-logto): OIDC Auth provider
* [Zep](#setup-zep): Graph Memory Database

### Environment Variables
The following envvars are used by Coeus in [.env.yaml](./.env.example.yaml) (Google Cloud Run) and [./apps/coeus-mcp/.env](./apps/coeus-mcp/.env.example) (local development)

```.env.yaml
# Logto M2M
LOGTO_TENANT_ID:
LOGTO_M2M_CLIENT_ID:
LOGTO_M2M_CLIENT_SECRET:

# Logto OIDC
OIDC_CLIENT_ID:  # Non-PKCE with Client Secret
OIDC_BASE_URL:

# Zep Cloud Graph Database
ZEP_API_KEY:

```


### Setup Logto
[Logto](https://logto.io/) serves as the primary auth solution for Coeus providing features such as OIDC loging and multi-tenancy. You will have to setup Logto with Coeus to deploy it though this has been greatly simplified thanks to our usage of a setup script.

#### Logto Tenant
The Tenant encapsulate your entire userbase which can host various types of applications (aka clients).

* Create a Tenant on Logto
* Copy the Tenant ID from the url `https://cloud.logto.io/{tenantId}/get-started` to `LOGTO_TENANT_ID`

#### Logto M2M Application
The "Machine-to-machine" (M2M) Application serves to give the Coeus Agent server Logto Management API access to manage organizations, users, and general administrative operations. The M2M application is also used to run the initial setup traditional application setup script.

* Create a "Machine-to-machine" (M2M) Application
* Go to Applications (sidebar)
* Create "Machine-to-machine" Application
* Name: Admin, Description: Admin M2M Application
* Assign roles: "Logto Management API access"
* Copy "App Id" to `LOGTO_M2M_CLIENT_ID`
* Copy "Default Secret" to `LOGTO_M2M_CLIENT_SECRET`

#### Logto Traditional Application
The "Traditional Web" Application serves as the client that users will connect to when logging in to Coeus.

* Set `LOGTO_API_INDICATOR_BASE_URL` to your API's base url or just default to `https://cloud.logto.io/` (more for informational purposes)
* All `LOGTO_*` envvars should be set in [./apps/coeus-mcp/.env](./apps/coeus-mcp/.env.example) before running the setup script
* Run the Logto setup script `cd apps/coeus-mcp && pnpm setup:logto`
* Final log will be `Application Coeus ({applicationId})`
* Copy `applicationId` to `OIDC_CLIENT_ID`
* Set `https://{tenantId}.logto.app` as your `OIDC_BASE_URL` (aka "Logto Endpoint" on the Logto Dashboard)
* Go to the Logto Dashboard to see the changes
    * New "Traditional Web" Application "Coeus" created
    * New API resource "mcp" created (marked as Default API)
    * New Role "user" created
    * Organization Template updated with "owner"/"admin"/"member" roles


### Setup Zep
Zep serves as the core memory base for Coeus. Coeus is designed with multi-tenancy first approach as such users can bring their own Zep API Keys to their organization if they chose so. For those who don't however, Coeus is setup with one `ZEP_API_KEY` that serves as the default Zep client for organizations that don't bring their own keys.

* Create an account on [Zep](https://www.getzep.com/)
* Create a "Project" on Zep
* Create an API Key for the project, copy to `ZEP_API_KEY`

### Deploy
Any one of these solutions can be used to deploy Coeus.

#### Docker Image
> :bulb: Build the image locally before using other solutions as a sanity check

Build Docker image for deployment on any supported platform.
```bash
docker build . -t coeus-agent
```

#### Google Cloud Run
Deploy to Google Cloud Run [from source](https://cloud.google.com/run/docs/deploying-source-code#deploy-from-source). The Docker image gets built on Google Cloud Build.


```bash
gcloud run deploy coeus --env-vars-file=.env.yaml --source .
```

## Contribute

### Workspace Dev Tools
Our development environment comes out of the box with configuration for helpful devtools
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
- [.clinerules](./.clinerules): Cline AI Agent configuration

### Cline AI Agent
Cline is the recommended AI coding extension for this project. It is configured to do the following
- Load [.clinerules](./.clinerules) for development rules & patterns
- Use [.clinerules/workflows](./.clinerules/workflows/) for specific workflows
- Read & update [memory-bank](./memory-bank/) (git ignored) for longterm memory across task contexts
- Read & update [docs-ai](./docs-ai/) for general user facing AI docs (similar to memory-bank but not git ignored)
- Read & update [docs-ai/LEARNING.md](./docs-ai/LEARNING.md) whenever user mentions agent committed an error (avoids repetition of bad practices)
- Follow [docs-ai/PATTERNS/mcp-tool-libraries.md](./docs-ai/PATTERNS/mcp-tool-libraries.md) for creating our standard MCP Tool Library package for each service we connect to

Also see the following resources below for more info
https://docs.cline.bot/prompting/cline-memory-bank
https://github.com/cline/prompts
