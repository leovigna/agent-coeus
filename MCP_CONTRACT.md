# MCP Contract: Coeus CRM Resources & Tools

## Overview
The Coeus MCP server exposes a comprehensive set of resources and tools for managing CRM data through a knowledge graph. All operations maintain ACID properties and support semantic search capabilities.

## Resources

Resources provide read-only access to CRM data with rich metadata and relationship information.

### Companies Resource
**URI Pattern**: `coeus://companies/{id?}`
**Description**: Access to company profiles and metadata

#### List All Companies
**URI**: `coeus://companies`
**Response Fields**:
```typescript
{
  companies: Array<{
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    location?: {
      city?: string;
      state?: string;
      country?: string;
      timezone?: string;
    };
    description?: string;
    employee_count?: number;
    founded_year?: number;
    website?: string;
    metadata: Record<string, unknown>;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
  }>;
  total_count: number;
  has_more: boolean;
  next_cursor?: string;
}
```

#### Single Company
**URI**: `coeus://companies/{company_id}`
**Response Fields**:
```typescript
{
  company: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    size?: CompanySize;
    location?: Location;
    description?: string;
    employee_count?: number;
    founded_year?: number;
    website?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;

    // Relationship counts
    employee_count_actual: number;
    department_count: number;

    // Recent activity
    recent_hires: Array<{
      person_id: string;
      name: string;
      title?: string;
      start_date: string;
    }>;

    // Key contacts
    key_contacts: Array<{
      person_id: string;
      name: string;
      title?: string;
      email?: string;
      is_primary_contact: boolean;
    }>;
  };
}
```

### People Resource
**URI Pattern**: `coeus://people/{id?}`
**Description**: Access to person profiles and employment information

#### List All People
**URI**: `coeus://people`
**Response Fields**:
```typescript
{
  people: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
    department?: string;
    location?: Location;
    linkedin_url?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;

    // Current employment
    current_company?: {
      company_id: string;
      company_name: string;
      title?: string;
      department?: string;
      start_date?: string;
    };
  }>;
  total_count: number;
  has_more: boolean;
  next_cursor?: string;
}
```

#### Single Person
**URI**: `coeus://people/{person_id}`
**Response Fields**:
```typescript
{
  person: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
    department?: string;
    location?: Location;
    linkedin_url?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;

    // Employment history
    employment_history: Array<{
      company_id: string;
      company_name: string;
      title?: string;
      department?: string;
      start_date?: string;
      end_date?: string;
      is_current: boolean;
    }>;

    // Reporting relationships
    reports_to?: {
      person_id: string;
      name: string;
      title?: string;
    };

    direct_reports: Array<{
      person_id: string;
      name: string;
      title?: string;
      department?: string;
    }>;
  };
}
```

### Relationships Resource
**URI Pattern**: `coeus://relationships/{type?}`
**Description**: Access to relationship data and organizational structures

#### All Relationships
**URI**: `coeus://relationships`
**Response Fields**:
```typescript
{
  relationships: Array<{
    id: string;
    type: 'WORKS_AT' | 'REPORTS_TO';
    from_entity: {
      id: string;
      type: 'Person' | 'Company';
      name: string;
    };
    to_entity: {
      id: string;
      type: 'Person' | 'Company';
      name: string;
    };
    properties: Record<string, unknown>;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  total_count: number;
  has_more: boolean;
  next_cursor?: string;
}
```

#### Employment Relationships
**URI**: `coeus://relationships/employment`
**Response Fields**: Same as above, filtered to `WORKS_AT` relationships

#### Reporting Relationships
**URI**: `coeus://relationships/reporting`
**Response Fields**: Same as above, filtered to `REPORTS_TO` relationships

## Tools

Tools provide write operations and complex queries against the knowledge graph.

### Entity Management Tools

#### create_company
**Description**: Create a new company in the knowledge graph
**Request Schema**:
```typescript
{
  name: string; // Required, min 1 char
  domain?: string; // Optional, valid domain format
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location?: {
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
  description?: string;
  employee_count?: number; // Positive integer
  founded_year?: number; // Valid year
  website?: string; // Valid URL
  metadata?: Record<string, unknown>;
}
```

**Response Schema**:
```typescript
{
  success: true;
  company: {
    id: string;
    name: string;
    // ... all company fields
  };
  message: string;
}
```

**Error Responses**:
- `400`: Invalid input data (validation errors)
- `409`: Company already exists (duplicate name/domain)
- `500`: Internal server error

