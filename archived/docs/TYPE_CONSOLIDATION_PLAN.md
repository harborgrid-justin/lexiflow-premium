# Frontend API Types Consolidation Plan

## Executive Summary

This document provides a comprehensive analysis of type definitions scattered across `frontend/src/api/` folders and presents a detailed migration plan to consolidate them properly. The analysis covers **186 TypeScript files** across 15 domain areas.

### Current State
- **Centralized Types**: 62 type files in `frontend/src/api/types/`
- **Scattered Types**: 200+ inline type definitions across API service files
- **Duplication**: Multiple overlapping type definitions between `/types` and service files
- **Organization**: Types are split between domain models (should be centralized) and DTOs (should stay with services)

---

## 1. Current Centralized Types Inventory

### Files in `frontend/src/api/types/`

**Domain Models (62 files)**:
- `case.ts` - Case domain model + MOCK_CASES
- `document.ts` - Document domain model + MOCK_DOCUMENTS
- `user.ts` - User domain model + MOCK_USERS
- `timeEntry.ts` - Time entry domain model + MOCK_TIME_ENTRIES
- `docketEntry.ts` - Docket entry model
- `evidenceItem.ts` - Evidence item model
- `exhibit.ts` - Trial exhibit model
- `motion.ts` - Motion model
- `pleadingTemplate.ts` - Pleading template model
- `invoice.ts` - Invoice domain model
- `client.ts` - Client/CRM model
- `staffMember.ts` - HR staff member model
- `conflictCheck.ts` - Conflict check model
- `ethicalWall.ts` - Ethical wall model
- `legalHold.ts` - Legal hold model
- `privilegeLogEntry.ts` - Privilege log model
- `discoveryDoc.ts` - Discovery document model
- `discoveryRequest.ts` - Discovery request model
- `discoveryExtended.ts` - Extended discovery types
- `discoveryCharts.ts` - Discovery chart data types
- `workflowTask.ts` - Workflow task model
- `workflowStage.ts` - Workflow stage model
- `workflowTemplates.ts` - Workflow template data
- `clause.ts` - Legal clause model
- `jurisdiction.ts` - Jurisdiction model
- `judgeProfile.ts` - Judge profile model
- `opposingCounselProfile.ts` - Opposing counsel model
- `organization.ts` - Organization model
- `group.ts` - User group model
- `strategy.ts` - Case strategy model
- `playbook.ts` - Litigation playbook model
- `advisor.ts` - War room advisor model
- `conversation.ts` - Messaging conversation model
- `auditLogEntry.ts` - Audit log model
- `dashboardData.ts` - Dashboard data types
- `analyticsStats.ts` - Analytics statistics
- `billingStats.ts` - Billing statistics
- `dataDictionary.ts` - Data dictionary types
- `security.ts` - Security types
- `crm.ts` - CRM types
- `cle.ts` - CLE tracking types
- `facility.ts` - Facility management types
- `firmProcess.ts` - Firm process types
- `firmExpense.ts` - Firm expense types
- `conferralSession.ts` - Conferral session types
- `jointPlan.ts` - Joint discovery plan types
- `stipulationRequest.ts` - Stipulation types
- `opposition.ts` - Opposition types
- `rfp.ts` - RFP types
- `vendorContract.ts` - Vendor contract types
- `vendorDirectory.ts` - Vendor directory types
- `maintenanceTicket.ts` - IT maintenance types
- `marketingMetric.ts` - Marketing metrics types
- `legalRule.ts` - Legal rule types

**Mock/Test Data (7 files)**:
- `federalHierarchy.ts` - Court hierarchy data
- `mockApiSpec.ts` - API spec mock data
- `mockHierarchy.ts` - Hierarchy mock data
- `mockKnowledge.ts` - Knowledge base mock data
- `mockLitigationPlaybooks.ts` - Playbook mock data
- `mockMotions.ts` - Motion mock data
- `reporters.ts` - Reporter data

---

## 2. Inline Type Definitions by Domain

### 2.1 Litigation Domain (`frontend/src/api/litigation/`)

#### `cases-api.ts`
**Keep in Service (DTOs/Request-Response)**:
- `CreateCaseDto` - Request DTO for case creation
- `SearchFilters` - Case search filters (internal)
- `ArchivedCase` - Response-specific structure

**Move to Types Folder**:
- `CaseStats` - Domain statistics model → `types/caseStats.ts`

#### `parties-api.ts`
**Keep in Service**:
- `CreatePartyDto` - Request DTO
- `UpdatePartyDto` - Request DTO
- `PartyFilters` - Filter parameters
- `PartyTypeBackend` - Backend enum mapping
- `PartyRoleBackend` - Backend enum mapping

#### `pleadings-api.ts`
**Move to Types Folder**:
- `Pleading` - Domain model (likely duplicates `types/pleadingTemplate.ts`)
- `PleadingFilters` - Could stay, but better in types for reusability

#### `motions-api.ts`
**Move to Types Folder**:
- `Motion` - Domain model (duplicates `types/motion.ts`)
- `MotionFilters` - Reusable filter type

#### `matters-api.ts`
**Move to Types Folder**:
- `MatterFilters` - Reusable filters → `types/matterFilters.ts`
- `MatterStatistics` - Statistics model → `types/matterStats.ts`

