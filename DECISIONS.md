# Architectural Decision Records (ADRs)

## Overview
This document tracks key architectural decisions made for the Coeus MCP CRM project. Each decision includes context, options considered, rationale, and implications.

## Current Decisions

### ADR-001: Graph Database Selection (Neo4j)
**Status**: Accepted
**Date**: 2025-01-26
**Context**: Need to choose a graph database for storing CRM entities and relationships

**Options Considered**:
1. **Neo4j** - Mature graph database with Cypher query language
2. **Amazon Neptune** - Managed graph database service
3. **ArangoDB** - Multi-model database with graph capabilities
4. **TigerGraph** - High-performance graph database

**Decision**: Use Neo4j 5.x as the primary graph database

**Rationale**:
- Mature ecosystem with extensive documentation and community support
- Native graph storage and processing (not layered on relational DB)
- Cypher query language is intuitive for graph operations
- Strong ACID compliance and transaction support
- Excellent performance for relationship traversal
- Vector search capabilities for semantic operations
- Docker support for development and testing

**Implications**:
- Team needs to learn Cypher query language
- Requires Neo4j infrastructure management
- Vendor lock-in to Neo4j ecosystem
- Licensing considerations for production deployment

**Alternatives Rejected**:
- Neptune: AWS lock-in, less flexible for development
- ArangoDB: Multi-model complexity not needed
- TigerGraph: Overkill for CRM use case, higher complexity

---

### ADR-002: Semantic Layer Integration (Graphiti/Zep)
**Status**: Accepted
**Date**: 2025-01-26
**Context**: Need semantic search and entity linking capabilities over the graph

**Options Considered**:
1. **Graphiti/Zep** - Graph-native semantic layer
2. **Custom embedding solution** - Build our own with OpenAI/Anthropic
3. **Pinecone + Neo4j** - Separate vector database
4. **Neo4j Vector Index only** - Use built-in vector capabilities

**Decision**: Integrate Graphiti/Zep as the semantic layer over Neo4j

**Rationale**:
- Purpose-built for graph + semantic operations
- Handles entity linking and deduplication automatically
- Integrates naturally with Neo4j
- Reduces complexity of managing separate vector store
- Provides graph-aware semantic search
- Handles embedding generation and management

**Implications**:
- Additional service dependency
- Learning curve for Graphiti/Zep APIs
- Potential performance overhead
- Cost considerations for embedding generation

**Alternatives Rejected**:
- Custom solution: Too much development overhead
- Pinecone: Adds complexity of syncing between systems
- Neo4j only: Limited semantic capabilities

---

### ADR-003: MCP Protocol Implementation Strategy
**Status**: Accepted
**Date**: 2025-01-26
**Context**: How to implement MCP server for agent interaction

**Options Considered**:
1. **Custom MCP implementation** - Build from MCP specification
2. **Existing MCP framework** - Use available MCP libraries
3. **REST API with MCP wrapper** - Build REST first, wrap with MCP
4. **GraphQL with MCP adapter** - Use GraphQL as base protocol

**Decision**: Build custom MCP implementation following the specification

**Rationale**:
- Full control over implementation details
- Can optimize for CRM-specific use cases
- Direct integration with graph operations
- No additional abstraction layers
- Better error handling and validation
- Easier to maintain and debug

**Implications**:
- More development effort upfront
- Need to ensure MCP specification compliance
- Responsibility for protocol correctness
- Testing complexity for protocol adherence

**Alternatives Rejected**:
- Existing frameworks: Limited flexibility, potential bugs
- REST wrapper: Additional complexity, protocol mismatch
- GraphQL: Overkill for agent interaction patterns

---

### ADR-004: Monorepo Structure (Option B)
**Status**: Accepted
**Date**: 2025-01-26
**Context**: How to organize code for multiple packages and applications

**Options Considered**:
1. **Single repository** - Everything in one repo
2. **Multi-repo** - Separate repos for each package
3. **Monorepo with apps/packages structure** - Clear separation
4. **Flat monorepo** - All packages at root level

**Decision**: Use monorepo with apps/packages structure (Option B)

**Structure**:
```
apps/           # Runtime applications
packages/       # Reusable libraries
configs/        # Shared configurations
```

**Rationale**:
- Clear separation between applications and libraries
- Shared configurations reduce duplication
- Easy dependency management with pnpm workspaces
- Simplified CI/CD with Turborepo
- Good developer experience with unified tooling
- Scales well as project grows

**Implications**:
- Need to manage inter-package dependencies carefully
- Requires tooling setup (pnpm, Turborepo)
- Potential for circular dependencies
- Build orchestration complexity

**Alternatives Rejected**:
- Multi-repo: Too much overhead for related packages
- Single repo: Lacks organization as project grows
- Flat structure: Becomes unwieldy with many packages

---

### ADR-005: Testing Strategy (Vitest + Testcontainers)
**Status**: Accepted
**Date**: 2025-01-26
**Context**: How to test graph operations and MCP functionality reliably

**Options Considered**:
1. **Jest + Docker Compose** - Traditional testing with manual setup
2. **Vitest + Testcontainers** - Modern testing with automated containers
3. **Mocked everything** - No real database testing
4. **Vitest + In-memory Neo4j** - Embedded database testing

**Decision**: Use Vitest with Testcontainers for integration testing

**Rationale**:
- Vitest provides better TypeScript support and performance
- Testcontainers ensures consistent test environments
- Real database testing catches integration issues
- Automatic container lifecycle management
- Parallel test execution with isolated environments
- CI/CD friendly with proper cleanup

