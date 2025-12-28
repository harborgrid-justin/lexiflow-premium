# API Services - Organization Guide

## Overview
The `/frontend/src/api` directory is now organized into domain-focused folders for better maintainability and discoverability. This organization follows the Domain-Driven Design (DDD) principle, grouping related services together.

## Folder Structure

### Core Domain Folders

#### 📁 `auth/`
**Authentication & Authorization**
- User authentication and session management
- API keys and token management
- Permissions and role-based access control (RBAC)
- Ethical walls and security boundaries
- Token blacklist administration

**Files**: `auth-api.ts`, `users-api.ts`, `api-keys-api.ts`, `permissions-api.ts`, `ethical-walls-api.ts`, `token-blacklist-admin-api.ts`

#### 📁 `litigation/`
**Case & Matter Management**
- Case lifecycle management
- Docket entry tracking
- Motions and legal filings
- Pleadings management
- Party and attorney management
- Case teams and collaboration
- Case phases and milestones
- Matter organization

**Files**: `cases-api.ts`, `docket-api.ts`, `motions-api.ts`, `pleadings-api.ts`, `parties-api.ts`, `case-teams-api.ts`, `case-phases-api.ts`, `matters-api.ts`

#### 📁 `discovery/`
**Discovery & Evidence Management**
- Evidence collection and organization
- Custodian management
- Examinations and depositions
- Witness management
- Legal holds and preservation
- Production sets
- Discovery requests (interrogatories, RFPs, RFAs)
- ESI (Electronically Stored Information) sources
- Privilege log management
- Custodian interviews
- Discovery analytics

**Files**: `evidence-api.ts`, `custodians-api.ts`, `examinations-api.ts`, `witnesses-api.ts`, `depositions-api.ts`, `legal-holds-api.ts`, `productions-api.ts`, `discovery-requests-api.ts`, `esi-sources-api.ts`, `privilege-log-api.ts`, `custodian-interviews-api.ts`, `discovery-api.ts`, `discovery-analytics-api.ts`

#### 📁 `billing/`
**Financial & Billing Management**
- Time entry tracking
- Invoice generation and management
- Expense tracking
- Fee agreements and arrangements
- Rate tables and billing rates
- Trust account management
- Billing analytics

**Files**: `billing-api.ts`, `billing-analytics-api.ts`, `time-entries-api.ts`, `invoices-api.ts`, `expenses-api.ts`, `fee-agreements-api.ts`, `rate-tables-api.ts`, `trust-accounts-api.ts`

#### 📁 `trial/`
**Trial Preparation & Management**
- Trial preparation workflows
- Exhibit management
- Courtroom presentation tools

**Files**: `trial-api.ts`, `exhibits-api.ts`

#### 📁 `workflow/`
**Task & Project Management**
- Task assignment and tracking
- Calendar and scheduling
- Workflow automation
- Advanced workflow patterns
- Project management
- Risk assessment and management
- War room collaboration

**Files**: `tasks-api.ts`, `calendar-api.ts`, `workflow-api.ts`, `workflow-advanced-api.ts`, `projects-api.ts`, `risks-api.ts`, `war-room-api.ts`

#### 📁 `communications/`
**Client & Internal Communications**
- Client management
- Communication tracking
- Correspondence management
- Internal messaging
- Notifications system

**Files**: `clients-api.ts`, `communications-api.ts`, `correspondence-api.ts`, `messaging-api.ts`, `notifications-api.ts`

#### 📁 `compliance/`
**Compliance & Risk Management**
- Compliance monitoring
- Regulatory reporting
- Conflict of interest checks
- Report generation

**Files**: `compliance-api.ts`, `compliance-reporting-api.ts`, `conflict-checks-api.ts`, `reports-api.ts`

#### 📁 `integrations/`
**External System Integrations**
- PACER (Public Access to Court Electronic Records)
- Webhook management
- Third-party integrations
- Organization syncing
- External API management

**Files**: `pacer-api.ts`, `webhooks-api.ts`, `integrations-api.ts`, `organizations-api.ts`, `external-api-api.ts`

#### 📁 `analytics/`
**Business Intelligence & Legal Research**
- Search functionality
- Dashboard analytics
- AI operations
- Analytics dashboards
- Case analytics
- Discovery analytics
- Outcome predictions and AI insights
- Judge statistics and profiling
- Bluebook citation validation
- Knowledge management
- Citation analysis
- Clause library management
- Jurisdiction information

**Files**: `search-api.ts`, `dashboard-api.ts`, `ai-ops-api.ts`, `analytics-dashboard-api.ts`, `analytics-api.ts`, `case-analytics-api.ts`, `outcome-predictions-api.ts`, `judge-stats-api.ts`, `bluebook-api.ts`, `knowledge-api.ts`, `citations-api.ts`, `clauses-api.ts`, `jurisdiction-api.ts`

