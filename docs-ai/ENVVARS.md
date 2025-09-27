# Environment Configuration: Coeus MCP CRM

## Overview
This document defines all environment variables used across the Coeus system. Variables are organized by component and include descriptions, default values, and validation requirements.

## Environment Variable Categories

### Graph Database Configuration
Variables for Zep Cloud integration.

#### `ZEP_API_KEY`
- **Component**: graph-client, coeus-mcp
- **Required**: Yes
- **Description**: Authentication key for Zep Cloud service
- **Format**: String (typically UUID or JWT)
- **Example**: `zep_1234567890abcdef`
- **Validation**: Non-empty string, length > 10 characters
- **Security**: Sensitive - never log or expose

#### `ZEP_API_URL`
- **Component**: graph-client, coeus-mcp
- **Required**: No
- **Description**: Base URL for Zep Cloud service
- **Format**: Valid HTTP/HTTPS URL
- **Default**: `https://api.getzep.com`
- **Example**: `https://api.getzep.com`
- **Validation**: Must be valid URL, HTTPS recommended for production

### Application Configuration
Core application runtime settings.

#### `NODE_ENV`
- **Component**: All components
- **Required**: No
- **Description**: Node.js environment mode
- **Format**: Enum string
- **Default**: `development`
- **Values**: `development`, `production`, `test`
- **Validation**: Must be one of allowed values

#### `LOG_LEVEL`
- **Component**: All components
- **Required**: No
- **Description**: Logging verbosity level
- **Format**: Enum string
- **Default**: `info`
- **Values**: `error`, `warn`, `info`, `debug`, `trace`
- **Validation**: Must be one of allowed values

#### `MCP_PORT`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Port for MCP server to listen on
- **Format**: Integer
- **Default**: `3000`
- **Range**: 1024-65535
- **Validation**: Valid port number, not in use

#### `MCP_HOST`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Host interface for MCP server
- **Format**: IP address or hostname
- **Default**: `0.0.0.0`
- **Example**: `localhost`, `0.0.0.0`
- **Validation**: Valid IP address or hostname

#### `REQUEST_TIMEOUT_MS`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Request timeout in milliseconds
- **Format**: Integer
- **Default**: `30000` (30 seconds)
- **Range**: 1000-300000
- **Validation**: Positive integer within range

### Operational Database Configuration
Settings for the operational database (request logs, server state).

#### `DATABASE_URL`
- **Component**: ops-db, coeus-mcp
- **Required**: Yes
- **Description**: Connection string for operational database
- **Format**: Database URL
- **Example**: `sqlite:./data/coeus.db` or `postgresql://user:pass@host:5432/db`
- **Validation**: Valid database connection string
- **Security**: May contain credentials - handle securely

#### `DATABASE_POOL_SIZE`
- **Component**: ops-db
- **Required**: No
- **Description**: Maximum database connection pool size
- **Format**: Integer
- **Default**: `10`
- **Range**: 1-100
- **Validation**: Positive integer

#### `DATABASE_TIMEOUT_MS`
- **Component**: ops-db
- **Required**: No
- **Description**: Database query timeout in milliseconds
- **Format**: Integer
- **Default**: `5000` (5 seconds)
- **Range**: 1000-60000
- **Validation**: Positive integer within range

### Embedding and AI Configuration
Optional configuration for semantic search capabilities.

#### `OPENAI_API_KEY`
- **Component**: graph-client (fallback embeddings)
- **Required**: No
- **Description**: OpenAI API key for embedding generation
- **Format**: String starting with 'sk-'
- **Example**: `sk-1234567890abcdef...`
- **Validation**: Starts with 'sk-', length > 20
- **Security**: Sensitive - never log or expose

#### `EMBEDDING_PROVIDER`
- **Component**: graph-client
- **Required**: No
- **Description**: Which embedding service to use
- **Format**: Enum string
- **Default**: `zep` (via Zep Cloud)
- **Values**: `zep`, `openai`, `anthropic`, `local`
- **Validation**: Must be one of allowed values

#### `EMBEDDING_MODEL`
- **Component**: graph-client
- **Required**: No
- **Description**: Specific embedding model to use
- **Format**: String
- **Default**: Provider-specific default
- **Example**: `text-embedding-3-small`, `all-MiniLM-L6-v2`

#### `SEMANTIC_SEARCH_THRESHOLD`
- **Component**: graph-client, coeus-mcp
- **Required**: No
- **Description**: Minimum similarity score for semantic search results
- **Format**: Float
- **Default**: `0.7`
- **Range**: 0.0-1.0
- **Validation**: Float between 0 and 1

### Development and Testing Configuration
Variables specific to development and testing environments.

#### `TEST_DATABASE_URL`
- **Component**: All components (test mode)
- **Required**: No (test environments)
- **Description**: Database URL for testing
- **Format**: Database URL
- **Default**: `sqlite::memory:` (in-memory SQLite)
- **Example**: `sqlite:./test/test.db`

