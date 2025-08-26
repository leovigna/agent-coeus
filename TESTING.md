# Testing Strategy: Coeus MCP CRM

## Overview
Coeus employs a multi-layered testing strategy designed to ensure reliability, performance, and correctness across all components. The testing approach emphasizes isolation, repeatability, and comprehensive coverage of both happy paths and edge cases.

## Test Layers

### Unit Testing (Vitest)
**Scope**: Individual functions, classes, and modules in isolation
**Framework**: Vitest with TypeScript support
**Coverage Target**: >80% line coverage

#### What We Test
- **Domain Schema Validation**: Zod schema validation logic
- **Entity Normalization**: Name normalization, email validation, data cleaning
- **Graph Client Operations**: CRUD operations with mocked Neo4j
- **MCP Protocol Utilities**: Request/response formatting and validation
- **Business Logic**: Entity linking, relationship management, search algorithms

#### Test Structure
```typescript
// Example: Domain schema validation
describe('Company Schema', () => {
  it('should validate valid company data', () => {
    const validCompany = {
      name: 'Acme Corp',
      domain: 'acme.com',
      industry: 'Technology'
    };
    expect(() => CompanySchema.parse(validCompany)).not.toThrow();
  });

  it('should reject invalid email domains', () => {
    const invalidCompany = {
      name: 'Acme Corp',
      domain: 'not-a-domain'
    };
    expect(() => CompanySchema.parse(invalidCompany)).toThrow();
  });
});
```

#### Mocking Strategy
- **Neo4j Driver**: Mock database connections and query results
- **Graphiti/Zep**: Mock embedding generation and semantic search
- **External APIs**: Mock all external service calls
- **File System**: Mock file operations for configuration loading

### Contract Testing (Vitest)
**Scope**: MCP protocol compliance and API contracts
**Framework**: Vitest with JSON schema validation
**Focus**: Interface correctness and protocol adherence

#### What We Test
- **MCP Request/Response Formats**: Validate all tool and resource schemas
- **Error Response Structures**: Ensure consistent error handling
- **Protocol Compliance**: Verify MCP specification adherence
- **API Versioning**: Test backward compatibility
- **Input Validation**: Boundary conditions and malformed requests

#### Test Structure
```typescript
// Example: MCP tool contract
describe('create_company Tool', () => {
  it('should accept valid MCP request format', () => {
    const request = {
      method: 'tools/call',
      params: {
        name: 'create_company',
        arguments: {
          name: 'Acme Corp',
          domain: 'acme.com'
        }
      }
    };
    expect(validateMCPRequest(request)).toBe(true);
  });

  it('should return valid MCP response format', async () => {
    const response = await callTool('create_company', validArgs);
    expect(response).toMatchSchema(MCPResponseSchema);
    expect(response.content).toHaveProperty('company_id');
  });
});
```

#### Schema Validation
- **JSON Schema**: Validate request/response structures
- **OpenAPI Specs**: Generate and validate API documentation
- **Type Safety**: Ensure TypeScript types match runtime schemas

### Integration Testing (Vitest + Testcontainers)
**Scope**: Multi-component workflows with real infrastructure
**Framework**: Vitest with Testcontainers for service orchestration
**Focus**: End-to-end functionality with real databases

#### What We Test
- **Full MCP Workflows**: Complete request-to-response cycles
- **Graph Operations**: Real Neo4j operations with data persistence
- **Semantic Search**: Actual embedding generation and vector search
- **Relationship Traversal**: Complex graph queries and path finding
- **Performance**: Response times and resource usage
- **Data Consistency**: Transaction handling and rollback scenarios

#### Test Infrastructure
```typescript
// Example: Integration test setup
describe('Company Management Integration', () => {
  let neo4jContainer: StartedTestContainer;
  let graphClient: GraphClient;

  beforeAll(async () => {
    // Start Neo4j container
    neo4jContainer = await new Neo4jContainer()
      .withDatabase('neo4j')
      .withAdminPassword('test-password')
      .start();

    // Initialize graph client
    graphClient = new GraphClient({
      uri: neo4jContainer.getBoltUri(),
      username: 'neo4j',
      password: 'test-password'
    });

    await graphClient.initialize();
  });

  afterAll(async () => {
    await graphClient.close();
    await neo4jContainer.stop();
  });

  it('should create and retrieve company with relationships', async () => {
    // Test implementation
  });
});
```

#### Container Management
- **Neo4j**: Latest Neo4j 5.x with APOC plugins
- **Graphiti/Zep**: Mock or containerized semantic service
- **Operational DB**: SQLite for lightweight ops data
- **Network Isolation**: Each test gets isolated network namespace

## Global Test Setup

### Testcontainers Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000, // Allow time for container startup
    hookTimeout: 60000, // Allow time for global setup
  }
});

// test/global-setup.ts
export async function setup() {
  // Start shared test containers
  const containers = await startTestInfrastructure();

  // Store connection details for tests
  process.env.TEST_NEO4J_URI = containers.neo4j.getBoltUri();
  process.env.TEST_GRAPHITI_URL = containers.graphiti.getHttpUrl();

  return async () => {
    // Cleanup on teardown
    await stopTestInfrastructure(containers);
  };
}
```

### Namespace Strategy
Each test run gets a unique namespace to prevent interference:

```typescript
// test/setup.ts
beforeEach(() => {
  // Generate unique namespace for each test
  const testNamespace = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  process.env.GRAPH_NAMESPACE = testNamespace;
});

