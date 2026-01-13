# IndexedDB to Backend API Migration Status Report

**Generated:** 2025-12-21

## Executive Summary

This report documents the current state of IndexedDB usage across the LexiFlow Premium frontend codebase. The application is in a **partial migration state**, with many components still relying on IndexedDB for data persistence.

**Total IndexedDB Operations Found:** 265+ direct `db.get/put/delete/getAll` calls  
**Total STORES References:** 300+ references to IndexedDB store constants

---

## ✅ Fully Migrated Domains

### 1. **Compliance Domain** ✅
- **File:** `frontend/services/domain/ComplianceDomain.ts`
- **Status:** FULLY MIGRATED (as of 2025-12-21)
- **Backend APIs Used:**
  - `complianceApi.compliance.getEthicalWalls()`
  - `complianceApi.compliance.createEthicalWall()`
  - `complianceApi.conflictChecks.getAll()`
  - `complianceApi.conflictChecks.check()`
- **Notes:** Includes proper type mapping between API and frontend types

---

## ⚠️ Partially Migrated / Needs Migration

### Domain Services (High Priority)

#### 1. **CRM Domain** ⚠️
- **File:** `frontend/services/domain/CRMDomain.ts`
- **IndexedDB Usage:** 
  - `STORES.CLIENTS` - 3 operations
  - `STORES.CASES` - 2 operations
  - `STORES.ENTITIES` - 1 operation
  - `STORES.RELATIONSHIPS` - 1 operation
- **Required Backend APIs:** Client API, Case API, Entity API

#### 2. **Calendar Domain** ⚠️
- **File:** `frontend/services/domain/CalendarDomain.ts`
- **IndexedDB Usage:**
  - `STORES.CALENDAR_EVENTS` - 4 operations (put, get, delete)
- **Required Backend APIs:** Calendar/Events API

#### 3. **Collaboration Domain** ⚠️
- **File:** `frontend/services/domain/CollaborationDomain.ts`
- **IndexedDB Usage:**
  - `STORES.WORKSPACES` - 7 operations
  - `STORES.COMMENTS` - 2 operations
  - `STORES.SHARES` - 1 operation
- **Required Backend APIs:** Workspace API, Comments API, Sharing API

#### 4. **Dashboard Domain** ⚠️
- **File:** `frontend/services/domain/DashboardDomain.ts`
- **IndexedDB Usage:**
  - `STORES.DASHBOARDS` - 8 operations
  - `STORES.CASES` - 1 operation
  - `STORES.TASKS` - 1 operation
  - `STORES.TIME_ENTRIES` - 1 operation
- **Required Backend APIs:** Dashboard API, Widgets API

#### 5. **Data Source Domain** ⚠️
- **File:** `frontend/services/domain/DataSourceDomain.ts`
- **IndexedDB Usage:**
  - `STORES.DATA_SOURCES` - 11 operations
- **Required Backend APIs:** Data Sources API

#### 6. **Jurisdiction Domain** ⚠️
- **File:** `frontend/services/domain/JurisdictionDomain.ts`
- **IndexedDB Usage:**
  - `STORES.JURISDICTIONS` - 3 operations
- **Status:** Has backend API fallback pattern
- **Required Backend APIs:** Jurisdiction API (partially implemented)

#### 7. **Notification Domain** ⚠️
- **File:** `frontend/services/domain/NotificationDomain.ts`
- **IndexedDB Usage:**
  - `STORES.NOTIFICATIONS` - 1 operation
- **Required Backend APIs:** Notifications API

#### 8. **Organization Domain** ⚠️
- **File:** `frontend/services/domain/OrganizationDomain.ts`
- **IndexedDB Usage:**
  - `STORES.ORGANIZATIONS` - 3 operations
  - `STORES.DEPARTMENTS` - 2 operations
  - `STORES.MEMBERS` - 2 operations
- **Required Backend APIs:** Organization API, Department API, Members API

#### 9. **Research Domain** ⚠️
- **File:** `frontend/services/domain/ResearchDomain.ts`
- **IndexedDB Usage:**
  - `STORES.CITATIONS` - 8 operations
  - `STORES.DOCUMENTS` - 1 operation
  - `STORES.CASES` - 1 operation