#### create_person
**Description**: Create a new person in the knowledge graph
**Request Schema**:
```typescript
{
  name: string; // Required, min 1 char
  email?: string; // Valid email format
  phone?: string;
  title?: string;
  department?: string;
  location?: Location;
  linkedin_url?: string; // Valid LinkedIn URL
  metadata?: Record<string, unknown>;
}
```

**Response Schema**:
```typescript
{
  success: true;
  person: {
    id: string;
    name: string;
    // ... all person fields
  };
  message: string;
}
```

#### update_entity
**Description**: Update an existing company or person
**Request Schema**:
```typescript
{
  entity_id: string; // Required
  entity_type: 'company' | 'person'; // Required
  updates: {
    // Partial entity data - only fields to update
    name?: string;
    email?: string; // For persons
    domain?: string; // For companies
    // ... other updatable fields
  };
}
```

**Response Schema**:
```typescript
{
  success: true;
  entity: {
    id: string;
    type: 'company' | 'person';
    // ... updated entity data
  };
  message: string;
}
```

#### delete_entity
**Description**: Remove an entity and all its relationships
**Request Schema**:
```typescript
{
  entity_id: string; // Required
  entity_type: 'company' | 'person'; // Required
  force?: boolean; // Default false, true to force delete with relationships
}
```

**Response Schema**:
```typescript
{
  success: true;
  deleted_entity: {
    id: string;
    type: 'company' | 'person';
    name: string;
  };
  relationships_removed: number;
  message: string;
}
```

### Relationship Management Tools

#### link_employment
**Description**: Create or update employment relationship between person and company
**Request Schema**:
```typescript
{
  person_id: string; // Required
  company_id: string; // Required
  title?: string;
  department?: string;
  start_date?: string; // ISO 8601 date
  end_date?: string; // ISO 8601 date, null for current employment
  is_primary?: boolean; // Default true for current employment
  metadata?: Record<string, unknown>;
}
```

**Response Schema**:
```typescript
{
  success: true;
  relationship: {
    id: string;
    type: 'WORKS_AT';
    person: { id: string; name: string; };
    company: { id: string; name: string; };
    properties: {
      title?: string;
      department?: string;
      start_date?: string;
      end_date?: string;
      is_primary: boolean;
    };
  };
  message: string;
}
```

#### link_reporting
**Description**: Create reporting relationship between two people
**Request Schema**:
```typescript
{
  subordinate_id: string; // Required, person who reports
  manager_id: string; // Required, person being reported to
  company_id?: string; // Optional, context company
  start_date?: string; // ISO 8601 date
  end_date?: string; // ISO 8601 date
  level?: number; // Reporting level (1 = direct report)
  metadata?: Record<string, unknown>;
}
```

**Response Schema**:
```typescript
{
  success: true;
  relationship: {
    id: string;
    type: 'REPORTS_TO';
    subordinate: { id: string; name: string; };
    manager: { id: string; name: string; };
    properties: {
      company_id?: string;
      start_date?: string;
      end_date?: string;
      level: number;
    };
  };
  message: string;
}
```

#### unlink_relationship
**Description**: Remove a specific relationship
**Request Schema**:
```typescript
{
  relationship_id: string; // Required
  // OR specify by entities and type
  from_id?: string;
  to_id?: string;
  relationship_type?: 'WORKS_AT' | 'REPORTS_TO';
}
```

**Response Schema**:
```typescript
{
  success: true;
  removed_relationship: {
    id: string;
    type: string;
    from_entity: { id: string; name: string; };
    to_entity: { id: string; name: string; };
  };
  message: string;
}
```

### Search and Query Tools

#### search_entities
**Description**: Semantic search across companies and people
**Request Schema**:
```typescript
{
  query: string; // Required, natural language query
  entity_types?: Array<'company' | 'person'>; // Default: both
  limit?: number; // Default: 20, max: 100
  include_relationships?: boolean; // Default: false
  filters?: {
    company_size?: Array<CompanySize>;
    industries?: Array<string>;
    locations?: Array<string>;
    departments?: Array<string>;
  };
  semantic_threshold?: number; // 0.0-1.0, default: 0.7
}
```

**Response Schema**:
```typescript
{
  results: Array<{
    entity: {
      id: string;
      type: 'company' | 'person';
      name: string;
      // ... relevant entity fields
    };
    relevance_score: number; // 0.0-1.0
    match_reasons: Array<string>; // Why this entity matched
    relationships?: Array<{
      type: string;
      related_entity: { id: string; name: string; };
    }>;
  }>;
  total_results: number;
  query_time_ms: number;
  semantic_search_used: boolean;
}
```

