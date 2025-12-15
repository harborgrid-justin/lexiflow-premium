# Backend-Frontend API Gap Analysis

**Date:** December 15, 2025  
**Analysis Scope:** Complete backend Swagger endpoints vs. Frontend API services

## Executive Summary

This document identifies critical gaps between the NestJS backend API endpoints and the React frontend API integration layer. The backend has **234+ endpoints** across 28+ domains, while the frontend currently implements only ~15% of these integrations.

## 🔴 Critical Gaps Identified

### 1. **Missing Frontend Services** (High Priority)

#### Billing Domain (Major Gap)
Backend has 71 billing endpoints, frontend has partial coverage:
- ❌ **Trust Accounts** - 11 endpoints, NO frontend service
- ❌ **Billing Analytics** - 4 endpoints (WIP stats, realization, AR aging), NO frontend integration
- ✅ Rate Tables - 8 endpoints, frontend implemented
- ✅ Fee Agreements - 11 endpoints, frontend implemented
- ⚠️ Time Entries - Missing advanced endpoints (approve, bill, bulk operations)
- ⚠️ Expenses - Missing advanced endpoints (approve, bill, reimburse)
- ⚠️ Invoices - Missing PDF generation and payment recording endpoints

#### Admin & Operations
- ❌ **Webhooks** - 6 endpoints, frontend has service but not integrated into UI
- ❌ **API Keys** - 6 endpoints, frontend has service but not integrated into UI
- ❌ **Processing Jobs** - 5 endpoints (monitoring OCR/background jobs), NO frontend integration
- ❌ **Reports** - 17 endpoints (templates, scheduling, export), NO frontend service

#### Discovery Domain
- ⚠️ Legal Holds - 8 endpoints, partial frontend (basic CRUD)
- ⚠️ Depositions - 9 endpoints, partial frontend
- ⚠️ Discovery Requests - 9 endpoints, partial frontend
- ⚠️ ESI Sources - 7 endpoints, NO frontend
- ⚠️ Privilege Log - 7 endpoints, NO frontend
- ⚠️ Productions - 7 endpoints, NO frontend
- ⚠️ Custodian Interviews - 7 endpoints, NO frontend

#### Compliance & Security
- ⚠️ Ethical Walls - 6 endpoints, NO frontend
- ⚠️ Conflict Checks - 7 endpoints, NO frontend
- ⚠️ Audit Logs - 6 endpoints, NO frontend
- ⚠️ Permissions - 5 endpoints, NO frontend
- ⚠️ RLS Policies - 6 endpoints, NO frontend

#### Communications
- ⚠️ Notifications - 6 endpoints, frontend has service but missing features
- ⚠️ Messaging - 9 endpoints, NO frontend
- ⚠️ Correspondence - 9 endpoints, NO frontend
- ⚠️ Service Jobs - 9 endpoints, NO frontend

#### Analytics
- ❌ Dashboard - 5 endpoints, NO frontend service
- ❌ Billing Analytics - 7 endpoints, NO frontend
- ❌ Case Analytics - 5 endpoints, NO frontend
- ❌ Discovery Analytics - 4 endpoints, NO frontend
- ❌ Judge Stats - 5 endpoints, NO frontend
- ❌ Outcome Predictions - 4 endpoints, NO frontend

#### Documents & Pleadings
- ⚠️ Document Versions - 6 endpoints, NO frontend integration
- ⚠️ Clauses - 8 endpoints, NO frontend
- ⚠️ Pleadings - 7 endpoints, NO frontend

#### Case Management
- ⚠️ Case Phases - 5 endpoints, NO frontend
- ⚠️ Case Teams - 5 endpoints, NO frontend
- ⚠️ Motions - 6 endpoints, NO frontend
- ⚠️ Parties - 5 endpoints, NO frontend

#### Integrations
- ⚠️ External API (PACER, Calendar) - 6 endpoints, NO frontend
- ⚠️ Data Sources - 2 endpoints, NO frontend

### 2. **Path Mismatches** (Critical)