- **Required Backend APIs:** Research API, Citations API

#### 10. **Strategy Domain** ⚠️
- **File:** `frontend/services/domain/StrategyDomain.ts`
- **IndexedDB Usage:**
  - `STORES.STRATEGIES` - 7 operations
  - `STORES.CASES` - 1 operation
- **Required Backend APIs:** Strategy API

#### 11. **Transaction Domain** ⚠️
- **File:** `frontend/services/domain/TransactionDomain.ts`
- **IndexedDB Usage:**
  - `STORES.TRANSACTIONS` - 9 operations
- **Required Backend APIs:** Transaction API

#### 12. **Search Domain** ⚠️
- **File:** `frontend/services/domain/SearchDomain.ts`
- **IndexedDB Usage:**
  - `STORES.CASES` - 1 operation
  - `STORES.DOCUMENTS` - 2 operations
  - `STORES.CONTACTS` - 1 operation
- **Required Backend APIs:** Search API (unified)

#### 13. **Profile Domain** ⚠️
- **File:** `frontend/services/domain/ProfileDomain.ts`
- **IndexedDB Usage:**
  - `STORES.USERS` - 5 operations
  - `STORES.LOGS` - 1 operation
- **Required Backend APIs:** User Profile API, Audit Log API

#### 14. **Operations Domain** ⚠️
- **File:** `frontend/services/domain/OperationsDomain.ts`
- **IndexedDB Usage:**
  - `STORES.OKRS` - 1 operation
  - `STORES.CLE_TRACKING` - 1 operation
  - `STORES.VENDOR_CONTRACTS` - 1 operation
  - `STORES.VENDOR_DIRECTORY` - 1 operation
  - `STORES.RFPS` - 1 operation
  - `STORES.MAINTENANCE_TICKETS` - 1 operation
  - `STORES.FACILITIES` - 1 operation
  - `STORES.DOCUMENTS` - 1 operation (count)
  - `STORES.TASKS` - 1 operation (count)
- **Required Backend APIs:** Operations API, Facilities API, Vendor API

#### 15. **Asset Domain** ⚠️
- **File:** `frontend/services/domain/AssetDomain.ts`
- **IndexedDB Usage:**
  - `STORES.ASSETS` - 9 operations
  - `STORES.MAINTENANCE_RECORDS` - 2 operations
- **Required Backend APIs:** Asset Management API

#### 16. **Billing Domain** ⚠️
- **File:** `frontend/services/domain/BillingDomain.ts`
- **IndexedDB Usage:**
  - `STORES.CLIENTS` - 2 operations
  - `STORES.BILLING` - 2 operations
  - `STORES.REALIZATION_STATS` - 1 operation
  - `STORES.INVOICES` - 4 operations
  - `STORES.TRUST` - 1 operation
  - `STORES.OPERATING_SUMMARY` - 1 operation
  - `STORES.RATES` - 1 operation
  - `STORES.TRUST_TX` - 1 operation
- **Required Backend APIs:** Billing API, Invoice API, Trust Accounting API

#### 17. **Data Catalog Domain** ⚠️
- **File:** `frontend/services/domain/DataCatalogDomain.ts`
- **IndexedDB Usage:**
  - `STORES.ENTITIES` - 1 operation
  - `STORES.RELATIONSHIPS` - 1 operation
- **Required Backend APIs:** Data Catalog API

#### 18. **Data Quality Domain** ⚠️
- **File:** `frontend/services/domain/DataQualityDomain.ts`
- **IndexedDB Usage:**
  - `STORES.CASES` - 1 operation
  - Anomalies store - 1 operation
- **Required Backend APIs:** Data Quality API

---

### Feature Services (High Priority)