**Implications**:
- Requires Docker in development and CI environments
- Longer test startup times
- More complex test setup
- Higher resource usage during testing

**Alternatives Rejected**:
- Jest: Slower, less TypeScript-friendly
- Mocked only: Misses integration issues
- In-memory: Limited Neo4j feature support

---

### ADR-006: TypeScript Configuration Strategy
**Status**: Accepted
**Date**: 2025-01-26
**Context**: How to configure TypeScript across multiple packages

**Options Considered**:
1. **Shared base config** - Single tsconfig.json extended by all packages
2. **Per-package configs** - Independent TypeScript configuration
3. **Composite projects** - TypeScript project references
4. **Monolithic config** - Single config for entire monorepo

**Decision**: Use shared base configuration with package-specific extensions

**Rationale**:
- Consistent TypeScript settings across packages
- Easy to update compiler options globally
- Package-specific customization when needed
- Good IDE support and type checking
- Simplified maintenance

**Configuration**:
- `configs/tsconfig/tsconfig.json` - Base configuration
- Package-specific `tsconfig.json` extends base
- Strict mode enabled for type safety
- Path mapping for internal package references

**Implications**:
- Need to coordinate TypeScript version updates
- Potential conflicts between package requirements
- Build order dependencies

**Alternatives Rejected**:
- Per-package: Too much duplication and drift
- Composite: Overly complex for current needs
- Monolithic: Lacks flexibility for different package types

---

## Pending Decisions

### PD-001: Semantic Search Enablement
**Status**: Under Review
**Context**: Whether to enable semantic search by default or gate behind feature flag

**Options**:
1. **Always enabled** - Semantic search available by default
2. **Feature flag** - Optional semantic search with fallback
3. **Environment-based** - Enabled only with API keys present

**Considerations**:
- Cost implications of embedding generation
- Fallback behavior without semantic capabilities
- User experience with and without semantic search
- Development and testing complexity

**Decision Required**: Before M1 implementation

---

### PD-002: Edge Attributes in MVP
**Status**: Under Review
**Context**: Whether relationship edges should carry attributes (employment dates, job titles)

**Options**:
1. **Full attributes** - Include start/end dates, titles, metadata
2. **Minimal attributes** - Only essential relationship data
3. **Extensible design** - Support attributes but don't require them

**Considerations**:
- Data model complexity
- Query performance implications
- User requirements for temporal data
- Migration complexity for future changes

**Decision Required**: Before domain schema implementation

---

### PD-003: Deletion Strategy
**Status**: Under Review
**Context**: How to handle entity and relationship deletion

**Options**:
1. **Soft delete only** - Mark as deleted, preserve data
2. **Hard delete with admin** - Expose admin-level hard delete
3. **Configurable strategy** - Support both approaches
4. **Cascade rules** - Define deletion cascade behavior

**Considerations**:
- Data retention requirements
- Audit trail preservation
- Performance implications of soft deletes
- Compliance and privacy requirements

**Decision Required**: Before MCP tool implementation

---

### PD-004: Local Development Environment
**Status**: Under Review
**Context**: How developers should run services locally

**Options**:
1. **Testcontainers only** - All services via containers in tests
2. **Docker Compose** - Manual service management for development
3. **Hybrid approach** - Docker Compose + Testcontainers
4. **Cloud development** - Remote development environments

**Considerations**:
- Developer experience and setup complexity
- Resource usage on development machines
- Consistency between development and testing
- Debugging and troubleshooting capabilities

**Decision Required**: Before development environment setup

---

### PD-005: Authentication Strategy
**Status**: Under Review
**Context**: Whether MCP server should require authentication

**Options**:
1. **No authentication** - Open access for development
2. **Token-based auth** - API keys or JWT tokens
3. **mTLS authentication** - Certificate-based security
4. **Pluggable auth** - Support multiple authentication methods

**Considerations**:
- Security requirements for production
- Development workflow complexity
- Integration with existing systems
- Compliance requirements

**Decision Required**: Before production deployment

---

### PD-006: Multi-tenancy Support
**Status**: Under Review
**Context**: Whether to support multiple organizations/tenants

**Options**:
1. **Single tenant** - One organization per instance
2. **Multi-tenant with namespaces** - Logical separation in graph
3. **Multi-tenant with databases** - Physical separation
4. **Configurable tenancy** - Support both single and multi-tenant

**Considerations**:
- Deployment complexity
- Data isolation requirements
- Performance implications
- Scaling characteristics

**Decision Required**: Before production architecture finalization

---

## Decision Process

### Making Decisions
1. **Identify Decision Point**: Document when architectural choice is needed
2. **Research Options**: Investigate available alternatives
3. **Stakeholder Input**: Gather requirements and constraints
4. **Document Analysis**: Create ADR with options and rationale
5. **Review and Approve**: Team review and decision
6. **Implementation**: Execute decision and monitor outcomes

### Changing Decisions
1. **Identify Issues**: Document problems with current decision
2. **Impact Analysis**: Assess cost and complexity of change
3. **New ADR**: Create new ADR superseding previous decision
4. **Migration Plan**: Define steps to implement change
5. **Update Documentation**: Reflect changes in all relevant docs

### Decision Criteria
- **Technical Merit**: Does it solve the problem effectively?
- **Maintainability**: Can the team support it long-term?
- **Performance**: Does it meet performance requirements?
- **Cost**: Is it cost-effective to implement and operate?
- **Risk**: What are the risks and mitigation strategies?
- **Reversibility**: How difficult would it be to change later?

This decision log will be updated as the project evolves and new architectural choices are made.
