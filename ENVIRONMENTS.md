# Environment Configurations: Coeus MCP CRM

## Overview
Coeus supports two primary environment configurations: local development with self-hosted Graphiti and production with cloud-hosted Zep. Each environment has specific setup requirements and configuration patterns.

## Local Development Environment

### Architecture
```
Local Development Stack:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coeus MCP     │───▶│  Local Graphiti │───▶│   Neo4j Local  │
│    Server       │    │   (Docker)      │    │   (Docker)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
│   (Local File)  │
└─────────────────┘
```

### Prerequisites
```bash
# Required software
Node.js: 20.x or later
pnpm: 8.x or later
Docker: 24.x or later
Docker Compose: 2.x or later

# Optional for development
Neo4j Desktop: For graph visualization
VSCode: Recommended IDE
```

### Local Setup Steps

#### 1. Clone and Install
```bash
git clone git@github.com:leovigna/agent-coeus.git
cd agent-coeus
pnpm install
```

#### 2. Start Local Services
```bash
# Start local Graphiti and Neo4j services
docker-compose up -d

# Services started:
# - Neo4j: localhost:7474 (browser), localhost:7687 (bolt)
# - Graphiti: localhost:8080 (API)
# - Redis: localhost:6379 (caching)
```

#### 3. Environment Configuration
Create `.env.local`:
```bash
# === LOCAL DEVELOPMENT CONFIGURATION ===
NODE_ENV=development
LOG_LEVEL=debug

# Graph Database (Local)
GRAPHITI_BASE_URL=http://localhost:8080
GRAPHITI_API_KEY=local-dev-key
GRAPH_NAMESPACE=dev_local

# Neo4j (Local Docker)
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=dev-password

# Operational Database (Local)
DATABASE_URL=sqlite:./data/coeus-dev.db

# MCP Server
MCP_PORT=3000
MCP_HOST=localhost

# Optional: Local embedding fallback
OPENAI_API_KEY=your_openai_key_here
EMBEDDING_PROVIDER=graphiti

# Development Features
METRICS_ENABLED=true
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 4. Docker Compose Configuration
`docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  neo4j:
    image: neo4j:5.15-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/dev-password
      NEO4J_PLUGINS: '["apoc", "graph-data-science"]'
      NEO4J_apoc_export_file_enabled: true
      NEO4J_apoc_import_file_enabled: true
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
      - neo4j_import:/var/lib/neo4j/import
      - neo4j_plugins:/plugins

  graphiti:
    image: graphiti/graphiti:latest
    ports:
      - "8080:8080"
    environment:
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_USERNAME: neo4j
      NEO4J_PASSWORD: dev-password
      GRAPHITI_API_KEY: local-dev-key
      EMBEDDING_PROVIDER: openai
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
    depends_on:
      - neo4j
    volumes:
      - graphiti_data:/app/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  neo4j_data:
  neo4j_logs:
  neo4j_import:
  neo4j_plugins:
  graphiti_data:
  redis_data:
```

#### 5. Development Commands
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Build packages
pnpm build

# Run tests (with local services)
pnpm test

# Start development server
pnpm dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Local Development Features
- **Hot Reload**: Automatic server restart on code changes
- **Debug Logging**: Verbose logging for development
- **Local Data**: All data stored locally for offline development
- **Fast Iteration**: No external API rate limits
- **Graph Visualization**: Neo4j Browser available at http://localhost:7474

---

## Production Environment

### Architecture
```
Production Stack:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coeus MCP     │───▶│   Zep Cloud     │───▶│  Neo4j Cloud    │
│   (Container)   │    │   (Hosted)      │    │   (Managed)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Turso DB      │
│   (Managed)     │
└─────────────────┘
```

### Prerequisites
- **Zep Cloud Account**: Sign up at https://zep.ai
- **Neo4j AuraDB**: Managed Neo4j instance
- **Turso Account**: Managed SQLite database at https://turso.tech
- **Container Runtime**: Docker, Kubernetes, or similar

### Production Setup Steps

#### 1. Service Provisioning

**Zep Cloud Setup:**
```bash
# 1. Create Zep account at https://zep.ai
# 2. Create new project
# 3. Get API key and base URL
# 4. Configure Neo4j connection in Zep dashboard
```

**Neo4j AuraDB Setup:**
```bash
# 1. Create AuraDB instance at https://neo4j.com/cloud/aura/
# 2. Choose appropriate instance size
# 3. Get connection URI and credentials
# 4. Enable APOC and GDS plugins if needed
```

**Turso Setup:**
```bash
# 1. Create Turso account at https://turso.tech
# 2. Install Turso CLI: curl -sSfL https://get.tur.so/install.sh | bash
# 3. Create database: turso db create coeus-prod
# 4. Get database URL: turso db show coeus-prod --url
# 5. Create auth token: turso db tokens create coeus-prod
```

#### 2. Environment Configuration
Create `.env.production`:
```bash
# === PRODUCTION CONFIGURATION ===
NODE_ENV=production
LOG_LEVEL=info