#### 1. **Discovery Service** ⚠️
- **File:** `frontend/services/features/discovery/discoveryService.ts`
- **IndexedDB Usage:** 40+ operations across multiple stores:
  - `STORES.DISCOVERY_EXT_DEPO` - Depositions
  - `STORES.DISCOVERY_EXT_ESI` - ESI Sources
  - `STORES.DISCOVERY_EXT_PROD` - Productions
  - `STORES.DISCOVERY_EXT_INT` - Interviews
  - `STORES.REQUESTS` - Discovery Requests
  - `STORES.EXAMINATIONS` - Examinations
  - `STORES.TRANSCRIPTS` - Transcripts
  - `STORES.VENDORS` - Vendors
  - `STORES.SANCTIONS` - Sanctions
  - `STORES.STIPULATIONS` - Stipulations
  - `STORES.LEGAL_HOLDS` - Legal Holds
  - `STORES.PRIVILEGE_LOG` - Privilege Log
- **Required Backend APIs:** Comprehensive Discovery API suite

#### 2. **Document Service** ⚠️
- **File:** `frontend/services/features/documents/documentService.ts`
- **IndexedDB Usage:**
  - `STORES.DOCUMENTS` - 1 operation
- **Required Backend APIs:** Document Management API

---

### Data Repositories (Medium Priority)

All repository classes extend a base `Repository<T>` class that uses IndexedDB. These need systematic migration:

#### Core Repositories:
1. **CaseRepository** - `STORES.CASES`
2. **PhaseRepository** - `STORES.PHASES`
3. **BillingRepository** - `STORES.BILLING` + multiple billing stores
4. **ClientRepository** - `STORES.CLIENTS`
5. **DiscoveryRepository** - Multiple discovery stores (40+ operations)
6. **ExpenseRepository** - `STORES.EXPENSES`
7. **MatterRepository** - `STORES.MATTERS`
8. **RiskRepository** - `STORES.RISKS`
9. **RuleRepository** - `STORES.RULES`
10. **TemplateRepository** - `STORES.TEMPLATES`
11. **UserRepository** - `STORES.USERS`
12. **WitnessRepository** - `STORES.WITNESSES`
13. **TrialRepository** - `STORES.EXHIBITS`, `STORES.JURORS`, `STORES.WITNESSES`
14. **WorkflowRepository** - `STORES.PROCESSES`, `STORES.TEMPLATES`, `STORES.TASKS`, `STORES.PHASES`, `STORES.WORKFLOW_AUTOMATIONS`, `STORES.NOTIFICATIONS`
15. **TaskRepository** - `STORES.TASKS`
16. **ProjectRepository** - `STORES.PROJECTS`
17. **PleadingRepository** - `STORES.PLEADINGS`, `STORES.PLEADING_TEMPLATES`
18. **OrganizationRepository** - `STORES.ORGS`
19. **MotionRepository** - `STORES.MOTIONS`
20. **HRRepository** - `STORES.STAFF`, `STORES.BILLING`
21. **EvidenceRepository** - `STORES.EVIDENCE`
22. **EntityRepository** - `STORES.ENTITIES`
23. **DocumentRepository** - `STORES.DOCUMENTS`
24. **ExhibitRepository** - `STORES.EXHIBITS`
25. **ClauseRepository** - `STORES.CLAUSES`
26. **CitationRepository** - `STORES.CITATIONS`
27. **AnalysisRepository** - `STORES.ANALYSIS`, `STORES.JUDGES`
28. **DocketRepository** - `STORES.DOCKET`

---

### Integration Handlers (Low Priority)

These handlers respond to events and write to IndexedDB:

1. **CitationSavedHandler** - Writes to `researchCache`, `pleadingSuggestions`
2. **DataSourceConnectedHandler** - Writes to `auditLogs`
3. **DocketIngestedHandler** - Writes to `calendarEvents`

---

### Data Seeder (Infrastructure)

- **File:** `frontend/services/data/dbSeeder.ts`
- **Purpose:** Seeds initial mock data into IndexedDB
- **Usage:** 30+ `batchPut` operations across all stores
- **Migration Strategy:** Replace with backend data seeding or API-based initialization

---

### Admin Components (Low Priority)

1. **DataSourcesManager.old.tsx** - Direct IndexedDB manipulation
2. **IndexedDBView.tsx** - IndexedDB browser/editor

---

### Core Infrastructure

#### MicroORM
- **File:** `frontend/services/core/microORM.ts`
- **Purpose:** Base `Repository<T>` class wrapping IndexedDB operations
- **Methods:** `findById`, `findAll`, `save`, `remove`
- **Migration Strategy:** Replace with API client base class