#### `case-teams-api.ts`
**Move to Types Folder**:
- `CaseTeamMember` - Domain model → `types/caseTeamMember.ts`
- `CaseTeamFilters` - Filters → `types/caseTeamFilters.ts`

#### `case-phases-api.ts`
**Move to Types Folder**:
- `CasePhase` - Domain model → `types/casePhase.ts`
- `CasePhaseFilters` - Filters → `types/casePhaseFilters.ts`

#### `docket-api.ts`
- Uses types from `@/types` - already centralized ✓

---

### 2.2 Discovery Domain (`frontend/src/api/discovery/`)

#### `discovery-api.ts`
**Move to Types Folder**:
- `DiscoveryProcess` - Core domain model → `types/discoveryProcess.ts`

#### `witnesses-api.ts`
**Move to Types Folder**:
- `Witness` - Domain model → `types/witness.ts`
- `WitnessFilters` - Filters → `types/witnessFilters.ts`

#### `productions-api.ts`
**Move to Types Folder**:
- `Production` - Domain model → `types/production.ts`
- `ProductionFilters` - Filters → `types/productionFilters.ts`

#### `depositions-api.ts`
**Move to Types Folder**:
- `Deposition` - Domain model → `types/deposition.ts`
- `DepositionFilters` - Filters → `types/depositionFilters.ts`

#### `custodians-api.ts`
**Move to Types Folder**:
- `Custodian` - Domain model → `types/custodian.ts`

#### `custodian-interviews-api.ts`
**Move to Types Folder**:
- `CustodianInterview` - Domain model → `types/custodianInterview.ts`
- `CustodianInterviewFilters` - Filters

#### `esi-sources-api.ts`
**Move to Types Folder**:
- `ESISource` - Domain model → `types/esiSource.ts`
- `ESISourceFilters` - Filters

#### `discovery-requests-api.ts`
**Move to Types Folder**:
- `DiscoveryRequest` - Domain model (may duplicate `types/discoveryRequest.ts`)
- `DiscoveryRequestFilters` - Filters

#### `discovery-analytics-api.ts`
**Move to Types Folder**:
- `DiscoveryAnalytics` - Analytics model → `types/discoveryAnalytics.ts`

#### `legal-holds-api.ts`
**Move to Types Folder**:
- `LegalHold` - Domain model (duplicates `types/legalHold.ts`)
- `LegalHoldFilters` - Filters

#### `privilege-log-api.ts`
**Move to Types Folder**:
- `PrivilegeLogEntry` - Domain model (duplicates `types/privilegeLogEntry.ts`)
- `PrivilegeLogFilters` - Filters

#### `examinations-api.ts`, `evidence-api.ts`
- Use types from `@/types` - already centralized ✓

---

### 2.3 Trial Domain (`frontend/src/api/trial/`)

#### `trial-api.ts`
**Move to Types Folder**:
- `Trial` - Domain model → `types/trial.ts`
- `TrialFilters` - Filters → `types/trialFilters.ts`

#### `exhibits-api.ts`
**Move to Types Folder**:
- `Exhibit` - Domain model (may duplicate `types/exhibit.ts`)
- `ExhibitFilters` - Filters

---

### 2.4 Workflow Domain (`frontend/src/api/workflow/`)

#### `workflow-api.ts`
**Move to Types Folder**:
- `WorkflowTemplate` - Domain model → `types/workflowTemplate.ts`
- `WorkflowInstance` - Domain model → `types/workflowInstance.ts`
- `WorkflowFilters` - Filters

#### `tasks-api.ts`
**Keep in Service**:
- `CreateTaskDto` - Request DTO
- `UpdateTaskDto` - Request DTO
- `TaskFilters` - Filter parameters (could move for reusability)

#### `projects-api.ts`
**Move to Types Folder**:
- `Project` - Domain model → `types/project.ts`
- `ProjectFilters` - Filters

#### `risks-api.ts`
**Keep in Service**:
- `CreateRiskDto` - Request DTO
- `UpdateRiskDto` - Request DTO

**Move to Types Folder**:
- `RiskFilters` - Filters → `types/riskFilters.ts`

#### `calendar-api.ts`
**Keep in Service**:
- `CreateCalendarEventDto` - Request DTO
- `UpdateCalendarEventDto` - Request DTO

**Move to Types Folder**:
- `CalendarEvent` - Domain model → `types/calendarEvent.ts`
- `CalendarFilters` - Filters
- `BaseEntity` - Utility type (internal, keep here)

#### `war-room-api.ts`
**Keep in Service**:
- `CreateAdvisorDto` - Request DTO
- `CreateExpertDto` - Request DTO
- `UpdateStrategyDto` - Request DTO

---

### 2.5 Billing Domain (`frontend/src/api/billing/`)

#### `billing-api.ts`
- Uses types from `@/types` - already centralized ✓

#### `time-entries-api.ts`
**Keep in Service**:
- `TimeEntryFilters` - Filter parameters
- `CreateTimeEntryDto` - Request DTO
- `UpdateTimeEntryDto` - Request DTO
- `BulkTimeEntryDto` - Request DTO

**Move to Types Folder**:
- `TimeEntryTotals` - Statistics model → `types/timeEntryTotals.ts`
- `BulkOperationResult` - Reusable result type → `types/bulkOperationResult.ts`

#### `invoices-api.ts`
**Keep in Service**:
- `InvoiceFilters` - Filter parameters
- `CreateInvoiceDto` - Request DTO

