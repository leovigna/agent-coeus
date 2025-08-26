# Workspace: Coeus Monorepo Layout

## Overview
The Coeus project uses a monorepo structure with pnpm workspaces and Turborepo for efficient development, building, and testing. This document outlines the workspace organization, naming conventions, and development workflows.

## Directory Structure

```
agent-coeus/
├── apps/                           # Runtime applications
│   ├── coeus-mcp/                 # MCP server application
│   └── coeus-cli/                 # CLI tools (future)
├── packages/                       # Reusable libraries
│   ├── domain-schemas/            # Entity schemas and validation
│   ├── graph-client/              # Neo4j + Graphiti client
│   ├── ops-db/                    # Operational database client
│   └── mcp-kit/                   # MCP protocol utilities
├── configs/                        # Shared configurations
│   ├── eslint-config/             # ESLint rules and presets
│   ├── tsconfig/                  # TypeScript configurations
│   ├── esbuild-config/            # Build configurations
│   └── vite-config/               # Development server config
├── docs/                          # Project documentation
├── test/                          # Global test utilities
├── scripts/                       # Development and build scripts
├── .github/                       # GitHub Actions workflows
├── repomix/                       # External library artifacts
└── memory-bank/                   # Cline's memory bank
```

## Package Organization

### Applications (`apps/`)
Runtime applications that can be deployed independently.

