# LexiFlow GraphQL Schema Documentation

**Version**: 1.0.0
**Last Updated**: December 12, 2025
**Endpoint**: `http://localhost:3000/graphql`
**Playground**: `http://localhost:3000/graphql` (development only)
**Subscriptions**: WebSocket on `ws://localhost:3000/graphql`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Queries](#queries)
4. [Mutations](#mutations)
5. [Subscriptions](#subscriptions)
6. [Types](#types)
7. [Input Types](#input-types)
8. [Enums](#enums)
9. [Scalars](#scalars)
10. [Complexity & Depth Limits](#complexity--depth-limits)

---

## Overview

The LexiFlow GraphQL API provides a flexible, type-safe interface for querying and mutating data across the entire legal practice management platform. It complements the REST API with powerful querying capabilities, real-time subscriptions, and efficient data fetching.

### Key Features

- **Type Safety**: Strongly typed schema with TypeScript integration
- **Real-time**: WebSocket-based subscriptions for live updates
- **Efficient**: Request only the data you need
- **Introspective**: Self-documenting with GraphQL Playground
- **Secure**: JWT authentication with role-based access control
- **Protected**: Query complexity and depth limiting

---

## Authentication

### JWT Bearer Token

All GraphQL requests require authentication via JWT token:

```
Authorization: Bearer <access_token>
```

### HTTP Headers

```http
POST /graphql
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### WebSocket Authentication

For subscriptions, send authentication in connection params:

```javascript
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/graphql',
  options: {
    connectionParams: {
      authorization: `Bearer ${token}`
    }
  }
});
```

---

## Queries

### User Management

#### `me`
Get current authenticated user profile.

```graphql
query {
  me {
    id
    email
    firstName
    lastName
    role
    permissions
    avatar
    createdAt
  }
}
```

#### `user(id: ID!)`
Get user by ID.

```graphql
query {
  user(id: "123") {
    id
    email
    firstName
    lastName
    role
    organization {
      id
      name
    }
  }
}
```

#### `users(filter: UserFilter, pagination: PaginationInput)`
List users with filtering and pagination.

```graphql
query {
  users(
    filter: { role: ATTORNEY, status: ACTIVE }
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      email
      firstName
      lastName
      role
    }
    meta {
      total
      page
      limit
      totalPages
    }
  }
}
```

---

### Case Management

#### `case(id: ID!)`
Get case by ID.

```graphql
query {
  case(id: "456") {
    id
    caseNumber
    title
    status
    caseType
    client {
      id
      name
      email
    }
    team {
      id
      user {
        id
        firstName
        lastName
      }
      role
    }
    documents {
      id
      title
      fileType
      uploadedAt
    }
    createdAt
    updatedAt
  }
}
```

#### `cases(filter: CaseFilter, pagination: PaginationInput)`
List cases with filtering.

```graphql
query {
  cases(
    filter: {
      status: ACTIVE
      caseType: LITIGATION
      assignedToMe: true
    }
    pagination: { page: 1, limit: 20, sort: "updatedAt", order: DESC }
  ) {
    data {
      id
      caseNumber
      title
      status
      client {
        name
      }
      updatedAt
    }
    meta {
      total
      totalPages
    }
  }
}
```

#### `caseTimeline(caseId: ID!)`
Get case timeline events.

```graphql
query {
  caseTimeline(caseId: "456") {
    id
    eventType
    description
    timestamp
    user {
      firstName
      lastName
    }
    metadata
  }
}
```

---

### Document Management

#### `document(id: ID!)`
Get document by ID.

```graphql
query {
  document(id: "789") {
    id
    title
    description
    fileType
    fileSize
    filePath
    uploadedBy {
      firstName
      lastName
    }
    case {
      caseNumber
      title
    }
    versions {
      id
      versionNumber
      createdAt
    }
    ocrResult {
      text
      confidence
      language
    }
    metadata
    tags
    uploadedAt
  }
}
```

#### `documents(filter: DocumentFilter, pagination: PaginationInput)`
Search and list documents.

```graphql
query {
  documents(
    filter: {
      caseId: "456"
      fileType: PDF
      search: "contract"
      tags: ["important", "signed"]
    }
    pagination: { page: 1, limit: 10 }
  ) {
    data {
      id
      title
      fileType
      uploadedAt
      uploadedBy {
        firstName
      }
    }
    meta {
      total
    }
  }
}
```

#### `documentVersions(documentId: ID!)`
Get all versions of a document.

```graphql
query {
  documentVersions(documentId: "789") {
    id
    versionNumber
    filePath
    changes {
      changeType
      description
    }
    createdBy {
      firstName
      lastName
    }
    createdAt
  }
}
```

---

### Billing & Financial

#### `timeEntries(filter: TimeEntryFilter, pagination: PaginationInput)`
Get time entries with filtering.

```graphql
query {
  timeEntries(
    filter: {
      caseId: "456"
      userId: "123"
      billable: true
      status: APPROVED
      startDate: "2025-01-01"
      endDate: "2025-12-31"
    }
    pagination: { limit: 50 }
  ) {
    data {
      id
      date
      duration
      rate
      total
      description
      activityType
      billable
      status
      user {
        firstName
        lastName
      }
      case {
        caseNumber
      }
    }
    meta {
      total
    }
  }
}
```

#### `unbilledTimeEntries(caseId: ID, userId: ID)`
Get unbilled time entries.

```graphql
query {
  unbilledTimeEntries(caseId: "456") {
    id
    date
    duration
    rate
    total
    description
    user {
      firstName
      lastName
    }
  }
}
```

#### `invoice(id: ID!)`
Get invoice by ID.

```graphql
query {
  invoice(id: "101") {
    id
    invoiceNumber
    client {
      name
      email
    }
    issueDate
    dueDate
    subtotal
    tax
    discount
    totalAmount
    paidAmount
    balanceDue
    status
    lineItems {
      id
      description
      quantity
      rate
      amount
    }
    payments {
      id
      amount
      paymentDate
      paymentMethod
    }
  }
}
```

#### `invoices(filter: InvoiceFilter, pagination: PaginationInput)`
List invoices.

```graphql
query {
  invoices(
    filter: {
      clientId: "555"
      status: OVERDUE
    }
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      invoiceNumber
      client {
        name
      }
      dueDate
      totalAmount
      balanceDue
      status
    }
    meta {
      total
    }
  }
}
```

#### `trustAccount(id: ID!)`
Get trust account details.

```graphql
query {
  trustAccount(id: "202") {
    id
    accountNumber
    accountName
    accountType
    currentBalance
    minimumBalance
    client {
      name
    }
    transactions(limit: 10) {
      id
      transactionType
      amount
      balanceAfter
      description
      transactionDate
    }
  }
}
```

---

### Compliance & Audit

#### `auditLogs(filter: AuditLogFilter, pagination: PaginationInput)`
Query audit logs.

```graphql
query {
  auditLogs(
    filter: {
      userId: "123"
      eventType: DOCUMENT_ACCESSED
      startDate: "2025-12-01"
      endDate: "2025-12-31"
    }
    pagination: { page: 1, limit: 100 }
  ) {
    data {
      id
      eventType
      entityType
      entityId
      userId
      user {
        firstName
        lastName
      }
      description
      ipAddress
      userAgent
      timestamp
      metadata
    }
    meta {
      total
    }
  }
}
```

#### `auditStatistics(startDate: DateTime, endDate: DateTime)`
Get audit statistics.

```graphql
query {
  auditStatistics(
    startDate: "2025-12-01"
    endDate: "2025-12-31"
  ) {
    totalEvents
    eventsByType {
      eventType
      count
    }
    eventsByUser {
      userId
      userName
      count
    }
    failedLogins
    suspiciousActivity
  }
}
```

#### `conflictCheck(input: ConflictCheckInput!)`
Run conflict check.

```graphql
query {
  conflictCheck(input: {
    name: "John Smith"
    type: PARTY
    caseId: "456"
  }) {
    id
    name
    conflicts {
      id
      existingCase {
        caseNumber
        title
      }
      conflictType
      severity
      description
    }
    status
    checkDate
  }
}
```

#### `ethicalWalls(filter: EthicalWallFilter)`
List ethical walls.

```graphql
query {
  ethicalWalls(filter: { status: ACTIVE }) {
    id
    name
    description
    isolatedUsers {
      id
      firstName
      lastName
    }
    effectivenessScore
    breachCount
    createdAt
  }
}
```

---

### Analytics

#### `dashboardMetrics(startDate: DateTime, endDate: DateTime)`
Get dashboard metrics.

```graphql
query {
  dashboardMetrics(
    startDate: "2025-12-01"
    endDate: "2025-12-31"
  ) {
    totalCases
    activeCases
    closedCases
    totalDocuments
    totalTimeEntries
    totalBilledHours
    totalRevenue
    outstandingInvoices
    overdueInvoices
    pendingTasks
    upcomingDeadlines
  }
}
```

#### `caseAnalytics(caseId: ID!)`
Get analytics for a specific case.

```graphql
query {
  caseAnalytics(caseId: "456") {
    caseId
    totalDocuments
    totalTimeEntries
    totalHours
    totalBilled
    totalExpenses
    estimatedValue
    daysActive
    teamSize
    documentsByType {
      fileType
      count
    }
    timeByUser {
      userId
      userName
      hours
      amount
    }
    activityTrend {
      date
      documentCount
      timeEntries
      hours
    }
  }
}
```

#### `judgeStatistics(judgeId: ID!)`
Get statistics for a judge.

```graphql
query {
  judgeStatistics(judgeId: "judge123") {
    judgeId
    name
    court
    totalCases
    rulingPatterns {
      motionType
      grantedPercentage
      deniedPercentage
      averageDays
    }
    caseTypes {
      caseType
      count
    }
    averageCaseDuration
    settlementRate
  }
}
```

#### `billingAnalytics(filter: BillingAnalyticsFilter!)`
Get billing analytics.

```graphql
query {
  billingAnalytics(filter: {
    startDate: "2025-01-01"
    endDate: "2025-12-31"
    groupBy: MONTH
  }) {
    totalRevenue
    totalBilledHours
    averageHourlyRate
    revenueByMonth {
      month
      revenue
      hours
    }
    revenueByUser {
      userId
      userName
      revenue
      hours
    }
    revenueByPracticeArea {
      practiceArea
      revenue
      hours
    }
    collectionsRate
    outstandingAR
  }
}
```

#### `discoveryAnalytics(caseId: ID!)`
Get discovery analytics for a case.

```graphql
query {
  discoveryAnalytics(caseId: "456") {
    caseId
    totalRequests
    completedRequests
    pendingRequests
    overdueRequests
    totalDepositions
    scheduledDepositions
    completedDepositions
    esiSources
    documentsProduced
    documentsReceived
    progressPercentage
  }
}
```

#### `outcomePrediction(caseId: ID!)`
Get ML-powered outcome prediction.

```graphql
query {
  outcomePrediction(caseId: "456") {
    caseId
    predictedOutcome
    confidence
    factors {
      factor
      weight
      impact
    }
    similarCases {
      caseId
      outcome
      similarity
    }
    riskScore
    estimatedDuration
    estimatedCost
    recommendations
  }
}
```

#### `trendAnalysis(metric: String!, startDate: DateTime!, endDate: DateTime!)`
Analyze trends over time.

```graphql
query {
  trendAnalysis(
    metric: "revenue"
    startDate: "2025-01-01"
    endDate: "2025-12-31"
  ) {
    metric
    dataPoints {
      date
      value
    }
    trend
    percentageChange
    forecast {
      date
      predictedValue
    }
  }
}
```

#### `performanceMetrics(userId: ID!, startDate: DateTime!, endDate: DateTime!)`
Get attorney performance metrics.

```graphql
query {
  performanceMetrics(
    userId: "123"
    startDate: "2025-01-01"
    endDate: "2025-12-31"
  ) {
    userId
    userName
    totalHours
    billableHours
    utilizationRate
    revenueGenerated
    casesHandled
    documentsProcessed
    averageResponseTime
    clientSatisfaction
  }
}
```

---

## Mutations

### User Management

#### `createUser`
Create a new user.

```graphql
mutation {
  createUser(input: {
    email: "attorney@lawfirm.com"
    firstName: "John"
    lastName: "Doe"
    role: ATTORNEY
    organizationId: "org123"
    password: "SecurePass123!"
  }) {
    id
    email
    firstName
    lastName
    role
  }
}
```

#### `updateUser`
Update user information.

```graphql
mutation {
  updateUser(
    id: "123"
    input: {
      firstName: "Jane"
      lastName: "Smith"
      phoneNumber: "+1-555-0100"
    }
  ) {
    id
    firstName
    lastName
    phoneNumber
  }
}
```

#### `deleteUser`
Delete a user.

```graphql
mutation {
  deleteUser(id: "123") {
    success
    message
  }
}
```

---

### Case Management

#### `createCase`
Create a new case.

```graphql
mutation {
  createCase(input: {
    caseNumber: "2025-CV-12345"
    title: "Smith v. Jones"
    caseType: CIVIL_LITIGATION
    practiceArea: COMMERCIAL
    clientId: "client123"
    status: ACTIVE
    description: "Contract dispute case"
  }) {
    id
    caseNumber
    title
    status
    client {
      name
    }
  }
}
```

#### `updateCase`
Update case information.

```graphql
mutation {
  updateCase(
    id: "456"
    input: {
      status: IN_TRIAL
      description: "Updated description"
    }
  ) {
    id
    status
    description
  }
}
```

#### `deleteCase`
Delete a case (soft delete).

```graphql
mutation {
  deleteCase(id: "456") {
    success
    message
  }
}
```

#### `addCaseTeamMember`
Add member to case team.

```graphql
mutation {
  addCaseTeamMember(input: {
    caseId: "456"
    userId: "123"
    role: LEAD_ATTORNEY
    permissions: [READ, WRITE, DELETE]
  }) {
    id
    case {
      caseNumber
    }
    user {
      firstName
      lastName
    }
    role
  }
}
```

---

### Document Management

#### `uploadDocument`
Upload a new document.

```graphql
mutation {
  uploadDocument(input: {
    caseId: "456"
    title: "Contract Agreement"
    description: "Signed contract document"
    file: $file  # File upload
    tags: ["contract", "signed"]
    processOCR: true
  }) {
    id
    title
    filePath
    fileType
    uploadedAt
  }
}
```

#### `updateDocument`
Update document metadata.

```graphql
mutation {
  updateDocument(
    id: "789"
    input: {
      title: "Updated Contract Agreement"
      tags: ["contract", "signed", "important"]
    }
  ) {
    id
    title
    tags
  }
}
```

#### `deleteDocument`
Delete a document.

```graphql
mutation {
  deleteDocument(id: "789") {
    success
    message
  }
}
```

#### `createDocumentVersion`
Create a new version of a document.

```graphql
mutation {
  createDocumentVersion(input: {
    documentId: "789"
    file: $file
    changeDescription: "Updated terms and conditions"
  }) {
    id
    versionNumber
    createdAt
  }
}
```

---

### Billing & Financial

#### `createTimeEntry`
Create a time entry.

```graphql
mutation {
  createTimeEntry(input: {
    caseId: "456"
    userId: "123"
    date: "2025-12-12"
    duration: 2.5
    rate: 350.00
    activityType: LEGAL_RESEARCH
    description: "Research case law on contract disputes"
    billable: true
    taskCode: "L100"
  }) {
    id
    date
    duration
    rate
    total
    description
  }
}
```

#### `approveTimeEntry`
Approve a time entry.

```graphql
mutation {
  approveTimeEntry(id: "entry123") {
    id
    status
    approvedBy {
      firstName
      lastName
    }
    approvedAt
  }
}
```

#### `createInvoice`
Generate an invoice.

```graphql
mutation {
  createInvoice(input: {
    clientId: "client123"
    caseId: "456"
    timeEntryIds: ["entry1", "entry2", "entry3"]
    issueDate: "2025-12-12"
    dueDate: "2025-12-26"
    taxRate: 8.5
    discount: 0
    notes: "Thank you for your business"
  }) {
    id
    invoiceNumber
    totalAmount
    dueDate
    status
  }
}
```

#### `recordPayment`
Record payment on an invoice.

```graphql
mutation {
  recordPayment(input: {
    invoiceId: "101"
    amount: 5000.00
    paymentDate: "2025-12-12"
    paymentMethod: CHECK
    referenceNumber: "CHK-12345"
  }) {
    id
    invoice {
      balanceDue
      status
    }
    amount
    paymentDate
  }
}
```

#### `createTrustTransaction`
Create trust account transaction.

```graphql
mutation {
  createTrustTransaction(input: {
    trustAccountId: "202"
    transactionType: DEPOSIT
    amount: 10000.00
    description: "Client retainer deposit"
    payor: "John Smith"
    referenceNumber: "DEP-12345"
  }) {
    id
    transactionType
    amount
    balanceAfter
    transactionDate
  }
}
```

---

### Compliance

#### `createConflictCheck`
Create a conflict check.

```graphql
mutation {
  createConflictCheck(input: {
    name: "Acme Corporation"
    type: PARTY
    caseId: "456"
    additionalNames: ["Acme Corp", "ACME Inc"]
  }) {
    id
    name
    status
    conflicts {
      conflictType
      description
    }
  }
}
```

#### `resolveConflict`
Mark a conflict as resolved.

```graphql
mutation {
  resolveConflict(
    conflictCheckId: "conflict123"
    resolution: "Waiver obtained from all parties"
  ) {
    id
    status
    resolvedAt
    resolution
  }
}
```

#### `createEthicalWall`
Create an ethical wall.

```graphql
mutation {
  createEthicalWall(input: {
    name: "Acme Corp Matter Wall"
    description: "Information barrier for Acme case"
    isolatedUserIds: ["user1", "user2"]
    restrictedCaseIds: ["456"]
  }) {
    id
    name
    status
    isolatedUsers {
      firstName
      lastName
    }
  }
}
```

---

## Subscriptions

### Real-time Case Updates

#### `caseCreated`
Subscribe to new case creation events.

```graphql
subscription {
  caseCreated {
    id
    caseNumber
    title
    status
    createdAt
  }
}
```

#### `caseUpdated`
Subscribe to case update events.

```graphql
subscription {
  caseUpdated(caseId: "456") {
    id
    caseNumber
    status
    updatedAt
    updatedBy {
      firstName
      lastName
    }
  }
}
```

#### `caseDeleted`
Subscribe to case deletion events.

```graphql
subscription {
  caseDeleted {
    id
    caseNumber
    deletedAt
  }
}
```

---

### Real-time Document Updates

#### `documentCreated`
Subscribe to document upload events.

```graphql
subscription {
  documentCreated(caseId: "456") {
    id
    title
    fileType
    uploadedBy {
      firstName
      lastName
    }
    uploadedAt
  }
}
```

#### `documentUpdated`
Subscribe to document update events.

```graphql
subscription {
  documentUpdated(documentId: "789") {
    id
    title
    updatedAt
  }
}
```

#### `documentProcessed`
Subscribe to OCR processing completion.

```graphql
subscription {
  documentProcessed {
    id
    documentId
    status
    ocrResult {
      text
      confidence
    }
  }
}
```

---

### Real-time Billing Updates

#### `timeEntryCreated`
Subscribe to new time entries.

```graphql
subscription {
  timeEntryCreated(caseId: "456") {
    id
    date
    duration
    user {
      firstName
      lastName
    }
    total
  }
}
```

#### `invoiceCreated`
Subscribe to new invoices.

```graphql
subscription {
  invoiceCreated {
    id
    invoiceNumber
    client {
      name
    }
    totalAmount
  }
}
```

---

### Real-time Notifications

#### `notification`
Subscribe to user notifications.

```graphql
subscription {
  notification(userId: "123") {
    id
    type
    title
    message
    priority
    actionUrl
    createdAt
  }
}
```

---

### Real-time Messaging

#### `messageReceived`
Subscribe to new messages in a conversation.

```graphql
subscription {
  messageReceived(conversationId: "conv123") {
    id
    content
    sender {
      id
      firstName
      lastName
    }
    sentAt
  }
}
```

---

### Real-time Tasks

#### `taskAssigned`
Subscribe to task assignments.

```graphql
subscription {
  taskAssigned(userId: "123") {
    id
    title
    description
    dueDate
    priority
    assignedBy {
      firstName
      lastName
    }
  }
}
```

---

### Real-time Deadlines

#### `deadlineReminder`
Subscribe to deadline reminders.

```graphql
subscription {
  deadlineReminder {
    id
    case {
      caseNumber
      title
    }
    deadline
    description
    hoursUntilDeadline
  }
}
```

---

## Types

### User Type

```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  fullName: String!
  role: UserRole!
  organization: Organization
  phoneNumber: String
  avatar: String
  status: UserStatus!
  lastLoginAt: DateTime
  emailVerified: Boolean!
  twoFactorEnabled: Boolean!
  permissions: [String!]!
  preferences: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Case Type

```graphql
type Case {
  id: ID!
  caseNumber: String!
  title: String!
  description: String
  caseType: CaseType!
  practiceArea: PracticeArea!
  status: CaseStatus!
  priority: CasePriority!
  client: Client!
  team: [CaseTeamMember!]!
  documents: [Document!]!
  parties: [Party!]!
  phases: [CasePhase!]!
  timeEntries: [TimeEntry!]!
  invoices: [Invoice!]!
  estimatedValue: Money
  actualValue: Money
  openedDate: DateTime!
  closedDate: DateTime
  createdBy: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Document Type

```graphql
type Document {
  id: ID!
  title: String!
  description: String
  fileType: FileType!
  fileSize: Int!
  filePath: String!
  thumbnailPath: String
  case: Case!
  uploadedBy: User!
  versions: [DocumentVersion!]!
  ocrResult: OCRResult
  metadata: JSON
  tags: [String!]!
  uploadedAt: DateTime!
  updatedAt: DateTime!
}
```

### TimeEntry Type

```graphql
type TimeEntry {
  id: ID!
  case: Case!
  user: User!
  date: DateTime!
  duration: Float!
  rate: Money!
  total: Money!
  description: String!
  activityType: ActivityType!
  taskCode: String
  phaseCode: String
  billable: Boolean!
  billed: Boolean!
  status: TimeEntryStatus!
  approvedBy: User
  approvedAt: DateTime
  discount: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Invoice Type

```graphql
type Invoice {
  id: ID!
  invoiceNumber: String!
  client: Client!
  case: Case
  issueDate: DateTime!
  dueDate: DateTime!
  subtotal: Money!
  tax: Money!
  discount: Money!
  totalAmount: Money!
  paidAmount: Money!
  balanceDue: Money!
  status: InvoiceStatus!
  lineItems: [InvoiceLineItem!]!
  payments: [Payment!]!
  billingAddress: Address
  notes: String
  sentAt: DateTime
  paidAt: DateTime
  createdBy: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### AuditLog Type

```graphql
type AuditLog {
  id: ID!
  eventType: AuditEventType!
  entityType: String!
  entityId: String!
  user: User
  userId: String
  description: String!
  ipAddress: String
  userAgent: String
  sessionId: String
  changes: JSON
  metadata: JSON
  timestamp: DateTime!
}
```

### Analytics Types

```graphql
type DashboardMetrics {
  totalCases: Int!
  activeCases: Int!
  closedCases: Int!
  totalDocuments: Int!
  totalTimeEntries: Int!
  totalBilledHours: Float!
  totalRevenue: Money!
  outstandingInvoices: Int!
  overdueInvoices: Int!
  pendingTasks: Int!
  upcomingDeadlines: Int!
}

type CaseAnalytics {
  caseId: ID!
  totalDocuments: Int!
  totalTimeEntries: Int!
  totalHours: Float!
  totalBilled: Money!
  totalExpenses: Money!
  estimatedValue: Money
  daysActive: Int!
  teamSize: Int!
  documentsByType: [DocumentTypeCount!]!
  timeByUser: [UserTimeBreakdown!]!
  activityTrend: [ActivityDataPoint!]!
}

type BillingAnalytics {
  totalRevenue: Money!
  totalBilledHours: Float!
  averageHourlyRate: Money!
  revenueByMonth: [RevenueDataPoint!]!
  revenueByUser: [UserRevenueBreakdown!]!
  revenueByPracticeArea: [PracticeAreaRevenue!]!
  collectionsRate: Float!
  outstandingAR: Money!
}

type OutcomePrediction {
  caseId: ID!
  predictedOutcome: String!
  confidence: Float!
  factors: [PredictionFactor!]!
  similarCases: [SimilarCase!]!
  riskScore: Float!
  estimatedDuration: Int
  estimatedCost: Money
  recommendations: [String!]!
}
```

---

## Input Types

### CreateUserInput

```graphql
input CreateUserInput {
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  organizationId: ID!
  password: String!
  phoneNumber: String
}
```

### CreateCaseInput

```graphql
input CreateCaseInput {
  caseNumber: String!
  title: String!
  description: String
  caseType: CaseType!
  practiceArea: PracticeArea!
  clientId: ID!
  status: CaseStatus!
  priority: CasePriority
  estimatedValue: Float
  openedDate: DateTime
}
```

### UploadDocumentInput

```graphql
input UploadDocumentInput {
  caseId: ID!
  title: String!
  description: String
  file: Upload!
  tags: [String!]
  processOCR: Boolean
}
```

### CreateTimeEntryInput

```graphql
input CreateTimeEntryInput {
  caseId: ID!
  userId: ID
  date: DateTime!
  duration: Float!
  rate: Float!
  description: String!
  activityType: ActivityType!
  taskCode: String
  phaseCode: String
  billable: Boolean!
  discount: Float
}
```

### Filter Inputs

```graphql
input CaseFilter {
  status: CaseStatus
  caseType: CaseType
  practiceArea: PracticeArea
  clientId: ID
  assignedToMe: Boolean
  search: String
  startDate: DateTime
  endDate: DateTime
}

input DocumentFilter {
  caseId: ID
  fileType: FileType
  uploadedBy: ID
  search: String
  tags: [String!]
  startDate: DateTime
  endDate: DateTime
}

input TimeEntryFilter {
  caseId: ID
  userId: ID
  billable: Boolean
  billed: Boolean
  status: TimeEntryStatus
  startDate: DateTime
  endDate: DateTime
}
```

---

## Enums

### UserRole

```graphql
enum UserRole {
  SUPER_ADMIN
  ADMIN
  FIRM_ADMIN
  ATTORNEY
  PARALEGAL
  LEGAL_ASSISTANT
  CLIENT
  GUEST
}
```

### CaseStatus

```graphql
enum CaseStatus {
  ACTIVE
  PENDING
  IN_DISCOVERY
  IN_MEDIATION
  IN_TRIAL
  SETTLED
  CLOSED
  ARCHIVED
}
```

### CaseType

```graphql
enum CaseType {
  CIVIL_LITIGATION
  CRIMINAL
  FAMILY_LAW
  CORPORATE
  REAL_ESTATE
  INTELLECTUAL_PROPERTY
  EMPLOYMENT
  BANKRUPTCY
  TAX
  IMMIGRATION
  PERSONAL_INJURY
  OTHER
}
```

### FileType

```graphql
enum FileType {
  PDF
  DOCX
  DOC
  TXT
  XLSX
  PPTX
  IMAGE
  VIDEO
  AUDIO
  OTHER
}
```

### ActivityType

```graphql
enum ActivityType {
  LEGAL_RESEARCH
  DRAFTING
  COURT_APPEARANCE
  CLIENT_MEETING
  DEPOSITION
  DISCOVERY
  TRIAL_PREP
  PHONE_CALL
  EMAIL
  REVIEW
  TRAVEL
  ADMINISTRATIVE
}
```

### TimeEntryStatus

```graphql
enum TimeEntryStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  BILLED
}
```

### InvoiceStatus

```graphql
enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
}
```

---

## Scalars

### DateTime

ISO 8601 date-time string.

```graphql
scalar DateTime
```

Example: `"2025-12-12T16:30:00.000Z"`

### JSON

Arbitrary JSON value.

```graphql
scalar JSON
```

Example: `{"key": "value", "nested": {"data": true}}`

### Money

Monetary value in cents (Integer).

```graphql
scalar Money
```

Example: `35000` (represents $350.00)

### Upload

File upload scalar for multipart requests.

```graphql
scalar Upload
```

---

## Complexity & Depth Limits

### Query Complexity

Maximum query complexity: **1000 points**

Each field has a complexity cost:
- Simple fields (ID, String, etc.): 1 point
- Object fields: 2 points
- List fields: 5 points × items
- Connections: 10 points

### Query Depth

Maximum query depth: **10 levels**

Prevents deeply nested queries that could impact performance.

### Example

```graphql
# This query would be rejected (too complex)
query {
  cases(pagination: {limit: 1000}) {  # 5000 points
    data {
      documents(limit: 100) {  # 500 points each
        versions(limit: 50) {  # 250 points each
          changes
        }
      }
    }
  }
}
```

---

## Error Handling

### GraphQL Errors

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "statusCode": 401
      },
      "path": ["case"],
      "locations": [{"line": 2, "column": 3}]
    }
  ],
  "data": null
}
```

### Error Codes

- `UNAUTHENTICATED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `BAD_USER_INPUT` - Invalid input data
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error
- `GRAPHQL_VALIDATION_FAILED` - Query validation failed
- `PERSISTED_QUERY_NOT_FOUND` - Persisted query not found
- `QUERY_COMPLEXITY_TOO_HIGH` - Query too complex
- `QUERY_DEPTH_LIMIT_EXCEEDED` - Query too deep

---

## Best Practices

### 1. Request Only What You Need

```graphql
# Good - minimal fields
query {
  cases {
    data {
      id
      caseNumber
      title
    }
  }
}

# Avoid - requesting unnecessary data
query {
  cases {
    data {
      id
      caseNumber
      title
      description
      client { ...allFields }
      documents { ...allFields }
      team { ...allFields }
    }
  }
}
```

### 2. Use Fragments for Reusability

```graphql
fragment CaseBasicInfo on Case {
  id
  caseNumber
  title
  status
}

query {
  activeCases: cases(filter: {status: ACTIVE}) {
    data {
      ...CaseBasicInfo
    }
  }
  closedCases: cases(filter: {status: CLOSED}) {
    data {
      ...CaseBasicInfo
    }
  }
}
```

### 3. Paginate Large Lists

```graphql
query {
  documents(pagination: {page: 1, limit: 20}) {
    data {
      id
      title
    }
    meta {
      total
      totalPages
    }
  }
}
```

### 4. Use Variables

```graphql
query GetCase($caseId: ID!) {
  case(id: $caseId) {
    id
    caseNumber
    title
  }
}

# Variables
{
  "caseId": "456"
}
```

---

## GraphQL Playground

Access the interactive GraphQL Playground in development:

**URL**: `http://localhost:3000/graphql`

Features:
- Schema documentation
- Query autocomplete
- Syntax highlighting
- Query history
- Subscription testing

---

**Total Queries**: 50+
**Total Mutations**: 50+
**Total Subscriptions**: 12
**Total Types**: 100+

**Last Updated**: December 12, 2025
**Maintained By**: Agent 10 & Agent 11 - API Integration Team