---

## 📊 Migration Statistics

### By Category:
- **Domain Services:** 18 files (1 migrated, 17 pending)
- **Feature Services:** 2 files (0 migrated, 2 pending)
- **Data Repositories:** 28 files (0 migrated, 28 pending)
- **Integration Handlers:** 3 files (0 migrated, 3 pending)
- **Infrastructure:** 2 files (0 migrated, 2 pending)
- **Admin Tools:** 2 files (0 migrated, 2 pending)

### Total:
- **Files with IndexedDB:** 55+ files
- **Migration Progress:** ~2% complete (1/55 files)
- **IndexedDB Operations:** 265+ direct operations
- **STORES References:** 300+ references

---

## 🎯 Recommended Migration Priority

### Phase 1: Core Business Logic (Weeks 1-4)
1. ✅ **Compliance Domain** (COMPLETED)
2. **Case Domain** - Central to application
3. **Document Domain** - High usage
4. **Billing Domain** - Critical business function
5. **Calendar Domain** - User-facing feature

### Phase 2: Discovery & Workflow (Weeks 5-8)
6. **Discovery Service** - Large, complex domain
7. **Workflow Repository** - Task management
8. **Evidence Repository** - Case evidence
9. **Docket Repository** - Court filings

### Phase 3: Supporting Features (Weeks 9-12)
10. **CRM Domain** - Client management
11. **Research Domain** - Legal research
12. **Strategy Domain** - Case strategy
13. **Collaboration Domain** - Team features
14. **Dashboard Domain** - Analytics

### Phase 4: Administrative & Operations (Weeks 13-16)
15. **Organization Domain** - Org structure
16. **Profile Domain** - User profiles
17. **Operations Domain** - Firm operations
18. **Asset Domain** - Asset management
19. **Data Source Domain** - External integrations

### Phase 5: Infrastructure & Cleanup (Weeks 17-18)
20. **MicroORM Replacement** - Base repository class
21. **Data Seeder Migration** - Backend seeding
22. **Integration Handlers** - Event handlers
23. **Admin Tools** - Development tools
24. **Remove IndexedDB** - Final cleanup

---

## 🔧 Migration Pattern (Template)

Based on the successful ComplianceDomain migration:

```typescript
// 1. Import backend API services
import { backendApi } from '@/api/domains/[domain].api';
import type { ApiType } from '@/api/[domain]-api';

// 2. Replace IndexedDB calls with API calls
// OLD: const data = await db.getAll(STORES.SOMETHING);
// NEW: const data = await backendApi.something.getAll();

// 3. Add type mapping if API types differ from frontend types
const mapApiToFrontend = (apiData: ApiType): FrontendType => ({
  // Map fields
});

// 4. Remove unused imports (db, STORES, delay if not needed)

// 5. Update error handling for network errors
```

---

## 📝 Notes

1. **Dual-Mode Operation:** Some domains (like Jurisdiction) have fallback patterns that try backend API first, then fall back to IndexedDB. These are partially migrated.

2. **Type Mismatches:** Many API types differ from frontend types, requiring mapping functions.

3. **Repository Pattern:** The base `Repository<T>` class in `microORM.ts` is used by 28+ repository classes. Migrating this base class would cascade to all repositories.

4. **Mock Data:** The `dbSeeder.ts` file seeds extensive mock data. Backend should provide seed data or the frontend should fetch from APIs on initialization.

5. **Integration Events:** Event handlers write to IndexedDB for caching and cross-domain updates. These need event-driven backend APIs or message queues.

---

## ✅ Success Criteria

Migration is complete when:
- [ ] All 265+ `db.get/put/delete/getAll` calls removed
- [ ] All 300+ `STORES.*` references removed
- [ ] All domain services use backend APIs
- [ ] All repositories use backend APIs
- [ ] MicroORM replaced with API client base class
- [ ] Data seeder replaced with backend seeding
- [ ] Integration handlers use backend events
- [ ] IndexedDB infrastructure removed
- [ ] All tests passing with backend APIs

---

**Report End**