**Move to Types Folder**:
- `InvoiceItem` - Sub-model → `types/invoiceItem.ts`
- `InvoicePayment` - Sub-model → `types/invoicePayment.ts`

#### `expenses-api.ts`
**Keep in Service**:
- `ExpenseFilters` - Filter parameters
- `CreateExpenseDto` - Request DTO
- `UpdateExpenseDto` - Request DTO

**Move to Types Folder**:
- `ExpenseTotals` - Statistics → `types/expenseTotals.ts`

#### `billing-analytics-api.ts`
**Move to Types Folder**:
- `BillingAnalytics` - Analytics model (may duplicate `types/billingStats.ts`)

#### `rate-tables-api.ts`, `trust-accounts-api.ts`, `fee-agreements-api.ts`
- Review for additional types

---

### 2.6 Drafting Domain (`frontend/src/api/domains/drafting.api.ts`)

**Move to Types Folder**:
- `DraftingStats` → `types/draftingStats.ts`
- `TemplateCategory` (enum) → `types/enums/templateCategory.ts`
- `TemplateStatus` (enum) → `types/enums/templateStatus.ts`
- `GeneratedDocumentStatus` (enum) → `types/enums/generatedDocumentStatus.ts`
- `TemplateVariable` → `types/templateVariable.ts`
- `ClauseReference` → `types/clauseReference.ts`
- `DraftingTemplate` → `types/draftingTemplate.ts`
- `GeneratedDocument` → `types/generatedDocument.ts`

**Keep in Service**:
- `CreateTemplateDto` - Request DTO
- `UpdateTemplateDto` - Request DTO
- `GenerateDocumentDto` - Request DTO
- `UpdateGeneratedDocumentDto` - Request DTO
- `ValidationError` - Service-specific validation type
- `TemplateValidationResult` - Service-specific validation result
- `VariableValidationResult` - Service-specific validation result
- `ClauseConflict` - Service-specific conflict detection
- `ClauseValidationResult` - Service-specific validation result

---

### 2.7 Auth & Security Domain (`frontend/src/api/auth/`)

#### `users-api.ts`
**Keep in Service**:
- `CreateUserDto` - Request DTO
- `UpdateUserDto` - Request DTO
- `UserFilters` - Filter parameters
- `ChangePasswordDto` - Request DTO

**Move to Types Folder**:
- `UserStatistics` → `types/userStatistics.ts`

#### `ethical-walls-api.ts`
**Move to Types Folder**:
- `EthicalWall` - Domain model (duplicates `types/ethicalWall.ts`)
- `EthicalWallFilters` - Filters

#### `permissions-api.ts`
**Move to Types Folder**:
- `Permission` → `types/permission.ts`
- `RolePermissions` → `types/rolePermissions.ts`

#### `api-keys-api.ts`
**Move to Types Folder**:
- `ApiKey` → `types/apiKey.ts`

#### `token-blacklist-admin-api.ts`
**Move to Types Folder**:
- `BlacklistedToken` → `types/blacklistedToken.ts`

#### `auth-api.ts`
- Uses types from `@/types` - already centralized ✓

---

### 2.8 Communications Domain (`frontend/src/api/communications/`)

#### `clients-api.ts`
**Move to Types Folder**:
- `Client` - Domain model (may duplicate `types/client.ts`)
- `ClientFilters` - Filters
- `ClientStatistics` - Statistics

#### `communications-api.ts`
**Move to Types Folder**:
- `Communication` → `types/communication.ts`
- `CommunicationFilters` - Filters

#### `correspondence-api.ts`
**Move to Types Folder**:
- `Correspondence` → `types/correspondence.ts`
- `CorrespondenceFilters` - Filters

#### `messaging-api.ts`
**Move to Types Folder**:
- `Message` → `types/message.ts`
- `MessageFilters` - Filters
- `Conversation` - Domain model (may duplicate `types/conversation.ts`)
- `Contact` → `types/contact.ts`

#### `notifications-api.ts`
**Move to Types Folder**:
- `ApiNotification` → `types/notification.ts`
- `ApiNotificationFilters` - Filters

---

### 2.9 Compliance Domain (`frontend/src/api/compliance/`)

#### `compliance-api.ts`
**Move to Types Folder**:
- `ComplianceCheck` → `types/complianceCheck.ts`
- `ComplianceEthicalWall` → Merge with `types/ethicalWall.ts`
- `EthicalWall` (type alias) - Remove duplication

#### `conflict-checks-api.ts`
**Move to Types Folder**:
- `ConflictCheck` - Domain model (may duplicate `types/conflictCheck.ts`)

#### `compliance-reporting-api.ts`
**Move to Types Folder**:
- `ComplianceReport` → `types/complianceReport.ts`

#### `reports-api.ts`
**Move to Types Folder**:
- `Report` → `types/report.ts`
- `ReportTemplate` → `types/reportTemplate.ts`

**Keep in Service**:
- `GenerateReportRequest` - Request DTO

---

### 2.10 Analytics Domain (`frontend/src/api/analytics/`)

#### `analytics-api.ts`
**Move to Types Folder**:
- `AnalyticsEvent` → `types/analyticsEvent.ts`
- `Dashboard` → `types/dashboard.ts`
- `MetricData` → `types/metricData.ts`
- `TimeSeriesData` → `types/timeSeriesData.ts`

#### `dashboard-api.ts`
**Move to Types Folder**:
- `DashboardConfig` - May duplicate `types/dashboardData.ts`