| Frontend Call | Backend Actual | Status |
|--------------|----------------|--------|
| `/billing/time-entries` | `/api/v1/billing/time-entries` | ✅ Should work |
| `/billing/rate-tables` | `/api/v1/billing/rates` | ❌ **MISMATCH** |
| `/billing/fee-agreements` | `/api/v1/billing/fee-agreements` | ✅ Should work |
| `/discovery/custodians` | `/api/v1/discovery/custodians` | ✅ Should work |
| `/discovery/examinations` | `/api/v1/discovery/examinations` | ✅ Should work |
| `/admin/webhooks` | `/api/v1/webhooks` | ❌ **MISMATCH** |
| `/admin/api-keys` | `/api/v1/admin/api-keys` | ✅ Should work |
| `/auth/*` | `/api/v1/auth/*` | ✅ Should work |
| `/cases/*` | `/api/v1/cases/*` | ✅ Should work |

### 3. **Missing HTTP Methods**

#### Cases
- Frontend: GET, POST, PATCH, DELETE
- Backend additional: POST `/cases/:id/archive`
- **Missing:** Archive functionality in frontend

#### Auth
- Frontend: login, register, logout, profile, refresh
- Backend additional: 
  - POST `/auth/forgot-password`
  - POST `/auth/reset-password`
  - POST `/auth/change-password`
  - POST `/auth/verify-mfa`
  - POST `/auth/enable-mfa`
  - POST `/auth/disable-mfa`
- **Missing:** Password reset flow, MFA support

#### Documents
- Frontend: upload, get, update, delete
- Backend additional:
  - GET `/documents/:id/download`
  - GET `/documents/:id/preview`
  - POST `/documents/:id/redact`
  - POST `/documents/bulk-upload`
  - GET `/documents/:documentId/versions`
  - POST `/documents/:documentId/versions/:versionId/restore`
- **Missing:** Download, preview, redaction, versioning

#### Billing
- Frontend: Basic CRUD for time entries
- Backend additional:
  - PUT `/billing/time-entries/:id/approve`
  - PUT `/billing/time-entries/:id/bill`
  - POST `/billing/time-entries/bulk`
  - GET `/billing/time-entries/case/:caseId/totals`
- **Missing:** Approval workflow, billing status, bulk operations

### 4. **Response Schema Mismatches**

Many backend endpoints return paginated responses:
```typescript
{
  data: T[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

Frontend services expect this but don't always handle pagination parameters in requests:
- Missing: `page`, `limit`, `sortBy`, `order` query params
- Frontend assumes `.data` property exists but doesn't verify

## 📋 Detailed Backend Endpoint Inventory

### Authentication & Users (16 endpoints)
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`
- GET `/api/v1/auth/profile`
- PUT `/api/v1/auth/profile`
- POST `/api/v1/auth/forgot-password`
- POST `/api/v1/auth/reset-password`
- POST `/api/v1/auth/change-password`
- POST `/api/v1/auth/verify-mfa`
- POST `/api/v1/auth/enable-mfa`
- POST `/api/v1/auth/disable-mfa`
- GET `/api/v1/users`
- GET `/api/v1/users/:id`
- PUT `/api/v1/users/:id`
- DELETE `/api/v1/users/:id`

### Cases (7 endpoints)
- GET `/api/v1/cases`
- GET `/api/v1/cases/:id`
- POST `/api/v1/cases`
- PUT `/api/v1/cases/:id`
- DELETE `/api/v1/cases/:id`
- POST `/api/v1/cases/:id/archive`

### Documents (15 endpoints)
- GET `/api/v1/documents`
- GET `/api/v1/documents/:id`
- POST `/api/v1/documents`
- PUT `/api/v1/documents/:id`
- DELETE `/api/v1/documents/:id`
- POST `/api/v1/documents/upload`
- POST `/api/v1/documents/bulk-upload`
- GET `/api/v1/documents/:id/download`
- GET `/api/v1/documents/:id/preview`
- POST `/api/v1/documents/:id/redact`
- GET `/api/v1/documents/:documentId/versions`
- GET `/api/v1/documents/:documentId/versions/:versionId`
- POST `/api/v1/documents/:documentId/versions/:versionId/restore`
- GET `/api/v1/documents/:documentId/versions/:versionId/compare`
- POST `/api/v1/documents/:documentId/versions/:versionId/revert`

### Billing (71 endpoints total)

