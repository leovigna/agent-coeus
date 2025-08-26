# Memory Bank: Coeus MCP CRM

## Quick Reference
This document provides a concise overview of key decisions, assumptions, and context for the Coeus project. It serves as a quick reference for human reviewers and complements Cline's internal memory bank.

## Project Identity
**Coeus** is a knowledge-graph first AI assistant built around a CRM system for managing companies, people, and their relationships. It operates through a single MCP (Model Context Protocol) server surface, storing all CRM knowledge in a graph database to enable semantic + graph retrieval, entity linking, and relationship-aware reasoning.

## Core Architecture Principles
1. **Graph as Source of Truth**: All CRM data lives in Neo4j, not traditional relational databases
2. **MCP as Control Plane**: Single MCP server exposes all tools and resources for agent interaction
3. **Semantic + Graph Search**: Combines vector embeddings with graph traversal for intelligent retrieval
4. **Entity Linking**: Automatic resolution and linking of entities across data sources
5. **Relationship-Aware Reasoning**: Leverages graph structure for contextual understanding

## Key Technology Decisions

### Database Stack
- **Primary**: Neo4j 5.x for graph storage
- **Semantic Layer**: Graphiti/Zep for embeddings and semantic operations
- **Operational**: SQLite/PostgreSQL for MCP server state and logs
- **Rationale**: Neo4j provides native graph operations, Graphiti handles semantic search

### Development Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript with strict mode
- **Package Manager**: pnpm with workspaces
- **Build System**: ESBuild for libraries, Turborepo for orchestration
- **Testing**: Vitest + Testcontainers for reliable integration testing

### Architecture Pattern
- **Monorepo**: apps/ and packages/ structure for clear separation
- **MCP Protocol**: Custom implementation following specification
- **Domain-Driven**: Centralized schemas with validation (Zod)
- **Layered**: Clear separation between MCP, domain, and data layers

## Entity Model
```
Company ←--[WORKS_AT]-- Person
                         ↓
                    [REPORTS_TO]
                         ↓
                       Person
```

### Core Entities
- **Company**: name, domain, industry, size, location, metadata
- **Person**: name, email, phone, title, department, location, metadata
- **Relationships**: WORKS_AT (employment), REPORTS_TO (hierarchy)

### Relationship Properties
- **WORKS_AT**: start/end dates, title, department, status
- **REPORTS_TO**: start/end dates, level, direct report flag

## MCP Contract Summary

### Resources (Read-Only)
- `coeus://companies/{id?}` - Company profiles and metadata
- `coeus://people/{id?}` - Person profiles and employment info
- `coeus://relationships/{type?}` - Relationship data and org structures

### Tools (Write Operations)
- **Entity Management**: create_company, create_person, update_entity, delete_entity
- **Relationship Management**: link_employment, link_reporting, unlink_relationship
- **Search & Query**: search_entities, get_relationships, find_path

## Environment Variables (Key)
- **Required**: GRAPHITI_BASE_URL, GRAPHITI_API_KEY, DATABASE_URL
- **Optional**: GRAPH_NAMESPACE, OPENAI_API_KEY, LOG_LEVEL, MCP_PORT
- **Security**: Never log API keys or database credentials

## Testing Strategy
- **Unit Tests**: Vitest with mocked dependencies (>80% coverage)
- **Contract Tests**: MCP protocol compliance validation
- **Integration Tests**: Testcontainers with real Neo4j and services
- **Performance**: <500ms for typical queries, <100ms for entity creation

## Current Status
- **Phase**: Documentation and planning complete
- **Next**: Implementation phase (M1: Core Foundation)
- **Deliverables**: All Markdown documentation files created
- **Pending**: User confirmation on open questions

## Open Questions for User Confirmation

### 1. Semantic Search Enablement
**Question**: Should semantic search be enabled by default or gated behind a feature flag?
**Options**: Always enabled | Feature flag | Environment-based
**Impact**: Cost, complexity, user experience

### 2. Edge Attributes in MVP
**Question**: Should relationship edges carry attributes (employment dates, job titles) in MVP?
**Options**: Full attributes | Minimal attributes | Extensible design
**Impact**: Data model complexity, query performance

### 3. Deletion Strategy
**Question**: Should the system support only soft-delete or also expose admin hard-delete?
**Options**: Soft-delete only | Hard delete with admin | Configurable strategy
**Impact**: Data retention, audit trails, compliance

### 4. Local Development Path
**Question**: Prefer Testcontainers-only approach or also provide Docker Compose for services?
**Options**: Testcontainers only | Docker Compose | Hybrid approach
**Impact**: Developer experience, resource usage, debugging

### 5. Additional Considerations
- **Embedding Provider**: Default to OpenAI or support multiple providers?
- **Graph Namespace Strategy**: Single tenant or multi-tenant from start?
- **MCP Authentication**: Open access for development or require auth?
- **Entity Deduplication**: Automatic merging or manual resolution?

## Implementation Roadmap

### M1: Core Foundation (Weeks 1-2)
- Set up monorepo structure and shared configurations
- Implement domain schemas with Zod validation
- Create graph client with Neo4j + Graphiti integration
- Build basic MCP server with protocol compliance
- Establish testing infrastructure with Testcontainers

### M2: Full MCP Implementation (Weeks 3-4)
- Implement all MCP tools and resources
- Add semantic search capabilities
- Build relationship traversal and querying
- Comprehensive error handling and validation
- Contract tests for MCP compliance

### M3: Integration & Testing (Weeks 5-6)
- End-to-end integration testing
- Performance optimization and benchmarking
- CI/CD pipeline setup
- Documentation and examples
- Load testing and scalability validation

### M4: Production Ready (Weeks 7-8)
- Security hardening and audit
- Monitoring and observability
- Deployment configuration
- Performance tuning
- Final documentation and handoff

## Success Criteria
1. Agent can create and manage companies/people through MCP tools
2. Semantic search returns relevant entities from natural language queries
3. Relationship queries work correctly (e.g., "Who reports to John at Acme?")
4. System handles entity linking and deduplication automatically
5. MCP contract is stable and well-documented
6. Test coverage demonstrates reliability (>80% unit, >70% integration)
7. Performance meets targets (<500ms queries, <100ms entity creation)

## Risk Mitigation
- **Graphiti/Zep Dependency**: Fallback to direct Neo4j + OpenAI embeddings
- **Performance Issues**: Query optimization, caching, connection pooling
- **Data Quality**: Validation, normalization, entity linking algorithms
- **Testing Complexity**: Testcontainers automation, deterministic test data
- **MCP Compliance**: Thorough contract testing, protocol validation

## Key Files Created
1. **PROJECT_BRIEF.md** - Project definition and scope
2. **IMPLEMENTATION.md** - Architecture and task checklist
3. **COEUS_AGENT.md** - Agent capabilities and reasoning model
4. **ARCHITECTURE.md** - System components and data flows
5. **TESTING.md** - Comprehensive testing strategy
6. **MCP_CONTRACT.md** - Detailed API specification
7. **DECISIONS.md** - Architectural decision records
8. **WORKSPACE.md** - Monorepo structure and conventions
9. **ENVIRONMENT.md** - Environment variable specifications
10. **ROADMAP.md** - Milestones and timeline (next)

## Next Steps
1. **User Review**: Confirm open questions and validate approach
2. **Implementation Start**: Begin M1 with package scaffolding
3. **Iterative Development**: Build, test, and refine incrementally
4. **Continuous Validation**: Regular check-ins and course corrections

This memory bank captures the essential context needed to continue development effectively while providing a clear reference for project stakeholders.