#### `case-analytics-api.ts`
**Move to Types Folder**:
- `CaseAnalytics` → `types/caseAnalytics.ts`

#### `citations-api.ts`
**Move to Types Folder**:
- `Citation` → `types/citation.ts`
- `CitationFilters` - Filters

#### `jurisdiction-api.ts`
**Keep in Service**:
- `CreateJurisdictionDto` - Request DTO
- `JurisdictionFilters` - Filter parameters
- `RuleFilters` - Filter parameters
- `CreateJurisdictionRuleDto` - Request DTO

**Move to Types Folder**:
- `Jurisdiction` - Domain model (may duplicate `types/jurisdiction.ts`)

#### `knowledge-api.ts`
**Move to Types Folder**:
- `KnowledgeFilters` → `types/knowledgeFilters.ts`

#### `search-api.ts`
**Move to Types Folder**:
- `SearchStats` → `types/searchStats.ts`

#### `judge-stats-api.ts`
**Move to Types Folder**:
- `JudgeStatistics` → `types/judgeStatistics.ts`

#### `ai-ops-api.ts`
**Move to Types Folder**:
- `AIOperation` → `types/aiOperation.ts`

#### `bluebook-api.ts`
**Move to Types Folder**:
- `CitationValidation` → `types/citationValidation.ts`
- `CitationParseResult` → `types/citationParseResult.ts`

#### `clauses-api.ts`
**Move to Types Folder**:
- `ClauseFilters` - Filters

---

### 2.11 Admin Domain (`frontend/src/api/admin/`)

#### `audit-logs-api.ts`
**Move to Types Folder**:
- `AuditLog` - Domain model (may duplicate `types/auditLogEntry.ts`)
- `AuditLogFilters` - Filters

#### `documents-api.ts`, `document-versions-api.ts`
**Move to Types Folder**:
- `DocumentVersion` → `types/documentVersion.ts`

#### `backups-api.ts`
**Move to Types Folder**:
- `Backup` → `types/backup.ts`

#### `health-api.ts`
**Move to Types Folder**:
- `HealthCheck` → `types/healthCheck.ts`

#### `metrics-api.ts`
**Move to Types Folder**:
- `SystemMetrics` → `types/systemMetrics.ts`

#### `monitoring-api.ts`
**Move to Types Folder**:
- `AdminSystemHealth` → `types/systemHealth.ts`
- `AdminPerformanceMetric` → `types/performanceMetric.ts`

#### `ocr-api.ts`
**Move to Types Folder**:
- `OCRJob` → `types/ocrJob.ts`
- `OCRRequest` - Request DTO (keep in service)

#### `processing-jobs-api.ts`
**Move to Types Folder**:
- `ProcessingJob` → `types/processingJob.ts`
- `JobFilters` - Filters

#### `service-jobs-api.ts`
**Move to Types Folder**:
- `ServiceJob` → `types/serviceJob.ts`
- `ServiceJobFilters` - Filters

#### `sync-api.ts`
**Move to Types Folder**:
- `AdminSyncStatus` → `types/syncStatus.ts`
- `AdminSyncConflict` → `types/syncConflict.ts`
- `SyncResult` → `types/syncResult.ts`

#### `versioning-api.ts`
**Move to Types Folder**:
- `Version` → `types/version.ts`
- `VersionFilters` - Filters

---

### 2.12 Data Platform Domain (`frontend/src/api/data-platform/`)

#### `ai-ops-api.ts`
**Move to Types Folder**:
- `VectorEmbedding` → `types/vectorEmbedding.ts`
- `AIModel` → `types/aiModel.ts`

#### `backups-api.ts`
**Move to Types Folder**:
- `BackupSnapshot` → `types/backupSnapshot.ts`
- `BackupSchedule` → `types/backupSchedule.ts`

#### `data-sources-api.ts`
**Move to Types Folder**:
- `DataSource` → `types/dataSource.ts`

#### `monitoring-api.ts`
**Move to Types Folder**:
- `PerformanceMetric` → `types/performanceMetric.ts`
- `SystemAlert` → `types/systemAlert.ts`
- `SystemHealth` → `types/systemHealth.ts`

#### `pipelines-api.ts`
**Move to Types Folder**:
- `Pipeline` → `types/pipeline.ts`

#### `query-workbench-api.ts`
**Move to Types Folder**:
- `QueryResult` → `types/queryResult.ts`
- `QueryHistoryItem` → `types/queryHistoryItem.ts`
- `SavedQuery` → `types/savedQuery.ts`

#### `rls-policies-api.ts`
**Move to Types Folder**:
- `RLSPolicy` → `types/rlsPolicy.ts`

#### `schema-management-api.ts`
**Move to Types Folder**:
- `SchemaTable` → `types/schemaTable.ts`
- `Migration` → `types/migration.ts`
- `Snapshot` → `types/snapshot.ts`

#### `sync-api.ts`
**Move to Types Folder**:
- `SyncStatus` → `types/syncStatus.ts`
- `SyncQueueItem` → `types/syncQueueItem.ts`
- `SyncConflict` → `types/syncConflict.ts`

#### `versioning-api.ts`
**Move to Types Folder**:
- `DataVersion` → `types/dataVersion.ts`

---

### 2.13 HR Domain (`frontend/src/api/hr/`)

