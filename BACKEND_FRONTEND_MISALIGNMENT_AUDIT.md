# Backend-Frontend API Misalignment Audit Report
**Generated:** December 19, 2025  
**Scope:** Backend entities/controllers vs Frontend types/API services

---

## Executive Summary

This audit analyzes misalignments between:
- **Backend:** 105+ entity files, 94+ controllers across 60+ modules
- **Frontend:** 32 type files, 84+ API services

### Key Findings:
- ✅ **Well-aligned modules:** Cases, Documents, Docket, Pleadings, Evidence, Billing, Compliance, Calendar, Workflow, Users
- ⚠️ **Partial misalignments:** War Room, Tasks, Risks, Trial, HR, Jurisdictions (missing fields or type differences)
- ❌ **Missing frontend types:** Advisor, Expert, CaseStrategy entities (War Room module)
- ❌ **Missing API methods:** Several backend controller endpoints not exposed in frontend services

---

## 1. Missing Frontend Types

### War Room Module - Missing Individual Entity Types
**Backend Entities:** `backend/src/war-room/entities/war-room.entity.ts`

#### 1.1 Advisor Entity
**Backend Definition:**
```typescript
@Entity('advisors')
export class Advisor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firm?: string;
  specialty?: string;
  caseId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Frontend Status:** ❌ **MISSING** - No corresponding type in frontend
**Frontend Has:** Only generic `WarRoom` interface in `war-room-api.ts`
**Impact:** Cannot properly type advisor-specific operations

#### 1.2 Expert Entity
**Backend Definition:**
```typescript
export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

