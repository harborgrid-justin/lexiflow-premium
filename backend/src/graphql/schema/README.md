# GraphQL Schema Documentation

## Overview

This directory contains the comprehensive GraphQL schema documentation for LexiFlow AI Legal Suite. The API uses NestJS code-first approach, where GraphQL types are defined using TypeScript decorators.

## Schema Organization

### Type Definitions (`/graphql/types/`)

All GraphQL object types, enums, and connection types are defined here:

- **case.type.ts** - Case management types (Case, Party, Motion, DocketEntry, etc.)
- **user.type.ts** - User and authentication types
- **client.type.ts** - Client management types with billing details
- **document.type.ts** - Document management and version control types
- **billing.type.ts** - Billing, time entries, invoices, and expenses
- **discovery.type.ts** - Discovery requests, depositions, and productions
- **compliance.type.ts** - Audit logs, conflict checks, and ethical walls
- **analytics.type.ts** - Dashboard metrics and reporting types
- **common.type.ts** - Shared types like PageInfo, SortOrder, etc.

### Input Types (`/graphql/inputs/`)

All GraphQL input types for mutations and query filters:

- **case.input.ts** - Case creation, updates, and filters
- **user.input.ts** - User management inputs
- **client.input.ts** - Client management inputs
- **document.input.ts** - Document upload and update inputs
- **billing.input.ts** - Billing and invoice inputs
- **discovery.input.ts** - Discovery request inputs
- **compliance.input.ts** - Audit log and compliance inputs
- **pagination.input.ts** - Pagination and sorting inputs

### Resolvers (`/graphql/resolvers/`)

GraphQL resolvers implementing queries, mutations, and subscriptions:

- **case.resolver.ts** - Case CRUD operations
- **user.resolver.ts** - User management operations
- **client.resolver.ts** - Client management operations
- **document.resolver.ts** - Document management operations
- **billing.resolver.ts** - Time entries, invoices, and expenses
- **discovery.resolver.ts** - Discovery operations
- **compliance.resolver.ts** - Audit logs and compliance
- **analytics.resolver.ts** - Dashboard and reports

## Key Features

### Pagination

All list queries support both cursor-based and offset-based pagination:

```graphql
query {
  cases(
    pagination: {
      limit: 20
      offset: 0
      # OR use cursor-based
      after: "cursor"
      before: "cursor"
      first: 20
      last: 20
    }
  ) {
    edges {
      node {
        id
        title
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Filtering

Advanced filtering on all list queries:

```graphql
query {
  cases(
    filter: {
      status: ACTIVE
      type: CIVIL
      search: "contract dispute"
      dateRange: {
        start: "2024-01-01"
        end: "2024-12-31"
      }
    }
  ) {
    edges {
      node {
        id
        title
      }
    }
  }
}
```

### Subscriptions

Real-time updates via GraphQL subscriptions:

```graphql
subscription {
  caseUpdated(id: "case-id") {
    id
    title
    status
  }
}

subscription {
  documentUploaded(caseId: "case-id") {
    id
    fileName
    status
  }
}
```

### Field Resolvers

Lazy loading of related data using DataLoaders to prevent N+1 queries:

```graphql
query {
  case(id: "case-id") {
    id
    title
    client {
      # Loaded via DataLoader
      id
      name
    }
    documents {
      # Batch loaded for efficiency
      id
      fileName
    }
    timeEntries {
      # Batch loaded
      id
      hours
    }
  }
}
```

## Authentication & Authorization

All queries and mutations require authentication via `@UseGuards(GqlAuthGuard)`:

- JWT token must be provided in Authorization header
- User permissions are checked for sensitive operations
- Audit logs are automatically created for all mutations

## Error Handling

Standard GraphQL errors with custom extensions:

```json
{
  "errors": [
    {
      "message": "Case not found",
      "extensions": {
        "code": "NOT_FOUND",
        "statusCode": 404
      }
    }
  ]
}
```

## Complexity Analysis

Query complexity is limited to prevent abuse:

- Maximum query depth: 10 levels
- Maximum complexity score: 1000 points
- Automatically calculated based on requested fields

## Custom Scalars

- **DateTime** - ISO 8601 datetime strings
- **JSON** - Arbitrary JSON objects
- **Money** - Decimal with 2 decimal places (stored as string)

## Example Queries

### Create a Case

```graphql
mutation {
  createCase(
    input: {
      title: "Smith v. Johnson Contract Dispute"
      type: CIVIL
      status: ACTIVE
      clientId: "client-id"
      court: "Superior Court of California"
      jurisdiction: "California"
    }
  ) {
    id
    title
    caseNumber
  }
}
```

### Get Cases with Filters

```graphql
query {
  cases(
    filter: {
      status: ACTIVE
      type: CIVIL
    }
    pagination: {
      limit: 20
      offset: 0
    }
  ) {
    edges {
      node {
        id
        title
        caseNumber
        client {
          name
        }
      }
    }
    totalCount
  }
}
```

### Create Time Entry

```graphql
mutation {
  createTimeEntry(
    input: {
      caseId: "case-id"
      description: "Legal research on contract law"
      hours: 2.5
      entryDate: "2024-01-15"
      billable: true
    }
  ) {
    id
    description
    hours
    amount
  }
}
```

### Get Audit Logs

```graphql
query {
  auditLogs(
    filter: {
      action: UPDATE
      entity: "Case"
      startDate: "2024-01-01"
      endDate: "2024-01-31"
    }
    pagination: {
      limit: 50
    }
  ) {
    edges {
      node {
        id
        action
        entity
        entityId
        user {
          firstName
          lastName
        }
        timestamp
      }
    }
  }
}
```

## DataLoader Usage

DataLoaders are automatically injected into resolvers for efficient batch loading:

- **CaseLoader** - Batch load cases
- **UserLoader** - Batch load users
- **DocumentLoader** - Batch load documents
- **ClientLoader** - Batch load clients
- **BillingLoader** - Batch load time entries and invoices
- **ComplianceLoader** - Batch load audit logs
- **DiscoveryLoader** - Batch load discovery items

## Performance Considerations

1. **Use field selection** - Only request fields you need
2. **Use pagination** - Don't request large lists without pagination
3. **Avoid deep nesting** - Keep query depth reasonable
4. **Use subscriptions** - For real-time updates instead of polling
5. **Batch mutations** - Use bulk operations when available

## Schema Generation

The schema is auto-generated at build time to `/backend/src/graphql/schema.gql`.

To regenerate:
```bash
npm run build
```

## Testing

GraphQL Playground is available in development at:
```
http://localhost:3000/graphql
```

## Support

For issues or questions about the GraphQL API, please contact the development team.
