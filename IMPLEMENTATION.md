# Implementation Plan: Coeus MCP CRM

## Architecture Overview
Coeus follows a graph-first architecture with the following key components:

- **Graph Layer**: Neo4j database with Graphiti/Zep for semantic operations
- **MCP Server**: Single point of interaction exposing tools and resources
- **Domain Layer**: Shared schemas and graph client libraries
- **Operational Layer**: Minimal database for MCP server state and logs

### Workspace Structure (Option B)
```
apps/
├── coeus-mcp/           # MCP server application
└── ...                 # Future apps (web UI, CLI tools)

packages/
├── graph-client/        # Neo4j + Graphiti client library
├── domain-schemas/      # TypeScript schemas for entities
├── ops-db/             # Operational database client
└── mcp-kit/            # MCP protocol utilities

configs/
├── eslint-config/      # Shared ESLint configuration
├── tsconfig/           # Shared TypeScript configuration
├── esbuild-config/     # Build configuration
└── vite-config/        # Development configuration
```

## Ordered Task Checklist

### Phase 1: Foundation & Configuration
- [ ] **Config Setup**
  - [ ] Update shared ESLint config for MCP/graph patterns
  - [ ] Configure TypeScript for strict graph typing
  - [ ] Set up Vitest configuration with Testcontainers
  - [ ] Configure ESBuild for MCP server packaging

### Phase 2: Core Packages
- [ ] **Domain Schemas Package** (`packages/domain-schemas`)
  - [ ] Define Company entity schema with Zod validation
  - [ ] Define Person entity schema with Zod validation
  - [ ] Define relationship types (WORKS_AT, REPORTS_TO)
  - [ ] Create entity linking and normalization utilities
  - [ ] Export TypeScript types for all schemas

- [ ] **Graph Client Package** (`packages/graph-client`)
  - [ ] Implement Neo4j connection management
  - [ ] Integrate Graphiti/Zep for semantic operations
  - [ ] Create CRUD operations for entities
  - [ ] Implement relationship management
  - [ ] Add semantic search capabilities
  - [ ] Create graph traversal utilities

- [ ] **Operational Database Package** (`packages/ops-db`)
  - [ ] Set up lightweight SQLite/PostgreSQL client
  - [ ] Create schema for MCP request logs
  - [ ] Implement server state management
  - [ ] Add migration utilities

- [ ] **MCP Kit Package** (`packages/mcp-kit`)
  - [ ] Create MCP protocol utilities
  - [ ] Implement request/response validation
  - [ ] Add error handling patterns
  - [ ] Create resource and tool abstractions

### Phase 3: MCP Server Application
- [ ] **Core MCP Server** (`apps/coeus-mcp`)
  - [ ] Initialize MCP server with protocol compliance
  - [ ] Implement resource handlers (companies, people, relationships)
  - [ ] Implement tool handlers (CRUD, search, linking)
  - [ ] Add request validation and error handling
  - [ ] Configure logging and monitoring
  - [ ] Add health check endpoints

### Phase 4: Testing Infrastructure
- [ ] **Unit Tests**
  - [ ] Test domain schemas validation
  - [ ] Test graph client operations
  - [ ] Test MCP protocol utilities
  - [ ] Test entity linking logic

- [ ] **Contract Tests**
  - [ ] Verify MCP protocol compliance
  - [ ] Test resource/tool request/response formats
  - [ ] Validate error response structures

- [ ] **Integration Tests**
  - [ ] Test full MCP server workflows
  - [ ] Test graph operations with real Neo4j
  - [ ] Test semantic search functionality
  - [ ] Test relationship traversal

### Phase 5: Infrastructure & CI
- [ ] **Development Infrastructure**
  - [ ] Docker Compose for local development
  - [ ] Testcontainers setup for CI
  - [ ] Environment configuration management

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions for testing
  - [ ] Build and packaging workflows
  - [ ] Dependency vulnerability scanning
  - [ ] Code quality gates

### Phase 6: Documentation & Deployment
- [ ] **Documentation**
  - [ ] API documentation for MCP contract
  - [ ] Developer setup guide
  - [ ] Architecture decision records
  - [ ] Usage examples and tutorials