@Entity('experts')
export class Expert {
  id: string;
  name: string;
  expertType: ExpertType;
  email: string;
  phone?: string;
  hourlyRate?: number;
  credentials?: string;
  caseId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Frontend Status:** ❌ **MISSING** - No dedicated Expert type
**Frontend Has:** Generic references in `types/enums.ts` (`EntityRole = 'Expert'`)
**Impact:** Cannot properly type expert witness management

#### 1.3 CaseStrategy Entity
**Backend Definition:**
```typescript
@Entity('case_strategies')
export class CaseStrategy {
  id: string;
  caseId: string;
  objective?: string;
  approach?: string;
  keyArguments?: string;
  notes?: any;
  createdAt: Date;
  updatedAt: Date;
}
```
**Frontend Status:** ❌ **MISSING** - No corresponding type
**Impact:** Cannot properly handle case strategy CRUD operations

---

## 2. Missing Frontend API Service Methods

### 2.1 War Room API - Missing Advisor/Expert Endpoints
**Backend Controller:** `backend/src/war-room/war-room.controller.ts`

**Missing Methods:**
```typescript
// Backend has these endpoints, frontend API doesn't expose them:
GET    /war-room/advisors           -> WarRoomApiService missing
GET    /war-room/advisors/:id       -> WarRoomApiService missing
POST   /war-room/advisors           -> WarRoomApiService missing
DELETE /war-room/advisors/:id       -> WarRoomApiService missing

GET    /war-room/experts            -> WarRoomApiService missing
GET    /war-room/experts/:id        -> WarRoomApiService missing
POST   /war-room/experts            -> WarRoomApiService missing
DELETE /war-room/experts/:id        -> WarRoomApiService missing

GET    /war-room/:caseId/strategy   -> WarRoomApiService missing
PUT    /war-room/:caseId/strategy   -> WarRoomApiService missing
```

**Current Frontend API:**
- Only has generic WarRoom CRUD methods
- Missing specific advisor/expert management
- Missing strategy management

### 2.2 Tasks API - Missing Methods
**Backend Controller:** `backend/src/tasks/tasks.controller.ts`

**Missing Methods:**
```typescript
GET  /tasks/stats                   -> TasksApiService missing
POST /tasks/bulk-update             -> TasksApiService missing
```

**Frontend Has:** Basic CRUD + `updateStatus()`
**Backend Has:** Statistics endpoint and bulk update capability

### 2.3 Risks API - Missing Heatmap Endpoint
**Backend Controller:** `backend/src/risks/risks.controller.ts`

**Missing Methods:**
```typescript
GET /risks/heatmap                  -> RisksApiService.getRiskMatrix() exists but different
```

**Frontend Has:** `getRiskMatrix()` method
**Backend Has:** `getHeatmap()` endpoint (different naming)

---

## 3. Type Misalignments

### 3.1 Task Entity
**Location:** `backend/src/tasks/entities/task.entity.ts` vs `frontend/services/api/tasks-api.ts`

| Field | Backend Type | Frontend Type | Status |
|-------|-------------|---------------|---------|
| `status` | `enum TaskStatus { TODO, IN_PROGRESS, COMPLETED, CANCELLED }` | `'pending' \| 'in_progress' \| 'completed' \| 'cancelled' \| 'blocked'` | ❌ MISMATCH |
| `priority` | `enum TaskPriority { LOW, MEDIUM, HIGH, URGENT }` | `'low' \| 'medium' \| 'high' \| 'urgent'` | ✅ ALIGNED |
| `parentTaskId` | `string?` (nullable UUID) | ❌ **MISSING** | ❌ MISSING |
| `tags` | `string[]` | `string[]?` | ✅ ALIGNED |
| `estimatedHours` | `decimal(10,2)?` | `number?` | ✅ ALIGNED |
| `actualHours` | `decimal(10,2) default 0` | `number?` | ⚠️ MISSING DEFAULT |
| `completionPercentage` | `int default 0` | ❌ **MISSING** | ❌ MISSING |
| `createdBy` | `string?` (UUID) | ❌ **MISSING** | ❌ MISSING |
| `dependencies` | ❌ **MISSING** | `string[]?` | ⚠️ EXTRA FIELD |
| `assignedBy` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `matterId` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `completedAt` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |

**Critical Issues:**
- Status enum mismatch: Backend uses `TODO`, frontend uses `'pending'`
- Frontend has extra fields not in backend
- Backend has `parentTaskId`, `completionPercentage`, `createdBy` not in frontend

### 3.2 Risk Entity
**Location:** `backend/src/risks/entities/risk.entity.ts` vs `frontend/services/api/risks-api.ts`

| Field | Backend Type | Frontend Type | Status |
|-------|-------------|---------------|---------|
| `impact` | `enum RiskImpact` | ❌ **MISSING** (uses `severity`) | ❌ MISSING |
| `probability` | `enum RiskProbability` | ❌ **MISSING** (uses `likelihood`) | ❌ MISSING |
| `status` | `enum RiskStatus { OPEN, MITIGATED, ACCEPTED, CLOSED }` | `'identified' \| 'assessed' \| 'mitigating' \| 'monitored' \| 'closed'` | ❌ MISMATCH |
| `severity` | ❌ **MISSING** | `'low' \| 'medium' \| 'high' \| 'critical'` | ⚠️ EXTRA FIELD |
| `likelihood` | ❌ **MISSING** | `'rare' \| 'unlikely' \| 'possible' \| 'likely' \| 'certain'` | ⚠️ EXTRA FIELD |
| `category` | ❌ **MISSING** | `'legal' \| 'financial' \| 'reputational' \| ...` | ⚠️ EXTRA FIELD |
| `mitigationStrategy` | `string?` | `string?` (as `mitigationPlan`) | ⚠️ NAME MISMATCH |
| `riskScore` | `decimal(3,1)?` | ❌ **MISSING** | ❌ MISSING |
| `identifiedBy` | `string?` | `string?` | ✅ ALIGNED |
| `matterId` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `clientId` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `mitigationSteps` | ❌ **MISSING** | `array of objects` | ⚠️ EXTRA FIELD |
| `reviewDate` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |

**Critical Issues:**
- Backend uses `impact` + `probability`, frontend uses `severity` + `likelihood`
- Enum value mismatches in status field
- Frontend has extensive extra fields not in backend schema

### 3.3 CalendarEvent Entity
**Location:** `backend/src/calendar/entities/calendar-event.entity.ts` vs `frontend/types/misc.ts`

| Field | Backend Type | Frontend Type | Status |
|-------|-------------|---------------|---------|
| `eventType` | `enum CalendarEventType { HEARING, DEADLINE, MEETING, ... }` | ❌ **MISSING** | ❌ MISSING |
| `startDate` | `timestamp` | ❌ **MISSING** | ❌ MISSING |
| `endDate` | `timestamp` | ❌ **MISSING** | ❌ MISSING |
| `attendees` | `json array` | ❌ **MISSING** | ❌ MISSING |
| `reminder` | `string?` | ❌ **MISSING** | ❌ MISSING |
| `completed` | `boolean default false` | ❌ **MISSING** | ❌ MISSING |

**Frontend Has:** Only minimal `CalendarEventItem` in `types/misc.ts`
**Impact:** Cannot properly handle calendar operations

### 3.4 TrialExhibit Entity
**Location:** `backend/src/exhibits/entities/trial-exhibit.entity.ts`

| Field | Backend Type | Frontend Type | Status |
|-------|-------------|---------------|---------|
| `exhibitNumber` | `varchar(100)` | ❓ **UNKNOWN** (not in types) | ❌ MISSING |
| `exhibitType` | `enum ExhibitType { DOCUMENT, PHOTOGRAPH, VIDEO, ... }` | Partial in `types/evidence.ts` | ⚠️ MISALIGNED |
| `status` | `enum ExhibitStatus { PREPARED, MARKED, OFFERED, ADMITTED, ... }` | ❌ **MISSING** | ❌ MISSING |
| `offeredBy` | `string?` | ❌ **MISSING** | ❌ MISSING |
| `dateOffered` | `date?` | ❌ **MISSING** | ❌ MISSING |
| `dateAdmitted` | `date?` | ❌ **MISSING** | ❌ MISSING |
| `purposeOfExhibit` | `string?` | ❌ **MISSING** | ❌ MISSING |
| `batesNumber` | `string?` | ❌ **MISSING** | ❌ MISSING |
| `isStipulated` | `boolean default false` | ❌ **MISSING** | ❌ MISSING |
| `stipulatingParties` | `jsonb array` | ❌ **MISSING** | ❌ MISSING |

**Frontend Status:** `exhibits-api.ts` exists but types severely incomplete

### 3.5 Employee/StaffMember Mismatch
**Location:** `backend/src/hr/entities/employee.entity.ts` vs `frontend/services/api/hr-api.ts`

| Field | Backend Type | Frontend Type | Status |
|-------|-------------|---------------|---------|
| Entity Name | `Employee` | `StaffMember` | ⚠️ NAME MISMATCH |
| `role` | `enum EmployeeRole { PARTNER, SENIOR_ASSOCIATE, ASSOCIATE, ... }` | `'attorney' \| 'paralegal' \| 'legal_assistant' \| 'admin' \| ...` | ❌ MISMATCH |
| `status` | `enum EmployeeStatus { ACTIVE, INACTIVE, ON_LEAVE, TERMINATED }` | `'active' \| 'inactive' \| 'on_leave' \| 'terminated'` | ⚠️ CASE MISMATCH |
| `billingRate` | `decimal(10,2)?` | `billableRate?: number` | ⚠️ NAME MISMATCH |
| `targetBillableHours` | `int?` | ❌ **MISSING** | ❌ MISSING |
| `timeOffRequests` | `OneToMany relation` | ❌ **MISSING** | ❌ MISSING |
| `title` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `barNumber` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |
| `barStates` | ❌ **MISSING** | `string[]?` | ⚠️ EXTRA FIELD |
| `terminationDate` | ❌ **MISSING** | `string?` | ⚠️ EXTRA FIELD |

**Note:** Frontend `types/financial.ts` has `Employee` type that's better aligned with backend

### 3.6 TrialEvent vs Trial Mismatch
**Location:** `backend/src/trial/entities/` vs `frontend/services/api/trial-api.ts`

**Backend Has TWO Entities:**
1. `TrialEvent` entity (trial_events table)
2. `WitnessPrepSession` entity (witness_prep_sessions table)

**Frontend Has:**
- `Trial` interface (doesn't match any backend entity - backend doesn't have Trial entity)
- Generic event methods in `TrialApiService`

**Critical Issue:** Frontend assumes a `Trial` entity that doesn't exist in backend. Backend has `TrialEvent` and `WitnessPrepSession` but no `Trial` table.

---

## 4. Missing Backend Endpoints in Frontend API

### 4.1 Schema Management Module
**Backend:** `schema-management.controller.ts`
**Frontend:** `schema-management-api.ts` ✅ EXISTS

**Entities:** `Snapshot`, `Migration`
**Status:** API service exists, needs field verification

### 4.2 Versioning Module
**Backend:** `versioning.controller.ts`
**Frontend:** `versioning-api.ts` ✅ EXISTS

**Entity:** `DataVersion`
**Status:** API service exists, needs field verification

### 4.3 Sync Module
**Backend:** `sync.controller.ts`
**Frontend:** `sync-api.ts` ✅ EXISTS

**Entities:** `SyncQueue`, `SyncConflict`
**Status:** API service exists, needs conflict type verification

### 4.4 Monitoring Module - Duplicate Issue
**Backend:** `monitoring/entities/performance-metric.entity.ts`
**Frontend:** TWO locations:
- `services/api/monitoring-api.ts` (PerformanceMetric interface)
- `services/api/data-platform/monitoring-api.ts` (PerformanceMetric interface)

**Issue:** Duplicate type definitions for PerformanceMetric

### 4.5 AI-Ops Module
**Backend:** `ai-ops.controller.ts`
**Frontend:** `ai-ops-api.ts` ✅ EXISTS

**Entities:** `AIModel`, `VectorEmbedding` (in ai-dataops)
**Status:** API exists, entity alignment needs verification

### 4.6 Pipelines Module
**Backend:** `pipelines.controller.ts`
**Frontend:** `pipelines-api.ts` ✅ EXISTS

**Entity:** `Pipeline` (etl_pipelines table)
**Status:** API exists, type alignment needs verification

---

## 5. Modules with Good Alignment ✅

### Well-Aligned Modules (API + Types Match Backend):
- ✅ **Cases** - Full alignment
- ✅ **Documents** - Full alignment
- ✅ **Document Versions** - Full alignment
- ✅ **Docket** - Full alignment
- ✅ **Pleadings** - Full alignment
- ✅ **Evidence** - Full alignment (evidence items)
- ✅ **Billing** (Time Entries, Invoices, Trust Accounts, Fee Agreements) - Full alignment
- ✅ **Compliance** - Full alignment
- ✅ **Users** - Full alignment
- ✅ **Auth** - Full alignment
- ✅ **Clients** - Full alignment
- ✅ **Matters** - Full alignment
- ✅ **Motions** - Full alignment
- ✅ **Parties** - Full alignment
- ✅ **Organizations** - Full alignment
- ✅ **Communications** - Full alignment
- ✅ **OCR** - Full alignment
- ✅ **Workflow Templates** - Full alignment
- ✅ **Citations** - Full alignment
- ✅ **Clauses** - Full alignment
- ✅ **Discovery** (ESI Sources, Legal Holds, Productions, Depositions, etc.) - Full alignment
- ✅ **Reports** - Full alignment
- ✅ **Analytics** - Full alignment
- ✅ **Webhooks** - Full alignment
- ✅ **Integrations** - Full alignment
- ✅ **Bluebook** - Full alignment

---

## 6. Priority Recommendations

### HIGH PRIORITY (Data Loss Risk / Broken Features)

1. **Fix War Room Module**
   - Add `Advisor`, `Expert`, `CaseStrategy` types to frontend
   - Add dedicated API methods in `WarRoomApiService`:
     ```typescript
     getAdvisors(caseId?: string): Promise<Advisor[]>
     getAdvisor(id: string): Promise<Advisor>
     createAdvisor(data: CreateAdvisorDto): Promise<Advisor>
     deleteAdvisor(id: string): Promise<void>
     
     getExperts(caseId?: string): Promise<Expert[]>
     getExpert(id: string): Promise<Expert>
     createExpert(data: CreateExpertDto): Promise<Expert>
     deleteExpert(id: string): Promise<void>
     
     getStrategy(caseId: string): Promise<CaseStrategy>
     updateStrategy(caseId: string, data: UpdateStrategyDto): Promise<CaseStrategy>
     ```

2. **Fix Task Entity Misalignment**
   - Align status enums: `TODO` vs `pending`
   - Add missing backend fields to frontend: `parentTaskId`, `completionPercentage`, `createdBy`
   - Remove or deprecate frontend-only fields: `dependencies`, `assignedBy`, `matterId`, `completedAt`
   - Add missing API methods: `getStats()`, `bulkUpdate()`

3. **Fix Risk Entity Misalignment**
   - Critical decision needed: Use backend's `impact`/`probability` OR frontend's `severity`/`likelihood`
   - Align status enums
   - Add missing `riskScore` to frontend OR remove from backend
   - Decide on frontend-only fields: keep or remove

4. **Fix Trial Module Architecture**
   - Decision needed: Should backend add `Trial` entity OR should frontend use `TrialEvent`?
   - Current state is confusing - frontend assumes entity that doesn't exist

5. **Fix CalendarEvent Types**
   - Add complete CalendarEvent type to frontend
   - Replace minimal `CalendarEventItem` with full entity

### MEDIUM PRIORITY (Feature Gaps)

6. **Complete TrialExhibit Types**
   - Add all exhibit management fields to frontend
   - Ensure exhibit lifecycle tracking works

7. **Unify Employee/StaffMember**
   - Choose one name: `Employee` (backend) or `StaffMember` (frontend)
   - Align role enums
   - Decide on extra frontend fields

8. **Add Missing API Endpoints**
   - Task statistics
   - Risk heatmap (unify with getRiskMatrix)
   - Bulk operations where available

### LOW PRIORITY (Nice to Have)

9. **Clean Up Duplicate Types**
   - Remove duplicate `PerformanceMetric` definitions
   - Consolidate monitoring types

10. **Verify Data Platform Modules**
    - Schema Management field alignment
    - Versioning field alignment
    - Sync conflict handling

---

## 7. Breaking Changes Needed

### API Contract Changes:
1. **War Room API**: Add 6+ new endpoints for advisors/experts/strategy
2. **Tasks API**: Change status enum values OR add enum mapping layer
3. **Risks API**: Rename fields (`impact`/`probability` vs `severity`/`likelihood`)
4. **Trial API**: Either add Trial entity to backend OR refactor frontend to use TrialEvent

### Type System Changes:
1. Add 3 new entity types to frontend (Advisor, Expert, CaseStrategy)
2. Update Task type with 4 missing fields
3. Rewrite Risk type to match backend
4. Add complete CalendarEvent type
5. Add complete TrialExhibit type

---

## 8. Testing Checklist

After implementing fixes, verify:

- [ ] War Room: Can create/list/delete advisors via API
- [ ] War Room: Can create/list/delete experts via API
- [ ] War Room: Can get/update case strategy via API
- [ ] Tasks: Status enum values correctly map backend ↔ frontend
- [ ] Tasks: Bulk update operations work
- [ ] Tasks: Task statistics endpoint accessible
- [ ] Risks: Impact/probability OR severity/likelihood correctly handled
- [ ] Risks: Risk heatmap data loads correctly
- [ ] Trial: Events and witness prep sessions work correctly
- [ ] CalendarEvent: Full CRUD operations work
- [ ] TrialExhibit: Exhibit lifecycle tracking works
- [ ] Employee: HR operations use consistent entity name

---

## 9. Migration Strategy

### Phase 1: Critical Fixes (Week 1)
- War Room entity types and API methods
- Task entity field alignment
- Risk entity decision and implementation

### Phase 2: Feature Completion (Week 2)
- CalendarEvent complete types
- TrialExhibit complete types
- Employee/StaffMember unification

### Phase 3: Polish (Week 3)
- Remove duplicate types
- Add missing convenience methods
- Update documentation

---

## Appendix A: Full Entity Comparison Matrix

| Backend Entity | Frontend Type | API Service | Alignment Status |
|---------------|---------------|-------------|------------------|
| Advisor | ❌ Missing | ⚠️ Partial | ❌ Major Gap |
| Expert | ❌ Missing | ⚠️ Partial | ❌ Major Gap |
| CaseStrategy | ❌ Missing | ⚠️ Partial | ❌ Major Gap |
| Task | ✅ Exists | ✅ Exists | ⚠️ Field Mismatches |
| Risk | ✅ Exists | ✅ Exists | ❌ Major Mismatches |
| TrialEvent | ⚠️ Different | ✅ Exists | ⚠️ Architecture Mismatch |
| WitnessPrepSession | ⚠️ Generic | ✅ Exists | ⚠️ Incomplete |
| CalendarEvent | ⚠️ Minimal | ✅ Exists | ⚠️ Incomplete |
| TrialExhibit | ⚠️ Minimal | ✅ Exists | ⚠️ Incomplete |
| Employee | ⚠️ StaffMember | ✅ Exists | ⚠️ Name + Field Mismatch |
| KnowledgeArticle | ✅ Exists | ✅ Exists | ✅ Good Alignment |
| Jurisdiction | ✅ Exists | ✅ Exists | ✅ Good Alignment |
| PerformanceMetric | ✅ Exists (2x) | ✅ Exists (2x) | ⚠️ Duplicate Definitions |
| DataVersion | ❓ Needs Check | ✅ Exists | ⏳ To Be Verified |
| SyncConflict | ❓ Needs Check | ✅ Exists | ⏳ To Be Verified |
| Pipeline | ❓ Needs Check | ✅ Exists | ⏳ To Be Verified |

---

## Appendix B: Controller Endpoint Coverage

### War Room Controller Endpoints:
```
GET    /war-room/advisors              ❌ Not in Frontend API
GET    /war-room/advisors/:id          ❌ Not in Frontend API
POST   /war-room/advisors              ❌ Not in Frontend API
DELETE /war-room/advisors/:id          ❌ Not in Frontend API
GET    /war-room/experts               ❌ Not in Frontend API
GET    /war-room/experts/:id           ❌ Not in Frontend API
POST   /war-room/experts               ❌ Not in Frontend API
DELETE /war-room/experts/:id           ❌ Not in Frontend API
GET    /war-room/:caseId               ✅ Covered
GET    /war-room/:caseId/strategy      ❌ Not in Frontend API
PUT    /war-room/:caseId/strategy      ❌ Not in Frontend API
```

### Tasks Controller Endpoints:
```
GET    /tasks                          ✅ Covered
GET    /tasks/stats                    ❌ Not in Frontend API
GET    /tasks/:id                      ✅ Covered
POST   /tasks                          ✅ Covered
POST   /tasks/bulk-update              ❌ Not in Frontend API
PUT    /tasks/:id                      ✅ Covered
DELETE /tasks/:id                      ✅ Covered
```

### Risks Controller Endpoints:
```
GET    /risks                          ✅ Covered
GET    /risks/heatmap                  ⚠️ Different name (getRiskMatrix)
GET    /risks/:id                      ✅ Covered
POST   /risks                          ✅ Covered
PUT    /risks/:id                      ✅ Covered
DELETE /risks/:id                      ✅ Covered
```

### Trial Controller Endpoints:
```
GET    /trial                          ❓ Health check
GET    /trial/events                   ✅ Covered
POST   /trial/events                   ✅ Covered
PUT    /trial/events/:id               ✅ Covered
DELETE /trial/events/:id               ✅ Covered
GET    /trial/witness-prep             ✅ Covered
POST   /trial/witness-prep             ✅ Covered
```

---

**End of Report**