#### Time Entries (13)
- GET `/api/v1/billing/time-entries`
- GET `/api/v1/billing/time-entries/:id`
- POST `/api/v1/billing/time-entries`
- POST `/api/v1/billing/time-entries/bulk`
- PUT `/api/v1/billing/time-entries/:id`
- DELETE `/api/v1/billing/time-entries/:id`
- PUT `/api/v1/billing/time-entries/:id/approve`
- PUT `/api/v1/billing/time-entries/:id/bill`
- GET `/api/v1/billing/time-entries/case/:caseId`
- GET `/api/v1/billing/time-entries/case/:caseId/unbilled`
- GET `/api/v1/billing/time-entries/case/:caseId/totals`
- GET `/api/v1/billing/time-entries/user/:userId`

#### Invoices (9)
- GET `/api/v1/billing/invoices`
- GET `/api/v1/billing/invoices/:id`
- GET `/api/v1/billing/invoices/:id/pdf`
- GET `/api/v1/billing/invoices/overdue`
- POST `/api/v1/billing/invoices`
- PUT `/api/v1/billing/invoices/:id`
- POST `/api/v1/billing/invoices/:id/send`
- POST `/api/v1/billing/invoices/:id/record-payment`
- DELETE `/api/v1/billing/invoices/:id`

#### Expenses (11)
- GET `/api/v1/billing/expenses`
- GET `/api/v1/billing/expenses/:id`
- POST `/api/v1/billing/expenses`
- PUT `/api/v1/billing/expenses/:id`
- DELETE `/api/v1/billing/expenses/:id`
- PUT `/api/v1/billing/expenses/:id/approve`
- PUT `/api/v1/billing/expenses/:id/bill`
- PUT `/api/v1/billing/expenses/:id/reimburse`
- GET `/api/v1/billing/expenses/case/:caseId`
- GET `/api/v1/billing/expenses/case/:caseId/unbilled`
- GET `/api/v1/billing/expenses/case/:caseId/totals`

#### Trust Accounts (11)
- GET `/api/v1/billing/trust-accounts`
- GET `/api/v1/billing/trust-accounts/:id`
- GET `/api/v1/billing/trust-accounts/:id/balance`
- GET `/api/v1/billing/trust-accounts/:id/transactions`
- GET `/api/v1/billing/trust-accounts/low-balance`
- POST `/api/v1/billing/trust-accounts`
- PUT `/api/v1/billing/trust-accounts/:id`
- POST `/api/v1/billing/trust-accounts/:id/deposit`
- POST `/api/v1/billing/trust-accounts/:id/withdraw`
- POST `/api/v1/billing/trust-accounts/:id/transaction`
- DELETE `/api/v1/billing/trust-accounts/:id`

#### Rate Tables (8)
- GET `/api/v1/billing/rates`
- GET `/api/v1/billing/rates/:id`
- GET `/api/v1/billing/rates/active`
- GET `/api/v1/billing/rates/default/:firmId`
- GET `/api/v1/billing/rates/user-rate/:firmId/:userId`
- POST `/api/v1/billing/rates`
- PUT `/api/v1/billing/rates/:id`
- DELETE `/api/v1/billing/rates/:id`

#### Fee Agreements (11)
- GET `/api/v1/billing/fee-agreements`
- GET `/api/v1/billing/fee-agreements/:id`
- GET `/api/v1/billing/fee-agreements/case/:caseId`
- GET `/api/v1/billing/fee-agreements/client/:clientId`
- POST `/api/v1/billing/fee-agreements`
- PUT `/api/v1/billing/fee-agreements/:id`
- PUT `/api/v1/billing/fee-agreements/:id/activate`
- PUT `/api/v1/billing/fee-agreements/:id/suspend`
- PUT `/api/v1/billing/fee-agreements/:id/terminate`
- PUT `/api/v1/billing/fee-agreements/:id/sign`
- DELETE `/api/v1/billing/fee-agreements/:id`

#### Analytics (4)
- GET `/api/v1/billing/wip-stats`
- GET `/api/v1/billing/realization`
- GET `/api/v1/billing/operating-summary`
- GET `/api/v1/billing/ar-aging`

### Discovery (54 endpoints across 8 sub-domains)

