# Architecture: Coeus MCP CRM

## System Overview
Coeus follows a layered architecture with clear separation of concerns, built around a knowledge graph as the central data store. The system is designed for extensibility, testability, and maintainability while providing high-performance graph operations.

```mermaid
graph TB
    subgraph "External"
        Agent["AI Agent"]
        Client["MCP Client"]
    end

    subgraph "MCP Layer"
        MCP["MCP Server<br/>(apps/coeus-mcp)"]
        Resources["Resources<br/>(companies, people, relationships)"]
        Tools["Tools<br/>(CRUD, search, linking)"]
    end

    subgraph "Domain Layer"
        Schemas["Domain Schemas<br/>(packages/domain-schemas)"]
    end

    subgraph "Data Layer"
        OpsDB["Ops Database<br/>(packages/ops-db)"]
    end

    subgraph "Storage"
        ZepCloud["Zep Cloud<br/>(Graph Data)"]
        SQLite["SQLite/PostgreSQL<br/>(Operational Data)"]
    end

    Agent --> MCP
    Client --> MCP
    MCP --> Resources
    MCP --> Tools
    Resources --> Schemas
    Tools --> Schemas
    MCP --> OpsDB
    MCP --> ZepCloud
    OpsDB --> SQLite
```

## Component Details

### MCP Server (`apps/coeus-mcp`) - To be created later
**Purpose**: Single point of entry for all agent interactions
**Responsibilities**:
- Implements the MCP server using the official `@modelcontextprotocol/sdk`.
- Defines and registers MCP tools and resources.
- Integrates with domain packages (graph-client, ops-db) to fulfill tool requests.
- Handles server configuration, logging, and lifecycle management.
- Ensures compliance with the MCP specification through the SDK.

### Domain Schemas (`packages/domain-schemas`)
**Purpose**: Centralized type definitions and validation
**Responsibilities**:
- Entity schema definitions (Company, Person)
- Relationship type definitions (WORKS_AT, REPORTS_TO)
- Validation rules and normalization logic
- TypeScript type exports
- Entity linking utilities

**Key Schemas**:
```typescript
// Company entity
interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: CompanySize;
  location?: Location;
  description?: string;
  metadata: Record<string, unknown>;
}

// Person entity
interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  location?: Location;
  metadata: Record<string, unknown>;
}

// Relationship types
type RelationshipType = 'WORKS_AT' | 'REPORTS_TO';

interface Relationship {
  type: RelationshipType;
  from: string;
  to: string;
  properties?: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
}
```


### Operational Database (`packages/ops-db`)
**Purpose**: Lightweight storage for operational data
**Responsibilities**:
- MCP request/response logging
- Server state management
- Configuration storage
- Performance metrics
- Audit trails

**Schema**:
```sql
-- Request logs
CREATE TABLE request_logs (
  id TEXT PRIMARY KEY,
  timestamp DATETIME,
  method TEXT,
  resource TEXT,
  tool TEXT,
  request_data TEXT,
  response_data TEXT,
  duration_ms INTEGER,
  status TEXT
);

-- Server state
CREATE TABLE server_state (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME
);
```

## Data Flow Patterns

### Entity Creation Flow
```mermaid
sequenceDiagram
    participant Agent
    participant MCP as MCP Server
    participant Schemas
    participant GraphClient
    participant ZepCloud
    participant OpsDB

    Agent->>MCP: create_company(data)
    MCP->>Schemas: validate(data)
    Schemas-->>MCP: validated_data
    MCP->>ZepCloud: createEntity('Company', validated_data)
    ZepCloud-->>MCP: entity_result
    MCP->>OpsDB: log_request(request, response)
    MCP-->>Agent: success_response
```

### Semantic Search Flow
```mermaid
sequenceDiagram
    participant Agent
    participant MCP as MCP Server
    participant GraphClient
    participant ZepCloud

    Agent->>MCP: search_entities("software engineers at tech companies")
    MCP->>ZepCloud: searchEntities(query, options)
    ZepCloud-->>MCP: search_results
    MCP-->>Agent: formatted_results
```

### Relationship Traversal Flow
```mermaid
sequenceDiagram
    participant Agent
    participant MCP as MCP Server
    participant GraphClient
    participant ZepCloud

    Agent->>MCP: get_relationships(person_id, "REPORTS_TO", depth=2)
    MCP->>ZepCloud: traverseRelationships(person_id, ["REPORTS_TO"], 2)
    ZepCloud-->>MCP: hierarchy_result
    MCP-->>Agent: formatted_hierarchy
```

## Graph Entity Model