# Graph Database (Zep Cloud)
GRAPHITI_BASE_URL=https://api.zep.ai/v1
GRAPHITI_API_KEY=zep_prod_key_here
GRAPH_NAMESPACE=prod_main

# Neo4j (AuraDB)
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password

# Operational Database (Turso)
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your_turso_auth_token
DATABASE_TIMEOUT_MS=10000

# MCP Server
MCP_PORT=3000
MCP_HOST=0.0.0.0
REQUEST_TIMEOUT_MS=30000

# Security
CORS_ORIGINS=https://your-app.com,https://admin.your-app.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
METRICS_ENABLED=true
LOG_LEVEL=info

# Optional: Fallback embedding provider
OPENAI_API_KEY=your_openai_prod_key
EMBEDDING_PROVIDER=zep
```

#### 3. Docker Production Image
`Dockerfile.production`:
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY configs/ ./configs/
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production runtime
FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S coeus -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=coeus:nodejs /app/apps/coeus-mcp/dist ./
COPY --from=builder --chown=coeus:nodejs /app/node_modules ./node_modules

USER coeus

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"]
```

#### 4. Kubernetes Deployment
`k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coeus-mcp
  labels:
    app: coeus-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: coeus-mcp
  template:
    metadata:
      labels:
        app: coeus-mcp
    spec:
      containers:
      - name: coeus-mcp
        image: coeus/mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: GRAPHITI_BASE_URL
          value: "https://api.zep.ai/v1"
        - name: GRAPHITI_API_KEY
          valueFrom:
            secretKeyRef:
              name: coeus-secrets
              key: graphiti-api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: coeus-secrets
              key: database-url
        - name: DATABASE_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: coeus-secrets
              key: database-auth-token
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Production Features
- **High Availability**: Multiple replicas with load balancing
- **Managed Services**: Cloud-hosted databases and services
- **Security**: TLS encryption, secret management, rate limiting
- **Monitoring**: Comprehensive metrics and logging
- **Scalability**: Auto-scaling based on demand
- **Backup**: Automated backups of all data

---

## Environment Comparison

| Feature | Local Development | Production |
|---------|------------------|------------|
| **Graphiti** | Local Docker container | Zep Cloud (managed) |
| **Neo4j** | Local Docker container | AuraDB (managed) |
| **Ops Database** | SQLite file | Turso (managed SQLite) |
| **Caching** | Local Redis | Redis Cloud/ElastiCache |
| **Secrets** | `.env.local` file | Kubernetes secrets/Vault |
| **Monitoring** | Basic logging | Full observability stack |
| **Scaling** | Single instance | Auto-scaling |
| **Backup** | Manual/none | Automated |
| **Security** | Minimal | Full security hardening |

## Environment Switching

### Configuration Management
```typescript
// config/environment.ts
export const config = {
  development: {
    graphiti: {
      baseUrl: 'http://localhost:8080',
      apiKey: 'local-dev-key'
    },
    neo4j: {
      uri: 'neo4j://localhost:7687',
      username: 'neo4j',
      password: 'dev-password'
    }
  },
  production: {
    graphiti: {
      baseUrl: process.env.GRAPHITI_BASE_URL!,
      apiKey: process.env.GRAPHITI_API_KEY!
    },
    neo4j: {
      uri: process.env.NEO4J_URI!,
      username: process.env.NEO4J_USERNAME!,
      password: process.env.NEO4J_PASSWORD!
    }
  }
};
```

### Deployment Scripts
```bash
# Deploy to development
pnpm deploy:dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:prod
```

This dual-environment approach provides developers with a complete local development experience while ensuring production deployments use robust, managed services for reliability and scalability.