- [ ] **Deployment**
  - [ ] Production deployment configuration
  - [ ] Monitoring and alerting setup
  - [ ] Performance optimization
  - [ ] Security hardening

## Acceptance Criteria per Milestone

### M1: Core Foundation (Packages + Basic MCP)
- [ ] All packages build successfully with TypeScript
- [ ] Domain schemas validate entities correctly
- [ ] Graph client connects to Neo4j and performs basic CRUD
- [ ] MCP server starts and responds to protocol requests
- [ ] Unit tests pass with >80% coverage

### M2: Full MCP Implementation
- [ ] All MCP tools and resources implemented
- [ ] Semantic search returns relevant results
- [ ] Relationship queries work correctly
- [ ] Error handling covers all edge cases
- [ ] Contract tests validate MCP compliance

### M3: Integration & Testing
- [ ] Integration tests pass with real databases
- [ ] Performance meets <500ms query targets
- [ ] Testcontainers setup works in CI
- [ ] End-to-end workflows complete successfully
- [ ] Memory usage stays within reasonable bounds

### M4: Production Ready
- [ ] Security audit passes
- [ ] Documentation is complete and accurate
- [ ] Deployment pipeline works reliably
- [ ] Monitoring captures key metrics
- [ ] Load testing validates performance at scale

## Environment Variables

### Graph Database
- `GRAPHITI_BASE_URL`: Graphiti service endpoint
- `GRAPHITI_API_KEY`: Authentication for Graphiti service
- `GRAPH_NAMESPACE`: Isolation namespace for multi-tenant support

### Application
- `NODE_ENV`: Runtime environment (development/production)
- `LOG_LEVEL`: Logging verbosity (debug/info/warn/error)
- `MCP_PORT`: Port for MCP server (default: 3000)

### Operational Database
- `DATABASE_URL`: Connection string for ops database

### Optional Features
- `OPENAI_API_KEY`: For embeddings (alternative: other providers)
- `EMBEDDING_PROVIDER`: Which service to use for embeddings

## Testing Strategy Outline

### Unit Testing (Vitest)
- **Scope**: Individual functions and classes
- **Focus**: Domain logic, validation, utilities
- **Mocking**: External dependencies (databases, APIs)
- **Coverage**: >80% line coverage target

### Contract Testing (Vitest)
- **Scope**: MCP protocol compliance
- **Focus**: Request/response formats, error handling
- **Tools**: JSON schema validation, protocol checkers
- **Coverage**: All MCP endpoints and error conditions

### Integration Testing (Vitest + Testcontainers)
- **Scope**: Multi-component workflows
- **Focus**: Database operations, semantic search, graph traversal
- **Infrastructure**: Neo4j + Graphiti containers per test run
- **Isolation**: Unique namespaces prevent test interference

### Global Test Setup
- **Testcontainers**: Spin up Neo4j and required services
- **Namespace Strategy**: Each test run gets unique graph namespace
- **Cleanup**: Automatic teardown of test data and containers
- **Flakiness Mitigation**: Retry logic, proper async handling, deterministic test data

### Semantic Test Gating
- **Conditional Execution**: Skip embedding tests if no API key provided
- **Fallback Behavior**: Use mock embeddings for basic functionality tests
- **CI Configuration**: Secure handling of optional API keys

## Open Questions Requiring User Confirmation

1. **Semantic Search Enablement**: Should semantic search be enabled by default or gated behind a feature flag?

2. **Edge Attributes**: Should relationship edges carry attributes (e.g., employment start/end dates, job title) in the MVP?

3. **Deletion Strategy**: Should the system support only soft-delete or also expose admin hard-delete functionality?

4. **Local Development**: Prefer Testcontainers-only approach or also provide Docker Compose for manual service management?

5. **Embedding Provider**: Default to OpenAI embeddings or support multiple providers from the start?

6. **Graph Namespace Strategy**: Use single namespace for simplicity or multi-tenant namespaces from the beginning?

7. **MCP Authentication**: Should the MCP server require authentication or start with open access for development?

8. **Entity Deduplication**: Implement automatic entity merging or require manual resolution of duplicates?