#### `hr-api.ts`
**Move to Types Folder**:
- `StaffMember` - Domain model (may duplicate `types/staffMember.ts`)
- `StaffFilters` - Filters

---

### 2.14 Integrations Domain (`frontend/src/api/integrations/`)

#### `external-api-api.ts`
**Move to Types Folder**:
- `ExternalAPIConfig` → `types/externalApiConfig.ts`
- `ExternalAPICall` → `types/externalApiCall.ts`

#### `integrations-api.ts`
**Move to Types Folder**:
- `Integration` → `types/integration.ts`
- `IntegrationCredentials` → `types/integrationCredentials.ts`

#### `organizations-api.ts`
**Move to Types Folder**:
- `Organization` - Domain model (may duplicate `types/organization.ts`)
- `OrganizationFilters` - Filters

#### `pacer-api.ts`
**Move to Types Folder**:
- `PACERConfig` → `types/pacerConfig.ts`
- `PACERDocketSearchParams` → `types/pacerDocketSearchParams.ts`
- `PACERDocketEntry` → `types/pacerDocketEntry.ts`
- `PACERSyncResult` → `types/pacerSyncResult.ts`
- `PACERConnection` → `types/pacerConnection.ts`

#### `webhooks-api.ts`
- Uses `SystemWebhookConfig` from `@/types/system` - already centralized ✓

---

### 2.15 Legal Entities Domain (`frontend/src/api/domains/legal-entities.api.ts`)

**Move to Types Folder**:
- `EntityRelationship` → `types/entityRelationship.ts`
- `LegalEntityApi` → `types/legalEntityApi.ts`

---

## 3. Identified Duplications

### Confirmed Duplicates (Need Consolidation)

1. **EthicalWall**
   - `types/ethicalWall.ts` (existing)
   - `auth/ethical-walls-api.ts` → `EthicalWall` interface
   - `compliance/compliance-api.ts` → `ComplianceEthicalWall` interface
   - **Action**: Consolidate into `types/ethicalWall.ts`, remove duplicates

2. **Motion**
   - `types/motion.ts` (existing)
   - `litigation/motions-api.ts` → `Motion` interface
   - **Action**: Use `types/motion.ts`, remove duplicate

3. **LegalHold**
   - `types/legalHold.ts` (existing)
   - `discovery/legal-holds-api.ts` → `LegalHold` interface
   - **Action**: Use `types/legalHold.ts`, remove duplicate

4. **PrivilegeLogEntry**
   - `types/privilegeLogEntry.ts` (existing)
   - `discovery/privilege-log-api.ts` → `PrivilegeLogEntry` interface
   - **Action**: Use `types/privilegeLogEntry.ts`, remove duplicate

5. **Conversation**
   - `types/conversation.ts` (existing)
   - `communications/messaging-api.ts` → `Conversation` interface
   - **Action**: Use `types/conversation.ts`, remove duplicate

6. **ConflictCheck**
   - `types/conflictCheck.ts` (existing)
   - `compliance/conflict-checks-api.ts` → `ConflictCheck` interface
   - **Action**: Use `types/conflictCheck.ts`, remove duplicate

7. **StaffMember**
   - `types/staffMember.ts` (existing)
   - `hr/hr-api.ts` → `StaffMember` interface
   - **Action**: Use `types/staffMember.ts`, remove duplicate

8. **Organization**
   - `types/organization.ts` (existing)
   - `integrations/organizations-api.ts` → `Organization` interface
   - **Action**: Use `types/organization.ts`, remove duplicate

9. **Client**
   - `types/client.ts` (existing)
   - `communications/clients-api.ts` → `Client` interface
   - **Action**: Use `types/client.ts`, remove duplicate

10. **Exhibit**
    - `types/exhibit.ts` (existing)
    - `trial/exhibits-api.ts` → `Exhibit` interface
    - **Action**: Use `types/exhibit.ts`, remove duplicate

11. **AuditLog**
    - `types/auditLogEntry.ts` (existing as `AuditLogEntry`)
    - `admin/audit-logs-api.ts` → `AuditLog` interface
    - **Action**: Standardize to `AuditLogEntry`, remove duplicate

12. **BillingAnalytics**
    - `types/billingStats.ts` (existing as `BillingStats`)
    - `billing/billing-analytics-api.ts` → `BillingAnalytics` interface
    - **Action**: Consolidate into `types/billingStats.ts`

13. **Jurisdiction**
    - `types/jurisdiction.ts` (existing)
    - `analytics/jurisdiction-api.ts` → `Jurisdiction` interface
    - **Action**: Use `types/jurisdiction.ts`, remove duplicate

14. **Dashboard**
    - `types/dashboardData.ts` (existing)
    - `analytics/analytics-api.ts` → `Dashboard` interface
    - `analytics/dashboard-api.ts` → `DashboardConfig` interface
    - **Action**: Consolidate into `types/dashboardData.ts`

### Potential Duplicates (Require Investigation)

- `Pleading` vs `PleadingTemplate`
- `DiscoveryRequest` (two files with same name)
- `SyncStatus` / `AdminSyncStatus` (admin vs data-platform)
- `PerformanceMetric` / `AdminPerformanceMetric` (admin vs data-platform)
- `SyncConflict` / `AdminSyncConflict` (admin vs data-platform)

---

## 4. Migration Plan

### Phase 1: Create New Type Files (84 files)

#### 4.1 Domain Models (45 files)