#### `TEST_ZEP_API_URL`
- **Component**: graph-client (integration tests)
- **Required**: No (set by Testcontainers)
- **Description**: Zep Cloud service URL for testing
- **Format**: HTTP URL
- **Example**: `http://localhost:8080`

#### `CI`
- **Component**: All components
- **Required**: No (set by CI systems)
- **Description**: Indicates running in CI environment
- **Format**: Boolean string
- **Values**: `true`, `false`
- **Default**: `false`

### Security and Monitoring Configuration
Security and observability settings.

#### `CORS_ORIGINS`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Allowed CORS origins (comma-separated)
- **Format**: Comma-separated URLs
- **Default**: `*` (development), specific origins (production)
- **Example**: `https://app.example.com,https://admin.example.com`

#### `RATE_LIMIT_WINDOW_MS`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Rate limiting window in milliseconds
- **Format**: Integer
- **Default**: `60000` (1 minute)
- **Range**: 1000-3600000
- **Validation**: Positive integer

#### `RATE_LIMIT_MAX_REQUESTS`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Maximum requests per rate limit window
- **Format**: Integer
- **Default**: `100`
- **Range**: 1-10000
- **Validation**: Positive integer

#### `METRICS_ENABLED`
- **Component**: coeus-mcp
- **Required**: No
- **Description**: Enable metrics collection
- **Format**: Boolean string
- **Default**: `true`
- **Values**: `true`, `false`

## Environment Loading Strategy

### Loading Order
1. **System Environment**: OS environment variables
2. **`.env` Files**: Local development overrides
3. **Default Values**: Fallback to documented defaults
4. **Validation**: Ensure all required variables are present and valid

### File Hierarchy
```
.env.local          # Local overrides (gitignored)
.env.development    # Development defaults
.env.production     # Production defaults
.env                # Base configuration
```

### Component-Specific Loading
Each component loads only the variables it needs:

#### `apps/coeus-mcp/`
```typescript
// Required variables
const config = {
  zep: {
    apiKey: process.env.ZEP_API_KEY!,   // Required
    apiUrl: process.env.ZEP_API_URL || 'https://api.getzep.com'
  },
  server: {
    port: parseInt(process.env.MCP_PORT || '3000'),
    host: process.env.MCP_HOST || '0.0.0.0'
  },
  database: {
    url: process.env.DATABASE_URL! // Required
  }
};
```

#### `packages/graph-client/`
```typescript
const config = {
  zep: {
    apiKey: process.env.ZEP_API_KEY!,
    apiUrl: process.env.ZEP_API_URL || 'https://api.getzep.com'
  },
  embeddings: {
    provider: process.env.EMBEDDING_PROVIDER || 'zep',
    openaiKey: process.env.OPENAI_API_KEY,
    threshold: parseFloat(process.env.SEMANTIC_SEARCH_THRESHOLD || '0.7')
  }
};
```

## Validation and Error Handling

### Validation Rules
```typescript
// Example validation schema
const envSchema = z.object({
  ZEP_API_KEY: z.string().min(10),
  ZEP_API_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).optional(),
  MCP_PORT: z.coerce.number().int().min(1024).max(65535).optional(),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  SEMANTIC_SEARCH_THRESHOLD: z.coerce.number().min(0).max(1).optional()
});
```

### Error Handling
- **Missing Required Variables**: Application fails to start with clear error message
- **Invalid Format**: Validation error with specific field and expected format
- **Connection Failures**: Retry logic with exponential backoff
- **Runtime Changes**: Hot reload for non-critical configuration

## Security Considerations

### Sensitive Variables
Never log or expose these variables:
- `ZEP_API_KEY`
- `DATABASE_URL` (if contains credentials)
- `OPENAI_API_KEY`

### Best Practices
- **Use Secret Management**: In production, use proper secret management systems
- **Rotate Keys**: Regular rotation of API keys and passwords
- **Least Privilege**: Only provide access to variables each component needs
- **Audit Access**: Log access to sensitive configuration
- **Environment Isolation**: Separate configurations for different environments

## Development Setup

### Local Development
Create `.env.local` file:
```bash
# Required for local development
ZEP_API_KEY=your_zep_api_key_here
DATABASE_URL=sqlite:./data/coeus-dev.db

# Optional for enhanced features
OPENAI_API_KEY=your_openai_key_here
LOG_LEVEL=debug
```

### Testing Setup
Test environments use:
```bash
NODE_ENV=test
DATABASE_URL=sqlite::memory:
LOG_LEVEL=warn
# Testcontainers will set TEST_* variables automatically
```

This environment configuration ensures consistent, secure, and flexible deployment across all environments while maintaining clear documentation for all configuration options.