afterEach(async () => {
  // Clean up test namespace
  await cleanupNamespace(process.env.GRAPH_NAMESPACE);
});
```

### Test Data Management
- **Deterministic Data**: Consistent test data for reproducible results
- **Data Builders**: Factory functions for creating test entities
- **Cleanup Strategies**: Automatic cleanup of test data
- **Isolation**: Each test operates in clean environment

```typescript
// test/builders/company-builder.ts
export class CompanyBuilder {
  private data: Partial<Company> = {};

  withName(name: string): CompanyBuilder {
    this.data.name = name;
    return this;
  }

  withDomain(domain: string): CompanyBuilder {
    this.data.domain = domain;
    return this;
  }

  build(): Company {
    return {
      id: generateId(),
      name: this.data.name || 'Test Company',
      domain: this.data.domain || 'test.com',
      ...this.data
    };
  }
}
```

## Flakiness Mitigation

### Async Handling
- **Proper Awaiting**: All async operations properly awaited
- **Timeout Management**: Reasonable timeouts for all operations
- **Retry Logic**: Automatic retry for transient failures
- **Race Condition Prevention**: Proper synchronization

### Container Reliability
- **Health Checks**: Wait for containers to be fully ready
- **Port Management**: Dynamic port allocation to prevent conflicts
- **Resource Cleanup**: Guaranteed cleanup even on test failures
- **Startup Verification**: Verify services are responding before tests

### Test Isolation
- **Independent Tests**: Each test can run in isolation
- **Clean State**: Fresh state for each test run
- **No Shared Mutable State**: Avoid global variables and shared objects
- **Deterministic Ordering**: Tests don't depend on execution order

## Semantic Test Gating

### Conditional Execution
Tests requiring embeddings are conditionally executed based on API key availability:

```typescript
// test/semantic.test.ts
describe('Semantic Search', () => {
  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Skipping semantic tests: No embedding API key provided');
      return;
    }
  });

  it.skipIf(!process.env.OPENAI_API_KEY)('should find semantically similar companies', async () => {
    // Test semantic search functionality
  });
});
```

### Fallback Behavior
- **Mock Embeddings**: Use deterministic mock embeddings when API unavailable
- **Basic Functionality**: Core features work without semantic search
- **Graceful Degradation**: System handles missing embedding service

### CI Configuration
```yaml
# .github/workflows/test.yml
- name: Run Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    # Optional: Only set in specific environments
  run: pnpm test
```

## Performance Testing

### Load Testing
- **Concurrent Requests**: Test multiple simultaneous MCP requests
- **Large Datasets**: Performance with thousands of entities
- **Complex Queries**: Deep graph traversals and complex searches
- **Memory Usage**: Monitor memory consumption during operations

### Benchmarking
```typescript
// test/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  it('should handle company creation under 100ms', async () => {
    const start = performance.now();
    await createCompany(testCompanyData);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should search 1000 entities under 500ms', async () => {
    // Setup 1000 test entities
    await seedTestData(1000);

    const start = performance.now();
    const results = await searchEntities('technology companies');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## Test Organization

### Directory Structure
```
test/
├── unit/                    # Unit tests
│   ├── domain/             # Domain schema tests
│   ├── graph-client/       # Graph client tests
│   └── mcp-kit/           # MCP utilities tests
├── contract/               # Contract tests
│   ├── resources/         # Resource contract tests
│   └── tools/             # Tool contract tests
├── integration/            # Integration tests
│   ├── workflows/         # End-to-end workflows
│   └── performance/       # Performance tests
├── fixtures/               # Test data and fixtures
├── builders/              # Test data builders
├── helpers/               # Test utilities
└── setup/                 # Global setup and teardown
```

### Test Naming Conventions
- **Unit Tests**: `*.test.ts` - Fast, isolated tests
- **Integration Tests**: `*.integration.test.ts` - Slower, infrastructure-dependent
- **Contract Tests**: `*.contract.test.ts` - API contract validation
- **Performance Tests**: `*.perf.test.ts` - Performance benchmarks

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:contract

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test:integration
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Test Commands
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run test/unit",
    "test:contract": "vitest run test/contract",
    "test:integration": "vitest run test/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:perf": "vitest run test/performance"
  }
}
```

## Quality Gates

### Coverage Requirements
- **Unit Tests**: >80% line coverage
- **Integration Tests**: >70% workflow coverage
- **Contract Tests**: 100% API endpoint coverage

### Performance Requirements
- **Response Time**: <500ms for 95th percentile
- **Memory Usage**: <512MB for typical workloads
- **Concurrent Requests**: Handle 10 simultaneous requests

### Reliability Requirements
- **Test Stability**: <1% flaky test rate
- **Container Startup**: <30 seconds for full test environment
- **Cleanup Success**: 100% successful test cleanup rate

This comprehensive testing strategy ensures Coeus is reliable, performant, and maintainable while providing confidence in all system components and their interactions.