#### get_relationships
**Description**: Traverse graph relationships from a starting entity
**Request Schema**:
```typescript
{
  start_entity_id: string; // Required
  relationship_types?: Array<'WORKS_AT' | 'REPORTS_TO'>; // Default: all
  direction?: 'incoming' | 'outgoing' | 'both'; // Default: both
  max_depth?: number; // Default: 2, max: 5
  limit?: number; // Default: 50, max: 200
  include_paths?: boolean; // Include full paths, default: false
}
```

**Response Schema**:
```typescript
{
  start_entity: {
    id: string;
    type: 'company' | 'person';
    name: string;
  };
  relationships: Array<{
    depth: number;
    relationship: {
      id: string;
      type: string;
      properties: Record<string, unknown>;
    };
    connected_entity: {
      id: string;
      type: 'company' | 'person';
      name: string;
      // ... relevant fields
    };
    path?: Array<{ entity_id: string; relationship_type: string; }>; // If include_paths=true
  }>;
  total_found: number;
  max_depth_reached: number;
}
```

#### find_path
**Description**: Find shortest path between two entities
**Request Schema**:
```typescript
{
  from_entity_id: string; // Required
  to_entity_id: string; // Required
  relationship_types?: Array<'WORKS_AT' | 'REPORTS_TO'>; // Default: all
  max_depth?: number; // Default: 6, max: 10
}
```

**Response Schema**:
```typescript
{
  path_found: boolean;
  path?: {
    length: number;
    entities: Array<{
      id: string;
      type: 'company' | 'person';
      name: string;
    }>;
    relationships: Array<{
      type: string;
      from_index: number; // Index in entities array
      to_index: number;
      properties: Record<string, unknown>;
    }>;
  };
  alternative_paths?: Array<{
    length: number;
    // ... same structure as main path
  }>;
  search_time_ms: number;
}
```

## Validation Rules

### Input Validation
- **Entity Names**: 1-200 characters, no leading/trailing whitespace
- **Email Addresses**: Valid RFC 5322 format
- **Domain Names**: Valid domain format, no protocol
- **URLs**: Valid HTTP/HTTPS URLs
- **Dates**: ISO 8601 format (YYYY-MM-DD or full datetime)
- **Phone Numbers**: E.164 format preferred, flexible parsing

### Business Rules
- **Company Uniqueness**: Name + domain combination must be unique
- **Person Uniqueness**: Email must be unique if provided
- **Employment Logic**: Person can have multiple employments but only one current per company
- **Reporting Logic**: Person cannot report to themselves (direct or indirect)
- **Relationship Consistency**: Employment must exist before reporting relationships

### Idempotency
- **Entity Creation**: Duplicate creates return existing entity (409 status)
- **Relationship Creation**: Duplicate relationships update existing
- **Updates**: Only changed fields trigger updates
- **Deletions**: Deleting non-existent entities returns success

## Error Taxonomy

### Client Errors (4xx)
- **400 Bad Request**: Invalid input data, validation failures
- **401 Unauthorized**: Missing or invalid authentication (future)
- **403 Forbidden**: Insufficient permissions (future)
- **404 Not Found**: Entity or relationship not found
- **409 Conflict**: Duplicate entity, constraint violation
- **422 Unprocessable Entity**: Valid format but business rule violation

### Server Errors (5xx)
- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Database connection failure
- **503 Service Unavailable**: System maintenance, overload
- **504 Gateway Timeout**: Database query timeout

### Error Response Format
```typescript
{
  success: false;
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable description
    details?: Record<string, unknown>; // Additional context
    validation_errors?: Array<{
      field: string;
      message: string;
      value?: unknown;
    }>;
  };
  request_id: string; // For debugging
}
```

## Pagination

### Cursor-based Pagination
All list operations support cursor-based pagination:

**Request Parameters**:
- `limit`: Number of items (default: 20, max: 100)
- `cursor`: Opaque cursor for next page

**Response Format**:
```typescript
{
  data: Array<T>;
  pagination: {
    has_more: boolean;
    next_cursor?: string;
    total_count?: number; // Approximate, may be expensive
  };
}
```

### Sorting
Default sorting by `created_at DESC`, with support for:
- `name ASC/DESC`
- `updated_at ASC/DESC`
- `relevance DESC` (search results only)

## Rate Limiting

### Limits (Future Implementation)
- **Read Operations**: 1000 requests/minute per client
- **Write Operations**: 100 requests/minute per client
- **Search Operations**: 50 requests/minute per client
- **Bulk Operations**: 10 requests/minute per client

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

This MCP contract provides a comprehensive interface for CRM operations while maintaining consistency, reliability, and performance across all interactions with the Coeus knowledge graph.