**Litigation Types** (14 files):
```
types/caseStats.ts
types/caseTeamMember.ts
types/casePhase.ts
types/matterStats.ts
types/trial.ts
types/pleading.ts
types/partyType.ts
types/partyRole.ts
```

**Discovery Types** (10 files):
```
types/discoveryProcess.ts
types/witness.ts
types/production.ts
types/deposition.ts
types/custodian.ts
types/custodianInterview.ts
types/esiSource.ts
types/discoveryAnalytics.ts
```

**Workflow Types** (8 files):
```
types/workflowTemplate.ts
types/workflowInstance.ts
types/project.ts
types/calendarEvent.ts
```

**Drafting Types** (7 files):
```
types/draftingStats.ts
types/templateVariable.ts
types/clauseReference.ts
types/draftingTemplate.ts
types/generatedDocument.ts
types/enums/templateCategory.ts
types/enums/templateStatus.ts
types/enums/generatedDocumentStatus.ts
```

**Auth & Security Types** (6 files):
```
types/userStatistics.ts
types/permission.ts
types/rolePermissions.ts
types/apiKey.ts
types/blacklistedToken.ts
```

#### 4.2 Filter Types (39 files)

Create dedicated filters subfolder: `types/filters/`

```
types/filters/caseFilters.ts
types/filters/partyFilters.ts
types/filters/pleadingFilters.ts
types/filters/motionFilters.ts
types/filters/matterFilters.ts
types/filters/caseTeamFilters.ts
types/filters/casePhaseFilters.ts
types/filters/trialFilters.ts
types/filters/exhibitFilters.ts
types/filters/witnessFilters.ts
types/filters/productionFilters.ts
types/filters/depositionFilters.ts
types/filters/custodianInterviewFilters.ts
types/filters/esiSourceFilters.ts
types/filters/discoveryRequestFilters.ts
types/filters/legalHoldFilters.ts
types/filters/privilegeLogFilters.ts
types/filters/workflowFilters.ts
types/filters/taskFilters.ts
types/filters/projectFilters.ts
types/filters/riskFilters.ts
types/filters/calendarFilters.ts
types/filters/timeEntryFilters.ts
types/filters/invoiceFilters.ts
types/filters/expenseFilters.ts
types/filters/userFilters.ts
types/filters/ethicalWallFilters.ts
types/filters/clientFilters.ts
types/filters/communicationFilters.ts
types/filters/correspondenceFilters.ts
types/filters/messageFilters.ts
types/filters/notificationFilters.ts
types/filters/citationFilters.ts
types/filters/knowledgeFilters.ts
types/filters/auditLogFilters.ts
types/filters/serviceJobFilters.ts
types/filters/versionFilters.ts
types/filters/staffFilters.ts
types/filters/organizationFilters.ts
```

#### 4.3 Statistics & Analytics Types (15 files)

```
types/timeEntryTotals.ts
types/expenseTotals.ts
types/clientStatistics.ts
types/searchStats.ts
types/judgeStatistics.ts
types/analyticsEvent.ts
types/metricData.ts
types/timeSeriesData.ts
types/citationValidation.ts
types/citationParseResult.ts
types/aiOperation.ts
```

#### 4.4 Communications Types (5 files)

```
types/communication.ts
types/correspondence.ts
types/message.ts
types/contact.ts
types/notification.ts
```

#### 4.5 Compliance Types (2 files)

```
types/complianceCheck.ts
types/complianceReport.ts
types/report.ts
types/reportTemplate.ts
```

#### 4.6 Admin & System Types (15 files)

```
types/backup.ts
types/healthCheck.ts
types/systemMetrics.ts
types/systemHealth.ts
types/performanceMetric.ts
types/ocrJob.ts
types/processingJob.ts
types/serviceJob.ts
types/syncStatus.ts
types/syncConflict.ts
types/syncResult.ts
types/version.ts
types/documentVersion.ts
```

#### 4.7 Data Platform Types (14 files)

```
types/vectorEmbedding.ts
types/aiModel.ts
types/backupSnapshot.ts
types/backupSchedule.ts
types/dataSource.ts
types/systemAlert.ts
types/pipeline.ts
types/queryResult.ts
types/queryHistoryItem.ts
types/savedQuery.ts
types/rlsPolicy.ts
types/schemaTable.ts
types/migration.ts
types/snapshot.ts
types/syncQueueItem.ts
types/dataVersion.ts
```

#### 4.8 Integrations Types (8 files)

```
types/externalApiConfig.ts
types/externalApiCall.ts
types/integration.ts
types/integrationCredentials.ts
types/pacerConfig.ts
types/pacerDocketSearchParams.ts
types/pacerDocketEntry.ts
types/pacerSyncResult.ts
types/pacerConnection.ts
```

#### 4.9 Utility Types (3 files)

```
types/bulkOperationResult.ts
types/invoiceItem.ts
types/invoicePayment.ts
types/entityRelationship.ts
types/legalEntityApi.ts
```

---

### Phase 2: Update Import Paths

**Pattern for Migration**:
```typescript
// Before (in service file)
export interface CaseStats {
  totalActive: number;
  // ...
}

// After (in service file)
import type { CaseStats } from '@/api/types';

// In types/caseStats.ts
export interface CaseStats {
  totalActive: number;
  // ...
}
```

**Bulk Import Pattern** (for filters):
```typescript
// Before
export interface CaseFilters { /* ... */ }
export interface PartyFilters { /* ... */ }

// After
import type { CaseFilters, PartyFilters } from '@/api/types/filters';
```

