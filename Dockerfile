##### Base Image #####
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat git pango-dev g++ make jpeg-dev giflib-dev librsvg-dev
RUN apk update
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN yarn global add pnpm@9.12.2
RUN pnpm add -g turbo@^2.4.4


##### Builder Image #####
FROM base AS builder
# Set working directory
WORKDIR /app

### Install Dependencies ###
# Configs
COPY configs/esbuild-config/package.json configs/esbuild-config/
COPY configs/eslint-config/package.json configs/eslint-config/
COPY configs/tsconfig/package.json configs/tsconfig/
COPY configs/vite-config/package.json configs/vite-config/
# Packages
COPY packages/mcp-tools-base/package.json packages/mcp-tools-base/
COPY packages/mcp-tools-logto/package.json packages/mcp-tools-logto/
COPY packages/mcp-tools-zep/package.json packages/mcp-tools-zep/
# Apps
COPY apps/coeus-mcp/package.json apps/coeus-mcp/

# Common
COPY package.json pnpm-workspace.yaml .npmrc pnpm-lock.yaml ./

# Cached install
RUN pnpm fetch --frozen-lockfile
RUN pnpm install --frozen-lockfile

### Build Packages ###
# Configs
COPY configs/esbuild-config configs/esbuild-config
COPY configs/eslint-config configs/eslint-config
COPY configs/tsconfig configs/tsconfig
COPY configs/vite-config configs/vite-config
# Packages
COPY packages/mcp-tools-base packages/mcp-tools-base
COPY packages/mcp-tools-logto packages/mcp-tools-logto
COPY packages/mcp-tools-zep packages/mcp-tools-zep
# Apps
COPY apps/coeus-mcp apps/coeus-mcp

# Copy turbo config
COPY turbo.json turbo.json

# Turbo credentials, we do NOT use prune to support better caching
# https://vsupalov.com/docker-arg-vs-env/ ARG thrown out after build
# ARG are included in process.env so no need to cast them to ENV (unless if needed as runtime default)
#ARG TURBO_TEAM=owl-protocol
#ARG TURBO_TOKEN

# Run build
RUN pnpm run build

##### Runtime Image #####
FROM node:22-alpine AS app

WORKDIR /app

# Copy encrypted envvars
#COPY .env.vault .env.vault
COPY --from=builder /app/apps/coeus-mcp/_cjs/dist/index.cjs .

# Copy env.vault for envvars, make sure to set DOTENV_KEY to load them
# COPY .env.vault .env.vault

# Copy MCP Instructions
COPY apps/coeus-mcp/MCP_INSTRUCTIONS.md .
COPY apps/coeus-mcp/prompts/SYSTEM_PROMPT.md ./prompts/SYSTEM_PROMPT.md

EXPOSE 3000
ENV NODE_ENV="production"
CMD ["node", "index.cjs"]
