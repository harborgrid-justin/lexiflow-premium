# LexiFlow Premium - PostgreSQL Database Schema

**Generated:** 2025-12-16
**Architect:** EA-8
**Entities Analyzed:** 70+ TypeORM entities
**Schema Version:** Production

---

## Overview

This document provides comprehensive Entity-Relationship (ER) diagrams for the LexiFlow Premium PostgreSQL database schema. The database follows TypeORM conventions with UUID primary keys, timestamp columns, and soft deletes.

### Schema Statistics

- **Total Tables:** 70+
- **Primary Key Type:** UUID (all tables)
- **Soft Delete Support:** Most tables (deletedAt column)
- **Audit Columns:** createdAt, updatedAt, createdBy, updatedBy
- **Index Coverage:** 100+ indexes for performance optimization

---

## 1. Core Entities ER Diagram

### Users, Cases, Clients, Tasks

```mermaid
erDiagram
    USER ||--o{ CASE : manages
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ TIME_ENTRY : tracks
    USER ||--o{ DOCUMENT : creates
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ LOGIN_ATTEMPT : records

    CLIENT ||--o{ CASE : has
    CLIENT ||--o{ INVOICE : receives

    CASE ||--o{ TASK : contains
    CASE ||--o{ DOCUMENT : includes
    CASE ||--o{ DOCKET_ENTRY : tracks
    CASE ||--o{ PARTY : involves
    CASE ||--o{ CUSTODIAN : identifies
    CASE ||--o{ LEGAL_HOLD : issues
    CASE ||--o{ CASE_PHASE : progresses
    CASE ||--o{ PLEADING : files

    USER {
        uuid id PK
        varchar_255 email UK "Unique"
        varchar_255 passwordHash
        varchar_100 firstName
        varchar_100 lastName
        enum role "super_admin|admin|partner|attorney|paralegal|staff|client"
        enum status "active|inactive|suspended|pending"
        varchar_20 phone
        varchar_100 title
        varchar_100 department
        varchar_50 barNumber
        text_array permissions
        jsonb preferences
        varchar_500 avatarUrl
        timestamp lastLoginAt
        boolean emailVerified
        boolean twoFactorEnabled
        varchar_255 totpSecret
        timestamp createdAt
        timestamp updatedAt
    }

    CLIENT {
        uuid id PK
        varchar name
        varchar email UK "Unique"
        enum type "individual|business|government|nonprofit"
        enum status "active|inactive|suspended|prospect"
        varchar phone
        text address
        varchar industry
        varchar taxId
        varchar primaryContact
        text notes
        varchar portalToken
        timestamp portalTokenExpiry
        timestamp createdAt
        timestamp updatedAt
    }

    CASE {
        uuid id PK
        varchar_255 title
        varchar_100 caseNumber UK "Unique"
        text description
        enum type "Civil|Criminal|Family|Bankruptcy|Immigration|IP|Corporate|RealEstate|Labor|Environmental|Tax"
        enum status "Open|Active|Discovery|Trial|Settled|Closed|Archived|OnHold"
        varchar_255 practiceArea
        varchar_255 jurisdiction
        varchar_255 court
        varchar_100 judge
        date filingDate
        date trialDate
        date closeDate
        uuid assignedTeamId
        uuid leadAttorneyId FK
        jsonb metadata
        boolean isArchived
        uuid clientId FK
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        timestamp deletedAt
    }

    TASK {
        uuid id PK
        varchar title
        text description
        enum status "todo|in_progress|in_review|blocked|completed|cancelled"
        enum priority "critical|high|medium|low"
        timestamp dueDate
        uuid caseId FK
        uuid assignedTo FK
        uuid parentTaskId FK
        simple_array tags
        decimal_10_2 estimatedHours
        decimal_10_2 actualHours
        int completionPercentage
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
    }

    PARTY {
        uuid id PK
        uuid caseId FK
        varchar_255 name
        enum type "Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee|ThirdParty|Witness|ExpertWitness|Other"
        enum role "Primary|CoParty|InterestedParty|Guardian|Representative"
        varchar_255 organization
        varchar_255 email
        varchar_50 phone
        text address
        varchar_100 city
        varchar_100 state
        varchar_20 zipCode
        varchar_100 country
        varchar_255 counsel
        text notes
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        timestamp deletedAt
    }
```

---

## 2. Document Management ER Diagram