#### Evidence (7)
- GET `/api/v1/discovery/evidence`
- GET `/api/v1/discovery/evidence/:id`
- POST `/api/v1/discovery/evidence`
- PUT `/api/v1/discovery/evidence/:id`
- DELETE `/api/v1/discovery/evidence/:id`

#### Custodians (7)
- GET `/api/v1/discovery/custodians`
- GET `/api/v1/discovery/custodians/:id`
- POST `/api/v1/discovery/custodians`
- PUT `/api/v1/discovery/custodians/:id`
- DELETE `/api/v1/discovery/custodians/:id`
- PUT `/api/v1/discovery/custodians/:id/hold`
- PUT `/api/v1/discovery/custodians/:id/release`

#### Legal Holds (8)
#### Depositions (9)
#### Discovery Requests (9)
#### ESI Sources (7)
#### Privilege Log (7)
#### Productions (7)
#### Custodian Interviews (7)
#### Examinations (7)

### Analytics (30 endpoints across 6 modules)
- Dashboard (5)
- Billing Analytics (7)
- Case Analytics (5)
- Discovery Analytics (4)
- Judge Stats (5)
- Outcome Predictions (4)

### Reports (17 endpoints)
- Templates management
- Report generation
- Scheduling
- Export formats

### Communications (33 endpoints)
- Notifications
- Messaging
- Correspondence
- Service Jobs

### Compliance (36 endpoints)
- Conflict Checks
- Ethical Walls
- Audit Logs
- Permissions
- RLS Policies
- Compliance Reports

## 🎯 Recommended Actions

### Phase 1: Critical Path Fixes (Immediate)
1. ✅ Fix rate tables endpoint mismatch (`/billing/rate-tables` → `/api/v1/billing/rates`)
2. ✅ Fix webhooks endpoint mismatch (`/admin/webhooks` → `/api/v1/webhooks`)
3. ✅ Add missing pagination params to all list endpoints
4. ✅ Add missing CRUD methods (archive case, approve time entries, etc.)

### Phase 2: High-Value Missing Services (Week 1)
1. ✅ Trust Accounts API service
2. ✅ Billing Analytics API service
3. ✅ Reports API service
4. ✅ Processing Jobs monitoring
5. ✅ Dashboard API service

### Phase 3: Complete Coverage (Week 2-3)
1. ✅ All Discovery sub-domains
2. ✅ All Compliance modules
3. ✅ All Analytics modules
4. ✅ All Communications modules
5. ✅ Document versioning
6. ✅ Case management extensions (phases, teams, motions, parties)

### Phase 4: Advanced Features (Week 4)
1. ✅ MFA support in auth
2. ✅ Password reset flow
3. ✅ Document redaction
4. ✅ Bulk operations
5. ✅ Advanced search integration

## 📊 Coverage Metrics

**Current State:**
- Backend Endpoints: 234+
- Frontend Services: ~35 endpoints implemented
- **Coverage: ~15%**

**After Phase 1:**
- Coverage: ~20%

**After Phase 2:**
- Coverage: ~50%

**After Phase 3:**
- Coverage: ~85%

**After Phase 4:**
- Coverage: ~95%

## 🔧 Implementation Notes

### Frontend Service Pattern
All new services should follow the established pattern:
```typescript
export class ExampleApiService {
  async getAll(filters?: Record<string, any>): Promise<T[]> {
    const response = await apiClient.get<PaginatedResponse<T>>('/endpoint', filters);
    return response.data;
  }
  
  async getById(id: string): Promise<T> {
    return apiClient.get<T>(`/endpoint/${id}`);
  }
  
  // CRUD methods...
}
```

### Add to apiServices export
```typescript
export const apiServices = {
  // existing...
  newService: new NewApiService(),
};
```

### Environment Variable
Check `VITE_USE_BACKEND_API` to toggle between IndexedDB and backend API.

## 🚨 Breaking Changes to Address

1. **Rate Tables Path:** Update all frontend code referencing `/billing/rate-tables` to use `/api/v1/billing/rates`
2. **Webhooks Path:** Update all frontend code referencing `/admin/webhooks` to use `/api/v1/webhooks`
3. **Pagination:** Add pagination support to all list views
4. **Response unwrapping:** Ensure all services extract `.data` from paginated responses

---

**Last Updated:** December 15, 2025  
**Next Review:** After Phase 1 completion