---

### Phase 3: Consolidate Duplicates

#### Step 1: Audit Existing Types
For each duplicate pair:
1. Compare field definitions
2. Identify discrepancies
3. Choose canonical version (usually in `types/`)
4. Create migration notes for breaking changes

#### Step 2: Update References
1. Search all usages of duplicate type
2. Update imports to canonical version
3. Remove duplicate definition
4. Test affected components

#### Step 3: Update Index Files

**Update `types/index.ts`**:
```typescript
// Add new exports (alphabetically)
export * from './aiModel';
export * from './apiKey';
export * from './backup';
// ... (all new types)

// Add filter exports
export * from './filters';
```

**Create `types/filters/index.ts`**:
```typescript
export * from './caseFilters';
export * from './partyFilters';
// ... (all filter types)
```

**Create `types/enums/index.ts`**:
```typescript
export * from './templateCategory';
export * from './templateStatus';
export * from './generatedDocumentStatus';
```

---

### Phase 4: Update Type Re-exports

**Domain barrel files** (e.g., `litigation/index.ts`):
```typescript
// Before (exporting from service file)
export type { Motion, MotionFilters } from './motions-api';

// After (re-exporting from types)
export type { Motion } from '@/api/types';
export type { MotionFilters } from '@/api/types/filters';
```

**Main API index** (`api/index.ts`):
```typescript
// Add comprehensive type re-exports
export * from './types';
export * from './types/filters';
export * from './types/enums';
```

---

## 5. Implementation Checklist

### Pre-Migration
- [ ] Create backup branch
- [ ] Document current import patterns
- [ ] Run full test suite baseline

### Phase 1: Create Type Files
- [ ] Create `types/filters/` directory
- [ ] Create `types/enums/` directory
- [ ] Create 84 new type files
- [ ] Update `types/index.ts`
- [ ] Create `types/filters/index.ts`
- [ ] Create `types/enums/index.ts`

### Phase 2: Migrate Domain Types (by priority)

**High Priority** (breaks functionality if wrong):
- [ ] Litigation domain (14 types)
- [ ] Discovery domain (10 types)
- [ ] Billing domain (8 types)
- [ ] Auth domain (6 types)

**Medium Priority** (shared across features):
- [ ] Workflow domain (8 types)
- [ ] Trial domain (2 types)
- [ ] Communications domain (5 types)
- [ ] Analytics domain (10 types)

**Low Priority** (isolated features):
- [ ] Admin domain (15 types)
- [ ] Data Platform domain (14 types)
- [ ] Integrations domain (8 types)
- [ ] Compliance domain (4 types)
- [ ] HR domain (2 types)
- [ ] Drafting domain (7 types)

### Phase 3: Consolidate Duplicates
- [ ] Audit 14 confirmed duplicates
- [ ] Consolidate EthicalWall types
- [ ] Consolidate Motion types
- [ ] Consolidate LegalHold types
- [ ] Consolidate PrivilegeLogEntry types
- [ ] Consolidate Conversation types
- [ ] Consolidate ConflictCheck types
- [ ] Consolidate StaffMember types
- [ ] Consolidate Organization types
- [ ] Consolidate Client types
- [ ] Consolidate Exhibit types
- [ ] Consolidate AuditLog types
- [ ] Consolidate BillingAnalytics types
- [ ] Consolidate Jurisdiction types
- [ ] Consolidate Dashboard types

### Phase 4: Update Service Files
- [ ] Update litigation services (7 files)
- [ ] Update discovery services (12 files)
- [ ] Update trial services (2 files)
- [ ] Update workflow services (6 files)
- [ ] Update billing services (7 files)
- [ ] Update drafting service (1 file)
- [ ] Update auth services (6 files)
- [ ] Update communications services (5 files)
- [ ] Update compliance services (4 files)
- [ ] Update analytics services (13 files)
- [ ] Update admin services (11 files)
- [ ] Update data-platform services (10 files)
- [ ] Update integrations services (5 files)
- [ ] Update HR service (1 file)
- [ ] Update legal-entities service (1 file)

### Phase 5: Update Barrel Exports
- [ ] Update `api/index.ts`
- [ ] Update domain barrel files (15 files)
- [ ] Update `types/index.ts`

### Phase 6: Testing & Validation
- [ ] Run TypeScript compiler
- [ ] Fix type errors
- [ ] Run full test suite
- [ ] Manual smoke testing
- [ ] Validate no circular dependencies

### Post-Migration
- [ ] Update architecture documentation
- [ ] Update developer guidelines
- [ ] Create type organization guide
- [ ] Archive migration plan

---

## 6. Guidelines for Future Type Organization

### ✅ DO: Move to `types/` Folder

1. **Domain Models**: Core business entities
   - `Case`, `Document`, `User`, `TimeEntry`, etc.

2. **Statistics & Analytics**: Aggregated data structures
   - `CaseStats`, `BillingAnalytics`, `UserStatistics`

3. **Reusable Interfaces**: Shared across multiple services
   - `Pagination`, `SearchResult`, `BulkOperationResult`

4. **Filters**: Query parameter interfaces
   - Move to `types/filters/` for organization

5. **Enums**: Shared enumeration types
   - Move to `types/enums/` for organization

