# Tech Stack: Coeus MCP CRM

## Overview
Coeus uses a modern, graph-first technology stack optimized for AI agent interaction and relationship-aware data processing. The stack emphasizes type safety, performance, and developer experience while maintaining compatibility with the MCP protocol.

## Core Technologies

### Runtime & Language
- **Node.js 20+** - Modern JavaScript runtime with latest features
- **TypeScript 5.8.2+** - Type-safe development with strict mode
- **ES2022** - Modern JavaScript features and syntax

### Database Stack
- **Zep Cloud** - Primary graph database for entities, relationships, and semantic layer
- **SQLite/Turso** - Operational database for server state and logs
- **Drizzle ORM** - Type-safe database operations and migrations

### Protocol & API
- **MCP (Model Context Protocol)** - AI agent communication protocol
- **JSON Schema** - Request/response validation
- **HTTP/WebSocket** - Transport protocols

## Development Stack

### Package Management
- **pnpm 8.x** - Fast, efficient package manager with workspace support
- **pnpm Workspaces** - Monorepo dependency management
- **Turborepo** - Build system orchestration and caching
- **mprocs** - Process manager for running multiple commands

### Build Tools
- **ESBuild** - Fast TypeScript/JavaScript compilation
- **tsx** - TypeScript execution for development
- **Turbo** - Monorepo build orchestration

### Code Quality
- **ESLint 9.x** - Code linting with custom rules
- **Prettier 3.x** - Code formatting
- **Husky** - Git hooks for quality gates
- **TypeScript Strict Mode** - Maximum type safety

### Testing
- **Vitest** - Modern testing framework with TypeScript support
- **Testcontainers** - Integration testing with real services
- **c8** - Code coverage reporting

## Core Dependencies

### Graph & Database
```json
{
  "@getzep/zep-cloud": "^3.x",
  "@libsql/client": "^0.5.x",
  "drizzle-orm": "^0.29.x"
}
```

### Validation & Schemas
```json
{
  "zod": "^4.0.0",
  "@types/json-schema": "^7.x"
}
```

### Server & Protocol
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "winston": "^3.x"
}
```

### Utilities
```json
{
  "winston": "^3.x",
  "lodash-es": "^4.x",
  "uuid": "^9.x",
  "date-fns": "^3.x"
}
```

## Development Dependencies

### TypeScript & Build
```json
{
  "typescript": "^5.8.2",
  "esbuild": "^0.20.x",
  "tsx": "^4.x",
  "@types/node": "^20.x",
  "turbo": "^2.x",
  "drizzle-kit": "^0.20.x"
}
```

### Testing
```json
{
  "vitest": "^1.x",
  "testcontainers": "^10.x",
  "@vitest/coverage-c8": "^0.33.x"
}
```

### Code Quality
```json
{
  "eslint": "^9.x",
  "prettier": "^3.x",
  "@typescript-eslint/eslint-plugin": "^7.x",
  "@typescript-eslint/parser": "^7.x",
  "husky": "^9.x",
  "lint-staged": "^15.x"
}
```

## Architecture Stack

### Monorepo Structure
```
apps/
├── coeus-mcp/          # MCP server application
└── coeus-cli/          # CLI tools (future)

packages/
├── domain-schemas/     # Zod schemas and validation
└── ops-db/            # Operational database client

configs/
├── eslint-config/     # Shared ESLint configuration
├── tsconfig/          # TypeScript configurations
├── esbuild-config/    # Build configurations
└── vite-config/       # Development server config
```

### Design Patterns
- **Repository Pattern** - Data access abstraction
- **Factory Pattern** - MCP tool and resource creation
- **Strategy Pattern** - Multiple embedding providers
- **Command Pattern** - MCP tool execution
- **Observer Pattern** - Graph change notifications

## External Services

### Required Services
- **Zep Cloud API** - Semantic operations and embeddings

### Optional Services
- **OpenAI API** - Fallback embedding provider
- **Anthropic API** - Alternative embedding provider

## Development Tools

### IDE & Extensions
- **VSCode** - Recommended IDE
- **TypeScript Extension** - Enhanced TS support
- **ESLint Extension** - Real-time linting
- **Prettier Extension** - Code formatting
- **Docker Extension** - Container management

### Database Tools
- **Zep Cloud Console** - Graph database management and query interface

### Monitoring & Debugging
- **Node.js Inspector** - Built-in debugging
- **Winston Logger** - Structured logging
- **Performance Hooks** - Performance monitoring

## Performance Stack

### Caching
- **LRU Cache** - In-memory caching for entities
- **Redis** - Distributed caching (future)

### Connection Management
- **Zep Cloud SDK** - Handles connection pooling and management
- **HTTP Keep-Alive** - Persistent connections

### Optimization
- **ESBuild** - Fast compilation
- **Turborepo Cache** - Build artifact caching
- **Tree Shaking** - Dead code elimination

## Security Stack

### Input Validation
- **Zod Schemas** - Runtime validation
- **JSON Schema** - API contract validation
- **Parameterized Queries** - SQL/Cypher injection prevention

### Authentication (Future)
- **JWT Tokens** - Stateless authentication
- **API Keys** - Service authentication
- **Rate Limiting** - DoS protection

### Encryption
- **TLS/SSL** - Transport encryption
- **bcrypt** - Password hashing (future)
- **crypto** - Node.js crypto module

## Testing Stack

### Test Types
- **Unit Tests** - Individual function testing
- **Integration Tests** - Component interaction testing
- **Contract Tests** - MCP protocol compliance
- **End-to-End Tests** - Complete workflow testing

### Test Infrastructure
- **Testcontainers** - Real service testing
- **Docker** - Container orchestration
- **GitHub Actions** - CI/CD pipeline

### Test Utilities
- **Test Builders** - Factory functions for test data
- **Mock Providers** - Service mocking
- **Test Fixtures** - Predefined test datasets

## Deployment Stack

### Containerization
- **Docker** - Application containerization
- **Multi-stage Builds** - Optimized images
- **Alpine Linux** - Minimal base images

### Orchestration (Future)
- **Kubernetes** - Container orchestration
- **Docker Compose** - Local development
- **Helm Charts** - Kubernetes deployment

### Monitoring (Future)
- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **Jaeger** - Distributed tracing

## Version Requirements

### Minimum Versions
- Node.js: 20.0.0
- pnpm: 8.0.0
- TypeScript: 5.8.2
- Docker: 20.0.0

### Recommended Versions
- Node.js: 20.11.0 (LTS)
- pnpm: 8.15.0
- TypeScript: 5.8.2
- Docker: 24.0.0

## Browser Compatibility (Future Web UI)
- Chrome: 90+
- Firefox: 88+
- Safari: 14+
- Edge: 90+

## Platform Support
- **Primary**: Linux (Ubuntu 20.04+, Alpine 3.18+)
- **Development**: macOS 12+, Windows 11 (WSL2)
- **CI/CD**: GitHub Actions (Ubuntu runners)

## License Considerations
- **MIT Licensed**: Most dependencies use MIT license
- **Zep Cloud**: Commercial service with API pricing

## Migration Path
The tech stack is designed for gradual adoption:
1. **Phase 1**: Core stack with essential dependencies
2. **Phase 2**: Add monitoring and security features
3. **Phase 3**: Scale with distributed caching and orchestration
4. **Phase 4**: Advanced features like real-time subscriptions

This tech stack provides a solid foundation for building a scalable, maintainable, and performant graph-first CRM system optimized for AI agent interaction.