#### 📁 `admin/`
**System Administration**
- Document management
- Document version control
- Processing jobs
- OCR (Optical Character Recognition)
- System monitoring
- Health checks
- Analytics infrastructure
- Audit logging
- Version management
- Data synchronization
- Backup management
- Service jobs
- Metrics collection

**Files**: `processing-jobs-api.ts`, `documents-api.ts`, `document-versions-api.ts`, `ocr-api.ts`, `monitoring-api.ts`, `health-api.ts`, `audit-logs-api.ts`, `versioning-api.ts`, `sync-api.ts`, `backups-api.ts`, `service-jobs-api.ts`, `metrics-api.ts`

#### 📁 `data-platform/`
**Data Platform & Infrastructure**
- AI operations and ML workflows
- Backup and restore operations
- System monitoring
- Data pipelines (ETL/ELT)
- Query workbench and SQL execution
- Schema management
- Data synchronization
- Version control for data
- Data sources management
- Row-level security (RLS) policies

**Files**: `ai-ops-api.ts`, `backups-api.ts`, `monitoring-api.ts`, `pipelines-api.ts`, `query-workbench-api.ts`, `schema-management-api.ts`, `sync-api.ts`, `versioning-api.ts`, `data-sources-api.ts`, `rls-policies-api.ts`

#### 📁 `hr/`
**Human Resources**
- Staff management
- HR operations
- Workforce administration

**Files**: `hr-api.ts`

#### 📁 `types/`
**Shared Type Definitions**
All TypeScript interfaces and type definitions used across API services, including data models for:
- Cases, documents, evidence
- Billing, invoices, time entries
- Users, clients, organizations
- Discovery, exhibits, depositions
- Workflows, tasks, projects
- Compliance, audit logs
- Analytics, metrics

**Files**: 50+ type definition files (see `types/index.ts` for full list)

### Legacy Folders

#### 📁 `domains/`
**Domain API Aggregations** (Legacy)
Pre-organized domain API bundles that aggregate multiple services. These are kept for backward compatibility but new code should use the organized folders above.

**Files**: `auth.api.ts`, `litigation.api.ts`, `discovery.api.ts`, `billing.api.ts`, `trial.api.ts`, `workflow.api.ts`, `communications.api.ts`, `compliance.api.ts`, `integrations.api.ts`, `analytics.api.ts`, `admin.api.ts`, `data-platform.api.ts`, `hr.api.ts`, `legal-entities.api.ts`, `drafting.api.ts`

## Usage Patterns

### Recommended: Direct Domain Imports
```typescript
// Import specific services from organized folders
import { CasesApiService } from '@/api/litigation';
import { EvidenceApiService } from '@/api/discovery';
import { BillingApiService } from '@/api/billing';

const casesApi = new CasesApiService();
const cases = await casesApi.getAll();
```

### Alternative: Consolidated API Object
```typescript
// Import the consolidated api object
import { api } from '@/api';

const cases = await api.cases.getAll();
const evidence = await api.evidence.getAll();
```

### Domain-Level Imports
```typescript
// Import entire domain
import * as litigationApi from '@/api/litigation';
import * as discoveryApi from '@/api/discovery';

// Use services from the domain
const cases = await litigationApi.cases.getAll();
```

## Migration Guide

If you have existing imports from the old flat structure, update them as follows:

### Old (Deprecated)
```typescript
import { CasesApiService } from '@/api/cases-api';
import { EvidenceApiService } from '@/api/evidence-api';
```

### New (Organized)
```typescript
import { CasesApiService } from '@/api/litigation';
import { EvidenceApiService } from '@/api/discovery';
```

## Benefits of This Organization

1. **Discoverability**: Easy to find related services grouped by business domain
2. **Maintainability**: Changes to a domain are localized to one folder
3. **Scalability**: New services can be added to appropriate domains without cluttering the root
4. **Team Collaboration**: Teams can own specific domain folders
5. **Reduced Coupling**: Clear boundaries between domains
6. **Import Clarity**: Imports reveal the business context (e.g., `@/api/litigation` vs. `@/api/cases-api`)

## Index Files

Each domain folder contains an `index.ts` that re-exports all services in that domain, providing clean barrel exports:

```typescript
// Example: litigation/index.ts
export * from './cases-api';
export * from './docket-api';
export * from './motions-api';
// ... etc
```

## Backend-First Architecture

All API services default to the PostgreSQL + NestJS backend. The legacy IndexedDB mode is deprecated and only available for development debugging via `localStorage.VITE_USE_INDEXEDDB='true'`.

For more information, see:
- `/backend/README.md` - Backend API documentation
- `/.github/copilot-instructions.md` - Full architecture guide
- `/frontend/src/services/apiConfig.ts` - API configuration
