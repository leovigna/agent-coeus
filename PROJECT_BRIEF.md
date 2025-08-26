# Project Brief: Coeus — MCP CRM (Companies & Employees)

## Overview
Coeus is a knowledge-graph first AI assistant built around a CRM system for managing companies, people, and their relationships. It operates through a single MCP (Model Context Protocol) server surface, storing all CRM knowledge in a graph database to enable semantic + graph retrieval, entity linking, and relationship-aware reasoning.

## What is the Coeus Agent?
The Coeus agent is an AI assistant that interacts with users and tools through a single MCP server surface. All CRM knowledge (Companies, People, relationships) is stored in a graph (Graphiti/Zep over Neo4j) to enable semantic + graph retrieval, entity linking, and relationship-aware reasoning. The MCP server exposes CRUD + linking tools over that graph, plus search. Over time, Coeus will integrate additional sources (calendar, email, docs) so the agent can answer "who/what/when" queries across systems, grounded by the graph.

## Core Architecture Principles
- **Graph as Source of Truth**: All CRM data lives in the knowledge graph, not traditional relational databases
- **MCP as Control Plane**: Single MCP server exposes all tools and resources for agent interaction
- **Semantic + Graph Search**: Combines vector embeddings with graph traversal for intelligent retrieval
- **Entity Linking**: Automatic resolution and linking of entities across data sources
- **Relationship-Aware Reasoning**: Leverages graph structure for contextual understanding

## Objectives
1. Build a graph-first CRM system that stores companies, people, and relationships
2. Provide semantic search capabilities over the knowledge graph
3. Enable relationship-aware queries and reasoning
4. Create a clean MCP interface for AI agent interaction
5. Establish foundation for future multi-source integrations

## Scope
### In Scope (MVP)
- Core entities: Company, Person, and their relationships (WORKS_AT, REPORTS_TO)
- Graph storage using Graphiti/Zep over Neo4j
- MCP server with CRUD operations and search tools
- Semantic search with vector embeddings
- Basic relationship traversal and querying
- Monorepo structure with packages for graph client, domain schemas, and MCP server

### Future Integrations (Post-MVP)
- Calendar integration for meeting context
- Email integration for communication history
- Document integration for shared knowledge
- Advanced "who/what/when" cross-system queries

## Non-Goals
- Traditional relational database CRM features
- Complex workflow automation
- Direct user interface (agent-first approach)
- Real-time collaboration features

## MCP Contract Summary
### Resources
- Companies: Read-only access to company profiles and metadata
- People: Read-only access to person profiles and relationships
- Relationships: Read-only access to employment and reporting structures

### Tools
- `create_company`: Add new company to graph
- `create_person`: Add new person to graph
- `link_employment`: Create WORKS_AT relationship
- `link_reporting`: Create REPORTS_TO relationship
- `search_entities`: Semantic search across companies and people
- `get_relationships`: Traverse graph relationships
- `update_entity`: Modify company or person attributes
- `delete_entity`: Remove entities and relationships

## Data Placement Rules
- **Graph Database (Neo4j)**: All CRM entities, relationships, and semantic embeddings
- **Operational Database**: MCP server state, request logs, and system metadata only
- **No Duplication**: Single source of truth in the graph

## Success Criteria
1. Agent can create and manage companies and people through MCP tools
2. Semantic search returns relevant entities based on natural language queries
3. Relationship queries work correctly (e.g., "Who reports to John at Acme Corp?")
4. System handles entity linking and deduplication automatically
5. MCP contract is stable and well-documented
6. Test coverage demonstrates reliability of core operations
7. Performance is acceptable for typical CRM workloads (< 500ms for most queries)

## Technical Constraints
- Node.js 20+ runtime environment
- Neo4j 5.x for graph storage
- Graphiti/Zep for graph operations and embeddings
- MCP protocol compliance for all external interfaces
- TypeScript for type safety across all components