#### `apps/coeus-mcp/`
**Purpose**: Main MCP server application
**Dependencies**: All packages/* libraries
**Output**: Executable Node.js application
**Deployment**: Docker container or Node.js runtime

**Structure**:
```
apps/coeus-mcp/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── config/                # Configuration management
│   ├── resources/             # MCP resource handlers
│   ├── tools/                 # MCP tool handlers
│   ├── middleware/            # Request/response middleware
│   └── health/                # Health check endpoints
├── test/                      # Application-specific tests
├── Dockerfile                 # Container build configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### Libraries (`packages/`)
Reusable libraries that can be shared across applications.

#### `packages/domain-schemas/`
**Purpose**: Centralized entity schemas and validation
**Dependencies**: zod, minimal external deps
**Output**: ESM + CJS + TypeScript declarations

**Structure**:
```
packages/domain-schemas/
├── src/
│   ├── index.ts               # Main exports
│   ├── entities/              # Entity schema definitions
│   │   ├── company.ts         # Company entity schema
│   │   ├── person.ts          # Person entity schema
│   │   └── relationship.ts    # Relationship schemas
│   ├── validation/            # Validation utilities
│   ├── normalization/         # Data normalization
│   └── linking/               # Entity linking utilities
├── test/                      # Package tests
├── package.json               # Package configuration
└── tsconfig.json              # Package-specific TS config
```

#### `packages/graph-client/`
**Purpose**: Neo4j and Graphiti/Zep integration
**Dependencies**: neo4j-driver, graphiti-sdk, domain-schemas
**Output**: ESM + CJS + TypeScript declarations

**Structure**:
```
packages/graph-client/
├── src/
│   ├── index.ts               # Main client exports
│   ├── neo4j/                 # Neo4j connection and queries
│   ├── graphiti/              # Graphiti/Zep integration
│   ├── operations/            # CRUD operations
│   ├── search/                # Semantic search
│   ├── traversal/             # Graph traversal utilities
│   └── transactions/          # Transaction management
├── test/                      # Client tests
├── package.json
└── tsconfig.json
```

#### `packages/ops-db/`
**Purpose**: Operational database for MCP server state
**Dependencies**: better-sqlite3 or pg, minimal deps
**Output**: ESM + CJS + TypeScript declarations

**Structure**:
```
packages/ops-db/
├── src/
│   ├── index.ts               # Main database exports
│   ├── client.ts              # Database client
│   ├── migrations/            # Database migrations
│   ├── models/                # Data models
│   └── queries/               # Query builders
├── migrations/                # SQL migration files
├── test/
├── package.json
└── tsconfig.json
```

#### `packages/mcp-kit/`
**Purpose**: MCP protocol utilities and abstractions
**Dependencies**: Minimal, protocol-focused
**Output**: ESM + CJS + TypeScript declarations

**Structure**:
```
packages/mcp-kit/
├── src/
│   ├── index.ts               # Main MCP exports
│   ├── protocol/              # MCP protocol implementation
│   ├── validation/            # Request/response validation
│   ├── errors/                # Error handling utilities
│   ├── resources/             # Resource abstractions
│   └── tools/                 # Tool abstractions
├── test/
├── package.json
└── tsconfig.json
```

### Configurations (`configs/`)
Shared configurations to ensure consistency across packages.

#### `configs/eslint-config/`
**Purpose**: Shared ESLint rules and presets
**Exports**: ESLint configurations for different package types

**Structure**:
```
configs/eslint-config/
├── eslint.config.mjs          # Main ESLint configuration
├── package.json               # Config package definition
└── README.md                  # Usage instructions
```

#### `configs/tsconfig/`
**Purpose**: Base TypeScript configurations
**Exports**: Base tsconfig.json for extension

**Structure**:
```
configs/tsconfig/
├── tsconfig.json              # Base TypeScript config
├── package.json
└── README.md
```

## Naming Conventions

### Package Names
- **Scope**: All packages use `@coeus-agent/` scope (future npm publishing)
- **Format**: kebab-case (e.g., `@coeus-agent/domain-schemas`)
- **Descriptive**: Names clearly indicate package purpose

### File and Directory Names
- **Files**: kebab-case for multi-word files (e.g., `graph-client.ts`)
- **Directories**: kebab-case for consistency
- **Components**: PascalCase for React components (future)
- **Constants**: SCREAMING_SNAKE_CASE for constants

### Export Conventions
- **Default exports**: For main package functionality
- **Named exports**: For utilities and specific functions
- **Index files**: Re-export public API from `src/index.ts`

## Workspace Configuration

### pnpm Workspaces
**File**: `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'configs/*'
```

### Turborepo Configuration
**File**: `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

## Development Workflows

### Package Development
1. **Create Package**: New TypeScript packages should use the `starter-typescript` package as a template.
2. **Implement Features**: Follow domain-driven design patterns.
3. **Write Tests**: Unit tests with mocks, integration tests with Testcontainers.
4. **Build & Validate**: Ensure TypeScript compilation and test passage.
5. **Document**: Update README and API documentation.

### Package Scripts
Each package includes standard scripts:

```json
{
  "scripts": {
    "build": "esbuild src/index.ts --outdir=dist --format=esm,cjs",
    "dev": "esbuild src/index.ts --outdir=dist --watch",
    "test": "vitest",
    "test:watch": "vitest watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  }
}
```

### Root Scripts
**File**: `package.json` (root)
```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "test:unit": "turbo run test --filter='./packages/*'",
    "test:integration": "turbo run test --filter='./apps/*'",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "dev": "turbo run dev --parallel",
    "clean": "turbo run clean && rm -rf node_modules/.cache"
  }
}
```

### Dependency Management

#### Internal Dependencies
```json
{
  "dependencies": {
    "@coeus-agent/domain-schemas": "workspace:*",
    "@coeus-agent/graph-client": "workspace:*"
  }
}
```

#### External Dependencies
- **Production**: Only necessary runtime dependencies
- **Development**: Shared dev dependencies at root level when possible
- **Peer Dependencies**: For optional integrations

#### Version Management
- **Syncpack**: Ensures consistent versions across packages
- **Changesets**: Manages versioning and publishing (future)

## Build System

### Build Targets
- **ESM**: Modern ES modules for Node.js 20+
- **CJS**: CommonJS for compatibility
- **Types**: TypeScript declaration files

### Build Tools
- **ESBuild**: Fast compilation for libraries
- **TypeScript**: Type checking and declaration generation
- **Turborepo**: Build orchestration and caching

### Output Structure
```
dist/
├── index.js           # ESM build
├── index.cjs          # CommonJS build
├── index.d.ts         # TypeScript declarations
└── package.json       # Package metadata for dual publishing
```

## Testing Strategy

### Test Organization
- **Unit Tests**: `packages/*/test/` - Package-specific tests
- **Integration Tests**: `apps/*/test/` - Application tests
- **Global Utilities**: `test/` - Shared test utilities

### Test Commands
```bash
# Run all tests
pnpm test

# Run only unit tests (packages)
pnpm test:unit

# Run only integration tests (apps)
pnpm test:integration

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Development Environment

### Prerequisites
- **Node.js**: 20.x or later
- **pnpm**: 8.x or later
- **Docker**: For integration testing
- **Git**: Version control

### Setup Commands
```bash
# Clone repository
git clone git@github.com:leovigna/agent-coeus.git
cd agent-coeus

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### IDE Configuration
- **VSCode**: Workspace settings for consistent formatting
- **TypeScript**: Path mapping for internal packages
- **ESLint**: Automatic linting and formatting
- **Prettier**: Code formatting (integrated with ESLint)

## Publishing Strategy (Future)

### Package Versioning
- **Semantic Versioning**: Major.Minor.Patch
- **Changesets**: Automated changelog and version management
- **Independent Versioning**: Each package versioned independently

### Release Process
1. **Development**: Feature branches and pull requests
2. **Testing**: Automated testing on all changes
3. **Versioning**: Changesets for version bumps
4. **Publishing**: Automated publishing to npm registry
5. **Documentation**: Automated documentation updates

## Maintenance

### Dependency Updates
- **Renovate**: Automated dependency updates
- **Security**: Regular security audits
- **Compatibility**: Testing across Node.js versions

### Code Quality
- **ESLint**: Consistent code style
- **TypeScript**: Type safety
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates

### Monitoring
- **Build Status**: CI/CD pipeline monitoring
- **Test Coverage**: Coverage reporting
- **Performance**: Build time and test execution monitoring

This workspace structure provides a solid foundation for the Coeus project while maintaining flexibility for future growth and additional packages.