6. **Sub-Models**: Nested structures used in multiple contexts
   - `InvoiceItem`, `CalendarEvent`, `TemplateVariable`

### ❌ DON'T: Keep in Service Files

1. **Request DTOs**: API input structures
   - `CreateCaseDto`, `UpdatePartyDto`, `GenerateReportRequest`

2. **Service-Specific Types**: Only used within one service
   - `ValidationError`, `TemplateValidationResult`

3. **Internal Helper Types**: Implementation details
   - `BaseEntity` (if only used locally)

4. **Response Wrappers**: Service-specific response formats
   - Unless reused across multiple endpoints

### Naming Conventions

- **Domain Models**: PascalCase, singular
  - `Case`, `Document`, `User`

- **Filters**: PascalCase + `Filters` suffix
  - `CaseFilters`, `PartyFilters`

- **DTOs**: PascalCase + `Dto` suffix
  - `CreateCaseDto`, `UpdatePartyDto`

- **Statistics**: PascalCase + `Stats` or `Statistics` suffix
  - `CaseStats`, `UserStatistics`

- **Enums**: PascalCase, singular
  - `TemplateCategory`, `GeneratedDocumentStatus`

---

## 7. Risk Assessment

### Low Risk
- Moving filters to `types/filters/` (self-contained)
- Creating new enum files (additive change)
- Adding new type exports

### Medium Risk
- Consolidating duplicate types (requires coordination)
- Updating service file imports (many files affected)
- Refactoring barrel exports

### High Risk
- Changing type names during consolidation (breaking change)
- Circular dependency introduction (hard to debug)
- Mock data migration (affects testing)

### Mitigation Strategies
1. **Incremental Migration**: Complete one domain at a time
2. **Type Alias Bridge**: Use type aliases during transition
3. **Automated Testing**: Run tests after each domain migration
4. **Git Submodules**: Consider domain-by-domain branches
5. **Communication**: Document each migration phase

---

## 8. Estimated Effort

- **Phase 1 (Create Type Files)**: 8 hours
- **Phase 2 (Migrate Types)**: 24 hours (84 files × 15-20 min each)
- **Phase 3 (Consolidate Duplicates)**: 6 hours (14 duplicates × 25 min each)
- **Phase 4 (Update Service Files)**: 16 hours (91 files × 10 min each)
- **Phase 5 (Update Barrel Exports)**: 3 hours
- **Phase 6 (Testing & Validation)**: 8 hours

**Total Estimated Time**: 65 hours (8-9 working days)

---

## 9. Success Criteria

✅ Migration Complete When:
1. All domain models centralized in `types/`
2. All filters organized in `types/filters/`
3. All enums organized in `types/enums/`
4. Zero duplicate type definitions
5. All service files use centralized types
6. TypeScript compiles without errors
7. All tests pass
8. No circular dependencies
9. Documentation updated
10. Developer guidelines published

---

## 10. Appendix: File Mapping Reference

### Quick Reference Table

| Service File | Types to Move | Destination File |
|-------------|---------------|------------------|
| `cases-api.ts` | `CaseStats` | `types/caseStats.ts` |
| `parties-api.ts` | `PartyFilters` | `types/filters/partyFilters.ts` |
| `motions-api.ts` | `Motion` (duplicate) | Use `types/motion.ts` |
| `pleadings-api.ts` | `Pleading`, `PleadingFilters` | `types/pleading.ts`, `types/filters/pleadingFilters.ts` |
| `discovery-api.ts` | `DiscoveryProcess` | `types/discoveryProcess.ts` |
| `witnesses-api.ts` | `Witness`, `WitnessFilters` | `types/witness.ts`, `types/filters/witnessFilters.ts` |
| `trial-api.ts` | `Trial`, `TrialFilters` | `types/trial.ts`, `types/filters/trialFilters.ts` |
| `workflow-api.ts` | `WorkflowTemplate`, `WorkflowInstance` | `types/workflowTemplate.ts`, `types/workflowInstance.ts` |
| `tasks-api.ts` | `TaskFilters` | `types/filters/taskFilters.ts` |
| `projects-api.ts` | `Project`, `ProjectFilters` | `types/project.ts`, `types/filters/projectFilters.ts` |
| `calendar-api.ts` | `CalendarEvent`, `CalendarFilters` | `types/calendarEvent.ts`, `types/filters/calendarFilters.ts` |
| `time-entries-api.ts` | `TimeEntryTotals`, `BulkOperationResult` | `types/timeEntryTotals.ts`, `types/bulkOperationResult.ts` |
| `drafting.api.ts` | `DraftingStats`, Enums, Domain Models | `types/draftingStats.ts`, `types/enums/*`, etc. |
| `users-api.ts` | `UserStatistics` | `types/userStatistics.ts` |
| `analytics-api.ts` | `AnalyticsEvent`, `Dashboard`, etc. | `types/analyticsEvent.ts`, `types/dashboard.ts`, etc. |
| `compliance-api.ts` | `ComplianceCheck` | `types/complianceCheck.ts` |

*(Full 186-file mapping available in separate spreadsheet)*

---

## Notes

- This plan was generated from analysis of 186 TypeScript files
- Some types may require additional investigation for consolidation
- Consider using `@deprecated` JSDoc tags during transition
- Maintain backward compatibility where possible using type aliases
- Update this document as consolidation progresses

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-28  
**Author**: GitHub Copilot AI Assistant  
**Status**: Ready for Implementation
