# GraphQL API Quick Reference Guide

Quick reference for the LexiFlow AI Legal Suite GraphQL API layer.

## Table of Contents
1. [Parties API](#parties-api)
2. [Motions API](#motions-api)
3. [Docket API](#docket-api)
4. [Subscriptions](#subscriptions)

---

## Parties API

### Query All Parties
```graphql
query GetParties($filter: PartyFilterInput, $pagination: PaginationInput) {
  parties(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        name
        role
        type
        email
        phone
        address {
          street
          city
          state
          zipCode
        }
        contacts {
          id
          name
          email
          phone
          isPrimary
        }
        case {
          id
          caseNumber
          title
        }
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

### Query Parties by Case
```graphql
query GetPartiesByCase($caseId: ID!) {
  partiesByCase(caseId: $caseId) {
    id
    name
    role
    email
    phone
  }
}
```

### Create Party
```graphql
mutation CreateParty($input: CreatePartyInput!) {
  createParty(input: $input) {
    id
    name
    role
    type
    email
    phone
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "caseId": "case-123",
    "name": "John Doe",
    "role": "PLAINTIFF",
    "type": "INDIVIDUAL",
    "email": "john.doe@example.com",
    "phone": "+1-555-0100",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    }
  }
}
```

### Update Party
```graphql
mutation UpdateParty($id: ID!, $input: UpdatePartyInput!) {
  updateParty(id: $id, input: $input) {
    id
    name
    email
    updatedAt
  }
}
```

### Create Party Contact
```graphql
mutation CreatePartyContact($input: CreatePartyContactInput!) {
  createPartyContact(input: $input) {
    id
    name
    email
    phone
    isPrimary
  }
}
```

---

## Motions API

### Query All Motions
```graphql
query GetMotions($filter: MotionFilterInput, $pagination: PaginationInput) {
  motions(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        title
        type
        status
        description
        filedDate
        hearingDate
        decisionDate
        ruling
        filedBy
        assignedTo {
          id
          name
          email
        }
        case {
          id
          caseNumber
          title
        }
        hearings {
          id
          scheduledDate
          location
          judge
          outcome
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

### Query Motions by Case
```graphql
query GetMotionsByCase($caseId: ID!) {
  motionsByCase(caseId: $caseId) {
    id
    title
    type
    status
    filedDate
    hearingDate
  }
}
```

### Create Motion
```graphql
mutation CreateMotion($input: CreateMotionInput!) {
  createMotion(input: $input) {
    id
    title
    type
    status
    filedDate
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "caseId": "case-123",
    "title": "Motion for Summary Judgment",
    "type": "SUMMARY_JUDGMENT",
    "description": "Requesting summary judgment on all counts",
    "filedDate": "2025-12-10T00:00:00Z",
    "hearingDate": "2025-12-20T10:00:00Z",
    "filedBy": "Plaintiff's Counsel",
    "relief": "Grant summary judgment in favor of plaintiff"
  }
}
```

### Update Motion Status
```graphql
mutation UpdateMotionStatus($id: ID!, $status: String!) {
  updateMotionStatus(id: $id, status: $status) {
    id
    status
    updatedAt
  }
}
```

### Schedule Motion Hearing
```graphql
mutation ScheduleMotionHearing($input: CreateMotionHearingInput!) {
  scheduleMotionHearing(input: $input) {
    id
    scheduledDate
    location
    judge
  }
}
```

**Variables:**
```json
{
  "input": {
    "motionId": "motion-123",
    "scheduledDate": "2025-12-20T14:00:00Z",
    "location": "Courtroom 5A",
    "judge": "Hon. Jane Smith",
    "notes": "Oral arguments scheduled"
  }
}
```

### Get Motion Metrics
```graphql
query GetMotionMetrics($caseId: ID) {
  motionMetrics(caseId: $caseId) {
    totalMotions
    pendingMotions
    grantedMotions
    deniedMotions
    byType {
      type
      count
    }
    byStatus {
      status
      count
    }
  }
}
```

---

## Docket API

### Query All Docket Entries
```graphql
query GetDocketEntries($filter: DocketEntryFilterInput, $pagination: PaginationInput) {
  docketEntries(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        entryNumber
        description
        type
        status
        filedDate
        filedBy
        filedByParty
        servedOn
        servedDate
        case {
          id
          caseNumber
        }
        documents {
          id
          title
          url
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

### Query Docket Entries by Case
```graphql
query GetDocketEntriesByCase($caseId: ID!) {
  docketEntriesByCase(caseId: $caseId) {
    id
    entryNumber
    description
    type
    filedDate
    filedBy
  }
}
```

### Create Docket Entry
```graphql
mutation CreateDocketEntry($input: CreateDocketEntryInput!) {
  createDocketEntry(input: $input) {
    id
    entryNumber
    description
    type
    status
    filedDate
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "caseId": "case-123",
    "entryNumber": "DOC-001",
    "description": "Complaint filed by plaintiff",
    "type": "PLEADING",
    "filedDate": "2025-12-01T00:00:00Z",
    "filedBy": "Plaintiff's Counsel",
    "filedByParty": "John Doe"
  }
}
```

### Bulk Create Docket Entries
```graphql
mutation BulkCreateDocketEntries($input: BulkCreateDocketEntriesInput!) {
  bulkCreateDocketEntries(input: $input) {
    id
    entryNumber
    description
    filedDate
  }
}
```

**Variables:**
```json
{
  "input": {
    "caseId": "case-123",
    "entries": [
      {
        "caseId": "case-123",
        "entryNumber": "DOC-001",
        "description": "Complaint",
        "type": "PLEADING",
        "filedDate": "2025-12-01T00:00:00Z"
      },
      {
        "caseId": "case-123",
        "entryNumber": "DOC-002",
        "description": "Answer to Complaint",
        "type": "PLEADING",
        "filedDate": "2025-12-05T00:00:00Z"
      }
    ]
  }
}
```

### Mark Docket Entry as Served
```graphql
mutation MarkDocketEntryServed($id: ID!, $servedDate: Date!) {
  markDocketEntryServed(id: $id, servedDate: $servedDate) {
    id
    status
    servedDate
  }
}
```

### Get Docket Metrics
```graphql
query GetDocketMetrics($caseId: ID) {
  docketMetrics(caseId: $caseId) {
    totalEntries
    entriesThisMonth
    entriesThisWeek
    byType {
      type
      count
    }
    byStatus {
      status
      count
    }
  }
}
```

---

## Subscriptions

### Subscribe to Case Updates
```graphql
subscription OnCaseUpdated($caseId: ID) {
  caseUpdated(caseId: $caseId) {
    id
    caseNumber
    title
    status
    updatedAt
  }
}
```

### Subscribe to Document Creation
```graphql
subscription OnDocumentCreated($caseId: ID) {
  documentCreated(caseId: $caseId) {
    id
    title
    type
    caseId
    createdAt
  }
}
```

### Subscribe to Notifications
```graphql
subscription OnNotificationSent {
  notificationSent {
    id
    type
    title
    message
    link
    createdAt
  }
}
```

### Subscribe to Chat Messages
```graphql
subscription OnChatMessage($caseId: ID!) {
  chatMessage(caseId: $caseId) {
    id
    caseId
    content
    userId
    userName
    createdAt
  }
}
```

---

## Advanced Filtering Examples

### Filter Parties by Role
```json
{
  "filter": {
    "roles": ["PLAINTIFF", "DEFENDANT"],
    "search": "John"
  }
}
```

### Filter Motions by Status and Date
```json
{
  "filter": {
    "status": ["PENDING", "SCHEDULED"],
    "filedDate": {
      "start": "2025-12-01T00:00:00Z",
      "end": "2025-12-31T23:59:59Z"
    }
  }
}
```

### Filter Docket Entries by Type
```json
{
  "filter": {
    "type": ["PLEADING", "MOTION", "ORDER"],
    "filedDate": {
      "start": "2025-11-01T00:00:00Z"
    }
  }
}
```

---

## Pagination Examples

### Forward Pagination (First 20 items)
```json
{
  "pagination": {
    "first": 20
  }
}
```

### Forward Pagination with Cursor
```json
{
  "pagination": {
    "first": 20,
    "after": "cursor-abc123"
  }
}
```

### Backward Pagination
```json
{
  "pagination": {
    "last": 20,
    "before": "cursor-xyz789"
  }
}
```

---

## Error Handling

All mutations and queries can return errors in the following format:

```json
{
  "errors": [
    {
      "message": "Not implemented",
      "locations": [{"line": 2, "column": 3}],
      "path": ["createParty"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ]
}
```

Common error codes:
- `UNAUTHENTICATED`: User not authenticated
- `FORBIDDEN`: User lacks required permissions
- `BAD_USER_INPUT`: Invalid input data
- `GRAPHQL_VALIDATION_FAILED`: Query complexity or depth exceeded
- `INTERNAL_SERVER_ERROR`: Server-side error

---

## Authentication

All queries and mutations require authentication. Include the JWT token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

---

## GraphQL Playground

Access the GraphQL Playground in development mode at:
```
http://localhost:3000/graphql
```

Features:
- Interactive query builder
- Schema documentation
- Query history
- Subscription testing

---

## Best Practices

1. **Use DataLoaders**: All field resolvers use DataLoaders to prevent N+1 queries
2. **Pagination**: Always use pagination for list queries to avoid large result sets
3. **Filtering**: Use filters to reduce data transfer
4. **Fragments**: Use GraphQL fragments to reuse field selections
5. **Subscriptions**: Close subscription connections when no longer needed
6. **Error Handling**: Always handle errors in your client application

---

## Example Fragment Usage

```graphql
fragment PartyDetails on PartyType {
  id
  name
  role
  email
  phone
  address {
    street
    city
    state
  }
}

query GetPartiesByCase($caseId: ID!) {
  partiesByCase(caseId: $caseId) {
    ...PartyDetails
    contacts {
      id
      name
      email
    }
  }
}
```

---

For more information, see the full API documentation or the implementation summary.