```mermaid
erDiagram
    DOCUMENT ||--o{ DOCUMENT_VERSION : versions
    DOCUMENT ||--o{ PROCESSING_JOB : processes
    DOCUMENT ||--o{ OCR_JOB : ocr

    CASE ||--o{ DOCUMENT : contains
    USER ||--o{ DOCUMENT : creates

    DOCUMENT {
        uuid id PK
        varchar title
        text description
        enum type "pleading|contract|evidence|correspondence|brief|memo|other"
        uuid caseId FK
        uuid creatorId FK
        enum status "draft|review|approved|rejected|archived"
        varchar filename
        varchar filePath
        varchar mimeType
        bigint fileSize
        varchar checksum "SHA-256"
        int currentVersion
        varchar author
        int pageCount
        int wordCount
        varchar language
        simple_array tags
        jsonb customFields
        text fullTextContent "Searchable"
        boolean ocrProcessed
        timestamp ocrProcessedAt
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
    }

    DOCUMENT_VERSION {
        uuid id PK
        uuid documentId FK
        int version
        varchar filename
        varchar filePath
        varchar mimeType
        bigint fileSize
        varchar checksum
        text changeDescription
        jsonb metadata
        text fullTextContent
        int pageCount
        int wordCount
        timestamp createdAt
        uuid createdBy
    }

    PROCESSING_JOB {
        uuid id PK
        enum type "ocr|extraction|classification|redaction|conversion|analysis"
        enum status "pending|processing|completed|failed|cancelled"
        uuid documentId FK
        int progress "0-100"
        jsonb parameters
        jsonb result
        text error
        timestamp createdAt
        timestamp updatedAt
        timestamp startedAt
        timestamp completedAt
        int processingTime "milliseconds"
        uuid createdBy
    }

    OCR_JOB {
        uuid id PK
        uuid documentId FK
        enum status "pending|processing|completed|failed"
        int progress
        jsonb result
        text error
        timestamp createdAt
        timestamp updatedAt
        timestamp startedAt
        timestamp completedAt
    }

    PLEADING {
        uuid id PK
        varchar title
        text description
        enum type "complaint|answer|motion|brief|memorandum|reply|opposition|petition|response"
        uuid caseId FK
        uuid documentId FK
        enum status "draft|review|approved|filed|rejected|withdrawn"
        timestamp filedDate
        varchar filedBy
        varchar courtName
        varchar caseNumber
        varchar docketNumber
        timestamp hearingDate
        varchar judge
        simple_array parties
        text summary
        jsonb customFields
        simple_array tags
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
    }

    CLAUSE {
        uuid id PK
        varchar title
        text content
        enum category "general|specific"
        simple_array tags
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
    }

    CITATION {
        uuid id PK
        varchar title
        text content
        varchar jurisdiction
        varchar court
        date decisionDate
        simple_array tags
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 3. Billing & Financial ER Diagram

```mermaid
erDiagram
    CLIENT ||--o{ INVOICE : receives
    CASE ||--o{ TIME_ENTRY : billable
    CASE ||--o{ EXPENSE : incurs
    CASE ||--o{ FEE_AGREEMENT : governs

    INVOICE ||--o{ INVOICE_ITEM : contains
    INVOICE ||--o{ TIME_ENTRY : bills

    USER ||--o{ TIME_ENTRY : records

    TRUST_ACCOUNT ||--o{ TRUST_TRANSACTION : tracks

    INVOICE {
        uuid id PK
        varchar invoiceNumber UK "Unique"
        uuid caseId FK
        uuid clientId FK
        varchar_255 clientName
        varchar_500 matterDescription
        date invoiceDate
        date dueDate
        date periodStart
        date periodEnd
        enum billingModel "Hourly|FixedFee|Contingency|Hybrid|Retainer"
        enum status "Draft|Sent|Viewed|Partial|Paid|Overdue|WrittenOff"
        decimal_10_2 subtotal
        decimal_10_2 taxAmount
        decimal_5_2 taxRate
        decimal_10_2 discountAmount
        decimal_10_2 totalAmount
        decimal_10_2 paidAmount
        decimal_10_2 balanceDue
        decimal_10_2 timeCharges
        decimal_10_2 expenseCharges
        text notes
        text terms
        varchar_500 billingAddress
        varchar_50 jurisdiction
        varchar_3 currency "USD"
        timestamp sentAt
        uuid sentBy
        timestamp viewedAt
        timestamp paidAt
        varchar_100 paymentMethod
        varchar_255 paymentReference
        uuid feeAgreementId FK
        text internalNotes
        boolean isRecurring
        varchar_255 pdfUrl
        simple_array attachments
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        timestamp deletedAt
    }

    INVOICE_ITEM {
        uuid id PK
        uuid invoiceId FK
        varchar_255 description
        decimal_10_2 quantity
        decimal_10_2 unitPrice
        decimal_10_2 amount
        enum type "time|expense|fee|discount"
        uuid timeEntryId FK
        uuid expenseId FK
        timestamp createdAt
        timestamp updatedAt
    }

    TIME_ENTRY {
        uuid id PK
        uuid caseId FK
        uuid userId FK
        date date
        decimal_10_2 duration "hours"
        text description
        varchar_100 activity "Research|Court|Meeting"
        varchar_20 ledesCode "LEDES"
        decimal_10_2 rate "hourly"
        decimal_10_2 total "duration*rate"
        enum status "Draft|Submitted|Approved|Billed|WrittenOff"
        boolean billable
        uuid invoiceId FK
        uuid rateTableId FK
        text internalNotes
        varchar_255 taskCode
        decimal_5_2 discount "percentage"
        decimal_10_2 discountedTotal
        uuid approvedBy
        timestamp approvedAt
        uuid billedBy
        timestamp billedAt
        varchar_50 phaseCode
        varchar_50 expenseCategory
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        timestamp deletedAt
    }

    EXPENSE {
        uuid id PK
        uuid caseId FK
        date date
        varchar_255 description
        varchar_100 category
        decimal_10_2 amount
        enum status "Draft|Submitted|Approved|Billed|Reimbursed|Rejected"
        boolean billable
        boolean reimbursable
        uuid invoiceId FK
        varchar_255 receipt
        varchar_100 vendor
        text notes
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
    }

    FEE_AGREEMENT {
        uuid id PK
        uuid caseId FK
        uuid clientId FK
        enum type "Hourly|FixedFee|Contingency|Hybrid|Retainer"
        decimal_10_2 fixedAmount
        decimal_5_2 contingencyPercentage
        decimal_10_2 retainerAmount
        decimal_10_2 hourlyRate
        date effectiveDate
        date expirationDate
        text terms
        enum status "Draft|Active|Expired|Terminated"
        timestamp createdAt
        timestamp updatedAt
    }

    RATE_TABLE {
        uuid id PK
        varchar_255 name
        text description
        jsonb rates "role->rate mapping"
        date effectiveDate
        date expirationDate
        boolean isDefault
        timestamp createdAt
        timestamp updatedAt
    }

    TRUST_ACCOUNT {
        uuid id PK
        uuid clientId FK
        varchar_255 accountNumber
        varchar_255 bankName
        decimal_10_2 balance
        enum status "Active|Inactive|Frozen"
        timestamp createdAt
        timestamp updatedAt
    }

    TRUST_TRANSACTION {
        uuid id PK
        uuid trustAccountId FK
        enum type "Deposit|Withdrawal|Transfer|Fee"
        decimal_10_2 amount
        decimal_10_2 balanceBefore
        decimal_10_2 balanceAfter
        text description
        varchar_255 reference
        date transactionDate
        timestamp createdAt
        uuid createdBy
    }
```

---

## 4. Discovery & Evidence ER Diagram

```mermaid
erDiagram
    CASE ||--o{ CUSTODIAN : identifies
    CASE ||--o{ LEGAL_HOLD : issues
    CASE ||--o{ DISCOVERY_REQUEST : tracks
    CASE ||--o{ DEPOSITION : schedules
    CASE ||--o{ ESI_SOURCE : documents
    CASE ||--o{ PRODUCTION : produces
    CASE ||--o{ PRIVILEGE_LOG_ENTRY : logs
    CASE ||--o{ EVIDENCE_ITEM : manages

    LEGAL_HOLD ||--o{ CUSTODIAN : notifies
    CUSTODIAN ||--o{ ESI_SOURCE : owns

    CUSTODIAN {
        uuid id PK
        uuid caseId FK
        varchar_200 firstName
        varchar_200 lastName
        varchar_400 fullName
        varchar_300 email
        varchar_50 phone
        varchar_200 department
        varchar_200 title
        varchar_300 organization
        enum status "IDENTIFIED|NOTIFIED|INTERVIEWED|DATA_COLLECTED|HOLD_RELEASED|INACTIVE"
        date dateIdentified
        date dateNotified
        date dateInterviewed
        date dataCollectionDate
        boolean isKeyPlayer
        text relevance
        jsonb dataSources
        boolean isOnLegalHold
        uuid legalHoldId FK
        date legalHoldDate
        date legalHoldReleasedDate
        jsonb interviews
        text notes
        jsonb metadata
        uuid assignedTo
        uuid createdBy
        uuid updatedBy
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    LEGAL_HOLD {
        uuid id PK
        uuid caseId FK
        varchar_300 holdName
        varchar_100 holdNumber
        enum status "DRAFT|ACTIVE|SUSPENDED|RELEASED|EXPIRED"
        text description
        text holdInstructions
        date issueDate
        date effectiveDate
        date releaseDate
        date expirationDate
        jsonb custodians "Array of custodian info"
        int totalCustodians
        int acknowledgedCount
        int pendingCount
        jsonb dataSourcesToPreserve
        jsonb notifications
        int reminderIntervalDays
        date lastReminderDate
        date nextReminderDate
        boolean isAutoReminder
        text releaseReason
        text releaseNotes
        text notes
        jsonb metadata
        uuid issuedBy
        uuid releasedBy
        uuid createdBy
        uuid updatedBy
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    DISCOVERY_REQUEST {
        uuid id PK
        uuid caseId FK
        varchar_100 requestNumber
        enum type "Interrogatory|RFP|RFA|Subpoena|Notice"
        enum status "Draft|Sent|Received|Responded|Overdue"
        text description
        date dueDate
        date receivedDate
        date respondedDate
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
    }

    DEPOSITION {
        uuid id PK
        uuid caseId FK
        varchar_255 deponentName
        varchar_255 deponentTitle
        date scheduledDate
        time scheduledTime
        varchar_500 location
        enum type "Fact|Expert|Party|NonParty"
        enum status "Scheduled|Completed|Cancelled|Rescheduled"
        varchar_255 court_reporter
        jsonb exhibits
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    ESI_SOURCE {
        uuid id PK
        uuid caseId FK
        uuid custodianId FK
        varchar_255 sourceName
        enum type "Email|FileShare|Database|Mobile|Cloud|Social"
        varchar_500 location
        enum status "Identified|Preserved|Collected|Processed"
        date identifiedDate
        date preservedDate
        date collectedDate
        bigint estimatedSize
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    PRODUCTION {
        uuid id PK
        uuid caseId FK
        varchar_100 productionNumber
        varchar_255 productionName
        date productionDate
        int documentCount
        varchar_100 format "Native|TIFF|PDF"
        varchar_500 deliveryMethod
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    PRIVILEGE_LOG_ENTRY {
        uuid id PK
        uuid caseId FK
        varchar_100 documentId
        date documentDate
        varchar_500 documentDescription
        varchar_255 author
        varchar_255 recipient
        enum privilegeType "AttorneyClient|WorkProduct|ConfidentialCommunication"
        text basis
        timestamp createdAt
        timestamp updatedAt
    }

    EVIDENCE_ITEM {
        uuid id PK
        uuid caseId FK
        varchar_100 evidenceNumber
        varchar_255 description
        enum type "Document|Physical|Digital|Testimony"
        varchar_500 location
        date dateObtained
        varchar_255 obtainedBy
        enum custodyStatus "InCustody|Released|Destroyed"
        jsonb chainOfCustody
        simple_array tags
        timestamp createdAt
        timestamp updatedAt
    }

    CHAIN_OF_CUSTODY_EVENT {
        uuid id PK
        uuid evidenceItemId FK
        timestamp eventDate
        enum eventType "Received|Transferred|Analyzed|Returned|Destroyed"
        uuid fromUserId
        uuid toUserId
        text notes
        timestamp createdAt
    }

    WITNESS {
        uuid id PK
        uuid caseId FK
        varchar_255 fullName
        varchar_255 email
        varchar_50 phone
        enum type "Fact|Expert|Character"
        enum status "Identified|Contacted|Interviewed|Prepared|Testified"
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 5. Trial & Litigation ER Diagram

```mermaid
erDiagram
    CASE ||--o{ TRIAL_EVENT : schedules
    CASE ||--o{ TRIAL_EXHIBIT : prepares
    CASE ||--o{ WITNESS_PREP_SESSION : conducts
    CASE ||--o{ MOTION : files
    CASE ||--o{ EXHIBIT : manages

    TRIAL_EVENT {
        uuid id PK
        uuid caseId FK
        enum type "Hearing|Trial|Conference|Deadline"
        varchar_255 title
        text description
        timestamp eventDate
        int durationMinutes
        varchar_255 location
        enum status "Scheduled|Completed|Cancelled|Rescheduled"
        jsonb attendees
        text outcome
        timestamp createdAt
        timestamp updatedAt
    }

    TRIAL_EXHIBIT {
        uuid id PK
        uuid caseId FK
        varchar_100 exhibitNumber
        varchar_255 description
        uuid documentId FK
        enum status "Proposed|Admitted|Rejected"
        date submittedDate
        date admittedDate
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    WITNESS_PREP_SESSION {
        uuid id PK
        uuid caseId FK
        uuid witnessId FK
        timestamp sessionDate
        int durationMinutes
        varchar_255 location
        jsonb topics
        text notes
        jsonb attendees
        timestamp createdAt
        timestamp updatedAt
    }

    MOTION {
        uuid id PK
        uuid caseId FK
        enum type "MTD|MSJ|MIL|Continuance|Compel|Protective"
        varchar_255 title
        text description
        enum status "Draft|Filed|Granted|Denied|Withdrawn"
        date filedDate
        date hearingDate
        date decisionDate
        text decision
        uuid documentId FK
        timestamp createdAt
        timestamp updatedAt
    }

    EXHIBIT {
        uuid id PK
        uuid caseId FK
        varchar_100 exhibitNumber
        varchar_255 description
        uuid documentId FK
        enum type "Documentary|Physical|Demonstrative"
        enum status "Marked|Offered|Admitted|Excluded"
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 6. Docket & Calendar ER Diagram

```mermaid
erDiagram
    CASE ||--o{ DOCKET_ENTRY : tracks
    CASE ||--o{ CALENDAR_EVENT : schedules

    DOCKET_ENTRY {
        uuid id PK
        uuid caseId FK
        int sequenceNumber
        varchar_100 docketNumber
        date dateFiled
        date entryDate
        varchar_255 description
        enum type "Filing|Order|Notice|Motion|Hearing|Judgment|MinuteEntry|Transcript|Exhibit|Correspondence|Other"
        varchar_255 filedBy
        text text
        varchar_255 documentTitle
        varchar_2048 documentUrl
        uuid documentId FK
        varchar_100 pacerDocketNumber
        varchar_100 pacerDocumentNumber
        timestamp pacerLastSyncAt
        boolean isSealed
        boolean isRestricted
        text notes
        jsonb attachments
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        timestamp deletedAt
    }

    CALENDAR_EVENT {
        uuid id PK
        varchar_255 title
        text description
        timestamp startDate
        timestamp endDate
        boolean allDay
        varchar_255 location
        enum type "hearing|deadline|meeting|trial|conference"
        uuid caseId FK
        simple_array attendees
        enum status "scheduled|completed|cancelled"
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 7. HR & Organization ER Diagram

```mermaid
erDiagram
    EMPLOYEE ||--o{ TIME_OFF_REQUEST : submits

    CASE ||--o{ CASE_PHASE : progresses
    CASE ||--o{ CASE_TEAM : assigns
    CASE ||--o{ PROJECT : manages

    EMPLOYEE {
        uuid id PK
        varchar_255 firstName
        varchar_255 lastName
        varchar_255 email UK
        varchar_50 phone
        varchar_255 department
        varchar_255 title
        date hireDate
        date terminationDate
        enum status "Active|Inactive|OnLeave|Terminated"
        decimal_10_2 salary
        simple_array skills
        timestamp createdAt
        timestamp updatedAt
    }

    TIME_OFF_REQUEST {
        uuid id PK
        uuid employeeId FK
        enum type "Vacation|Sick|Personal|Bereavement|Jury"
        date startDate
        date endDate
        int daysRequested
        text reason
        enum status "Pending|Approved|Denied|Cancelled"
        uuid approvedBy
        timestamp approvedAt
        timestamp createdAt
        timestamp updatedAt
    }

    CASE_PHASE {
        uuid id PK
        uuid caseId FK
        varchar_255 phaseName
        enum status "NotStarted|InProgress|Completed"
        date startDate
        date endDate
        int orderIndex
        timestamp createdAt
        timestamp updatedAt
    }

    CASE_TEAM {
        uuid id PK
        uuid caseId FK
        uuid userId FK
        enum role "Lead|Associate|Paralegal|Support"
        date assignedDate
        date removedDate
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    PROJECT {
        uuid id PK
        varchar_255 name
        text description
        uuid caseId FK
        date startDate
        date endDate
        enum status "Active|OnHold|Completed|Cancelled"
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 8. Communications & Knowledge ER Diagram

```mermaid
erDiagram
    COMMUNICATION ||--o{ TEMPLATE : uses

    COMMUNICATION {
        uuid id PK
        enum type "Email|SMS|Letter|InternalNote"
        varchar_255 subject
        text body
        uuid fromUserId FK
        jsonb toRecipients
        jsonb ccRecipients
        uuid caseId FK
        enum status "Draft|Sent|Delivered|Failed"
        timestamp sentAt
        timestamp deliveredAt
        simple_array attachments
        timestamp createdAt
        timestamp updatedAt
    }

    TEMPLATE {
        uuid id PK
        varchar_255 name
        enum type "Email|SMS|Letter|Document"
        text content
        jsonb variables
        varchar_255 category
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    KNOWLEDGE_ARTICLE {
        uuid id PK
        varchar_255 title
        text content
        varchar_255 category
        simple_array tags
        int viewCount
        boolean isPublished
        timestamp publishedAt
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
    }

    REPORT_TEMPLATE {
        uuid id PK
        varchar_255 name
        text description
        enum type "Case|Billing|Discovery|Analytics"
        jsonb config
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    REPORT {
        uuid id PK
        uuid templateId FK
        varchar_255 name
        jsonb parameters
        enum status "Generating|Completed|Failed"
        varchar_500 outputPath
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
    }
```

---

## 9. Analytics & Compliance ER Diagram

```mermaid
erDiagram
    AUDIT_LOG {
        uuid id PK
        varchar entityType "Table name"
        varchar entityId "Record ID"
        varchar action "CREATE|UPDATE|DELETE"
        uuid userId FK
        jsonb changes "Before/after"
        varchar ipAddress
        text userAgent
        timestamp timestamp
        timestamp createdAt
        timestamp updatedAt
    }

    ANALYTICS_EVENT {
        uuid id PK
        varchar eventType "Page view|action|error"
        varchar entityType
        varchar entityId
        uuid userId FK
        jsonb metadata
        timestamp timestamp
        timestamp createdAt
        timestamp updatedAt
    }

    DASHBOARD {
        uuid id PK
        varchar_255 name
        text description
        jsonb config "Widget configuration"
        uuid userId FK
        boolean isDefault
        timestamp createdAt
        timestamp updatedAt
    }

    DASHBOARD_SNAPSHOT {
        uuid id PK
        uuid dashboardId FK
        jsonb data "Snapshot data"
        timestamp snapshotDate
        timestamp createdAt
    }

    COMPLIANCE_RULE {
        uuid id PK
        varchar_255 ruleName
        text description
        enum category "Ethics|Privacy|Security|Regulatory"
        jsonb conditions
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    COMPLIANCE_CHECK {
        uuid id PK
        uuid ruleId FK
        varchar entityType
        varchar entityId
        enum result "Pass|Fail|Warning"
        jsonb findings
        timestamp checkedAt
        timestamp createdAt
    }
```

---

## 10. Authentication & Security ER Diagram

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : generates
    USER ||--o{ LOGIN_ATTEMPT : attempts
    USER ||--o{ API_KEY : creates

    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        text token "JWT"
        timestamp expiresAt
        boolean revoked
        varchar_100 userAgent
        varchar_45 ipAddress
        timestamp createdAt
        timestamp updatedAt
    }

    LOGIN_ATTEMPT {
        uuid id PK
        varchar_255 email
        uuid userId FK
        boolean successful
        varchar_45 ipAddress
        varchar_255 userAgent
        text failureReason
        timestamp attemptedAt
        timestamp createdAt
    }

    API_KEY {
        uuid id PK
        varchar_255 name
        varchar_500 key "Hashed"
        uuid userId FK
        jsonb permissions
        timestamp expiresAt
        boolean isActive
        timestamp lastUsedAt
        timestamp createdAt
        timestamp updatedAt
    }

    SESSION {
        uuid id PK
        uuid userId FK
        text token
        jsonb data
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 11. Integrations ER Diagram

```mermaid
erDiagram
    INTEGRATION {
        uuid id PK
        varchar_255 name
        enum type "PACER|Email|Calendar|Storage|Webhook"
        jsonb config "API credentials"
        boolean isActive
        timestamp lastSyncAt
        enum status "Connected|Disconnected|Error"
        timestamp createdAt
        timestamp updatedAt
    }

    SEARCH_INDEX {
        uuid id PK
        varchar entityType "cases|documents|etc"
        varchar entityId
        text content "Searchable text"
        jsonb metadata
        timestamp indexedAt
        timestamp createdAt
        timestamp updatedAt
    }

    SEARCH_QUERY {
        uuid id PK
        text query
        uuid userId FK
        int resultCount
        jsonb filters
        timestamp createdAt
    }

    MESSENGER {
        uuid id PK
        uuid fromUserId FK
        uuid toUserId FK
        text message
        boolean isRead
        timestamp readAt
        timestamp createdAt
    }

    WAR_ROOM {
        uuid id PK
        uuid caseId FK
        varchar_255 name
        text description
        jsonb members
        jsonb strategy
        timestamp createdAt
        timestamp updatedAt
    }

    RISK {
        uuid id PK
        uuid caseId FK
        varchar_255 title
        text description
        enum severity "Critical|High|Medium|Low"
        enum probability "VeryHigh|High|Medium|Low"
        text mitigation
        enum status "Identified|Monitoring|Mitigated|Closed"
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 12. Workflow & Templates ER Diagram

```mermaid
erDiagram
    WORKFLOW_TEMPLATE {
        uuid id PK
        varchar_255 name
        text description
        jsonb steps "Workflow definition"
        varchar_255 category
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## Index Coverage Summary

### Primary Indexes (By Table)

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| users | users_pkey | id | BTREE | Primary Key |
| users | UQ_email | email | BTREE UNIQUE | Email uniqueness |
| users | IDX_users_email | email | BTREE | Email lookup |
| users | IDX_users_role_status | role, status | BTREE | Role/status filtering |
| users | IDX_users_role | role | BTREE | Role filtering |
| users | IDX_users_status | status | BTREE | Status filtering |
| cases | cases_pkey | id | BTREE | Primary Key |
| cases | UQ_caseNumber | caseNumber | BTREE UNIQUE | Case number uniqueness |
| cases | IDX_cases_clientId | clientId | BTREE | Client lookup |
| cases | IDX_cases_status | status | BTREE | Status filtering |
| documents | documents_pkey | id | BTREE | Primary Key |
| documents | IDX_documents_caseId | caseId | BTREE | Case documents |
| documents | IDX_documents_caseId_type | caseId, type | BTREE | Case docs by type |
| documents | IDX_documents_status | status | BTREE | Status filtering |
| documents | IDX_documents_createdAt | createdAt | BTREE | Time-based queries |
| documents | IDX_documents_creatorId | creatorId | BTREE | Creator lookup |
| document_versions | document_versions_pkey | id | BTREE | Primary Key |
| document_versions | IDX_docver_documentId | documentId | BTREE | Version lookup |
| document_versions | IDX_docver_documentId_version | documentId, version | BTREE | Specific version |
| time_entries | time_entries_pkey | id | BTREE | Primary Key |
| time_entries | IDX_time_caseId_date | caseId, date | BTREE | Case time by date |
| time_entries | IDX_time_userId_status | userId, status | BTREE | User time by status |
| time_entries | IDX_time_status_billable | status, billable | BTREE | Billing queries |
| time_entries | IDX_time_caseId | caseId | BTREE | Case time entries |
| time_entries | IDX_time_userId | userId | BTREE | User time entries |
| time_entries | IDX_time_status | status | BTREE | Status filtering |
| invoices | invoices_pkey | id | BTREE | Primary Key |
| invoices | UQ_invoiceNumber | invoiceNumber | BTREE UNIQUE | Invoice uniqueness |
| invoices | IDX_invoices_invoiceNumber | invoiceNumber | BTREE | Invoice lookup |
| invoices | IDX_invoices_caseId_status | caseId, status | BTREE | Case invoices |
| invoices | IDX_invoices_clientId_status | clientId, status | BTREE | Client invoices |
| invoices | IDX_invoices_status_dueDate | status, dueDate | BTREE | Due date queries |
| invoices | IDX_invoices_caseId | caseId | BTREE | Case lookup |
| invoices | IDX_invoices_clientId | clientId | BTREE | Client lookup |
| invoices | IDX_invoices_invoiceDate | invoiceDate | BTREE | Date filtering |
| invoices | IDX_invoices_dueDate | dueDate | BTREE | Due date filtering |
| pleadings | pleadings_pkey | id | BTREE | Primary Key |
| pleadings | IDX_pleadings_caseId_type | caseId, type | BTREE | Case pleadings by type |
| pleadings | IDX_pleadings_status | status | BTREE | Status filtering |
| pleadings | IDX_pleadings_filedDate | filedDate | BTREE | Filing date |
| pleadings | IDX_pleadings_caseId | caseId | BTREE | Case lookup |
| processing_jobs | processing_jobs_pkey | id | BTREE | Primary Key |
| processing_jobs | IDX_jobs_status | status | BTREE | Job status |
| processing_jobs | IDX_jobs_type | type | BTREE | Job type |
| processing_jobs | IDX_jobs_documentId | documentId | BTREE | Document jobs |
| docket_entries | docket_entries_pkey | id | BTREE | Primary Key |
| docket_entries | IDX_docket_caseId | caseId | BTREE | Case docket |
| refresh_tokens | refresh_tokens_pkey | id | BTREE | Primary Key |
| refresh_tokens | IDX_refresh_userId | userId | BTREE | User tokens |
| refresh_tokens | IDX_refresh_userId_expiresAt | userId, expiresAt | BTREE | Active tokens |
| refresh_tokens | IDX_refresh_expiresAt | expiresAt | BTREE | Expiry cleanup |
| refresh_tokens | IDX_refresh_revoked | revoked | BTREE | Revocation status |

**Total Indexes:** 100+ across all tables

### Index Performance Notes

1. **Composite Indexes**: Used for common query patterns (e.g., `caseId + status`)
2. **Covering Indexes**: Some queries can be satisfied entirely from indexes
3. **Unique Constraints**: Enforced via unique indexes (email, caseNumber, invoiceNumber)
4. **Soft Delete Aware**: Queries should include `WHERE deletedAt IS NULL`
5. **JSONB Columns**: Consider GIN indexes for frequently queried JSONB fields

---

## Database Constraints

### Foreign Key Relationships

All foreign key relationships use **CASCADE** or **SET NULL** strategies:

- `CASE.clientId → CLIENT.id` (CASCADE)
- `DOCUMENT.caseId → CASE.id` (CASCADE)
- `DOCUMENT.creatorId → USER.id` (SET NULL)
- `TIME_ENTRY.userId → USER.id` (CASCADE)
- `TIME_ENTRY.caseId → CASE.id` (CASCADE)
- `INVOICE.clientId → CLIENT.id` (SET NULL)
- `PARTY.caseId → CASE.id` (CASCADE)
- `CUSTODIAN.caseId → CASE.id` (CASCADE)

### Unique Constraints

- `USER.email` - Unique email addresses
- `CLIENT.email` - Unique client emails
- `CASE.caseNumber` - Unique case identifiers
- `INVOICE.invoiceNumber` - Unique invoice numbers

### Check Constraints

- `TIME_ENTRY.duration > 0` - Positive time entries
- `INVOICE.totalAmount >= 0` - Non-negative amounts
- `EXPENSE.amount >= 0` - Non-negative expenses

---

## Migration Versioning

LexiFlow uses TypeORM migrations with the following conventions:

- **Migration Files:** `backend/src/migrations/*.ts`
- **Naming:** `{timestamp}-{description}.ts`
- **Commands:**
  - Generate: `npm run migration:generate`
  - Run: `npm run migration:run`
  - Revert: `npm run migration:revert`

---

## Performance Considerations

### Query Optimization

1. **Use Indexes**: All FK columns are indexed
2. **Limit JSONB Queries**: Use specific key paths
3. **Soft Delete Awareness**: Always filter `deletedAt IS NULL`
4. **Pagination**: Use LIMIT/OFFSET for large result sets
5. **Connection Pooling**: Configured in TypeORM datasource

### Storage Optimization

1. **JSONB**: Used for flexible metadata fields
2. **Text Arrays**: For simple tag lists
3. **File Storage**: Large files stored on file system, not in DB
4. **Archive Strategy**: Old records soft-deleted, archived periodically

---

## Security Features

### Row-Level Security (Planned)

- Multi-tenant isolation by `userId`
- Case-level access control
- Audit trail for all modifications

### Data Encryption

- **At Rest**: PostgreSQL encryption at database level
- **In Transit**: SSL/TLS connections
- **Application Level**: Sensitive fields encrypted before storage

### Audit Trail

All tables include:
- `createdAt` - Record creation timestamp
- `createdBy` - User who created record
- `updatedAt` - Last modification timestamp
- `updatedBy` - User who last modified record
- `deletedAt` - Soft delete timestamp (nullable)

---

## Connection Configuration

```typescript
// backend/src/config/database.config.ts
{
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lexiflow',
  entities: ['dist/**/*.entity.js'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  poolSize: 20,
  ssl: process.env.DB_SSL === 'true'
}
```

---

## Schema Documentation Standards

### Entity Conventions

1. **Table Names**: Plural, snake_case (e.g., `time_entries`)
2. **Column Names**: camelCase in TypeORM, snake_case in DB
3. **Primary Keys**: Always `id` of type `uuid`
4. **Timestamps**: `createdAt`, `updatedAt`, `deletedAt`
5. **Foreign Keys**: Suffix with `Id` (e.g., `caseId`, `userId`)

### Enum Conventions

1. **PascalCase Values**: Enum values use PascalCase (e.g., `CaseStatus.Active`)
2. **Database Storage**: Stored as strings in PostgreSQL
3. **TypeORM Mapping**: Defined as TypeScript enums

---

## Database Size Estimates

| Table | Estimated Rows (Per Year) | Storage |
|-------|---------------------------|---------|
| users | 100-500 | 1-5 MB |
| clients | 500-2000 | 5-20 MB |
| cases | 1000-5000 | 10-50 MB |
| documents | 50,000-200,000 | 500 MB - 2 GB |
| time_entries | 100,000-500,000 | 100-500 MB |
| invoices | 5,000-20,000 | 50-200 MB |
| audit_logs | 1,000,000+ | 1-10 GB |

**Total Estimated DB Size:** 5-50 GB per year (excluding file storage)

---

## End of Database Schema Documentation