### Core Entities
```mermaid
erDiagram
    Company {
        string id PK
        string name
        string domain
        string industry
        string size
        object location
        string description
        object metadata
    }

    Person {
        string id PK
        string name
        string email
        string phone
        string title
        string department
        object location
        object metadata
    }

    Company ||--o{ Person : WORKS_AT
    Person ||--o{ Person : REPORTS_TO
```

### Relationship Properties
- **WORKS_AT**: `{ startDate, endDate, title, department, status }`
- **REPORTS_TO**: `{ startDate, endDate, level, directReport }`

### Graph Indexes
```cypher
-- Entity lookups
CREATE INDEX company_name FOR (c:Company) ON (c.name);
CREATE INDEX person_name FOR (p:Person) ON (p.name);
CREATE INDEX person_email FOR (p:Person) ON (p.email);

-- Relationship traversal
CREATE INDEX works_at_company FOR ()-[r:WORKS_AT]-() ON (r.company_id);
CREATE INDEX reports_to_manager FOR ()-[r:REPORTS_TO]-() ON (r.manager_id);

-- Vector search (Zep Cloud managed)
CREATE VECTOR INDEX entity_embeddings FOR (n) ON (n.embedding);
```

## Dependency Boundaries

### Package Dependencies
```mermaid
graph TD
    subgraph "Apps"
        CoeusApp["apps/coeus-mcp"]
    end

    subgraph "Packages"
        Schemas["domain-schemas"]
        OpsDB["ops-db"]
    end

    subgraph "Configs"
        ESLint["eslint-config"]
        TSConfig["tsconfig"]
        ESBuild["esbuild-config"]
    end

    CoeusApp --> Schemas
    CoeusApp --> OpsDB

    CoeusApp --> ESLint
    CoeusApp --> TSConfig
    CoeusApp --> ESBuild

    Schemas --> ESLint
    Schemas --> TSConfig

    GraphClient --> ESLint
    GraphClient --> TSConfig
```

### Dependency Graph
```mermaid
graph TD
    subgraph "Applications"
        A["@coeus-agent/coeus-mcp"]
    end

    subgraph "Packages"
        B["@coeus-agent/domain-schemas"]
        E["@coeus-agent/ops-db"]
    end

    subgraph "Configs"
        F["@coeus-agent/eslint-config"]
        G["@coeus-agent/tsconfig"]
        H["@coeus-agent/esbuild-config"]
    end

    A --> B
    A --> E

    A --> F
    A --> G
    A --> H

    B --> F
    B --> G

    C --> F
    C --> G

    D --> F
    D --> G

    E --> F
    E --> G
```

### External Dependencies
- **@modelcontextprotocol/sdk**: The official MCP TypeScript SDK for building the server.
- **Zep Cloud SDK**: Semantic operations and embeddings
- **Zod**: Schema validation and type inference
- **Winston**: Structured logging

## Scalability Considerations

### Graph Database
- **Managed Service**: Zep Cloud handles all database management, scaling, and maintenance.
- **Query Optimization**: Zep Cloud provides indexed lookups and efficient traversals.
- **Batch Operations**: Bulk entity creation and updates are supported via the Zep Cloud SDK.
- **Namespace Isolation**: Multi-tenancy is supported through Zep Cloud projects.

### Semantic Search
- **Embedding Caching**: Cache frequently used embeddings
- **Vector Index Optimization**: Proper HNSW configuration
- **Query Batching**: Batch multiple search requests
- **Fallback Strategies**: Graceful degradation without embeddings

### Memory Management
- **Result Pagination**: Limit large result sets
- **Connection Cleanup**: Proper resource disposal
- **Graph Traversal Limits**: Maximum depth and breadth constraints
- **Cache Eviction**: LRU cache for frequently accessed entities

## Security Considerations

### Data Protection
- **Input Validation**: All inputs validated against schemas
- **SQL Injection Prevention**: Parameterized queries only
- **Graph Injection Prevention**: Cypher query parameterization
- **Data Sanitization**: Clean user inputs before storage

### Access Control
- **MCP Authentication**: Token-based authentication (future)
- **Resource Permissions**: Fine-grained access control
- **Audit Logging**: Complete request/response audit trail
- **Rate Limiting**: Prevent abuse and DoS attacks

### Infrastructure Security
- **Database Encryption**: Encrypted connections to Zep Cloud are handled by the SDK.
- **Secret Management**: Environment-based secret handling for ZEP_API_KEY.
- **Network Security**: Zep Cloud manages network security.
- **Container Security**: Not applicable as we are using a managed service.

## Decision Log Pointers
See [DECISIONS.md](./DECISIONS.md) for detailed architectural decision records including:
- Choice of Zep Cloud over other graph databases
- Zep integration approach
- MCP protocol implementation strategy
- Monorepo structure decisions
- Testing strategy choices
