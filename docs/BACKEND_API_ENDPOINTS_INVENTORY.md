# LexiFlow Backend API Endpoints - Complete Inventory

> **Generated:** December 15, 2025  
> **Purpose:** Comprehensive list of all available API endpoints for frontend integration gap analysis

---

## 🏠 Root & Health Endpoints

### AppController (`app.controller.ts`)
- `GET /` - API root endpoint (Public)
- `GET /health` - Health check endpoint (Public)
- `GET /version` - Get API version (Public)

### HealthController (`health/health.controller.ts`)
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/readiness` - Kubernetes readiness probe

### MetricsController (`metrics/metrics.controller.ts`)
- `GET /metrics` - Get Prometheus metrics (Public)
- `GET /metrics/json` - Get metrics as JSON (Public)
- `GET /metrics/system` - Get system metrics (Public)

---

## 🔐 Authentication & Users

### AuthController (`auth/auth.controller.ts`)
**Base Path:** `/api/v1/auth`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/register` | Register a new user account | Public |
| POST | `/login` | Login with email and password | Public |
| POST | `/refresh` | Refresh access token using refresh token | Public |
| POST | `/logout` | Logout and invalidate tokens | Required |
| GET | `/profile` | Get current user profile | Required |
| PUT | `/profile` | Update current user profile | Required |
| POST | `/change-password` | Change user password | Required |
| POST | `/forgot-password` | Request password reset email | Public |
| POST | `/reset-password` | Reset password using token | Public |
| POST | `/verify-mfa` | Verify MFA code during login | Public |

### UsersController (`users/users.controller.ts`)
**Base Path:** `/api/v1/users`

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| POST | `/` | Create a new user | USER_MANAGE |
| GET | `/` | List all users | USER_MANAGE |
| GET | `/:id` | Get user by ID | USER_MANAGE |
| PUT | `/:id` | Update user | USER_MANAGE |
| DELETE | `/:id` | Delete user | USER_MANAGE |

---

## ⚖️ Case Management

### CasesController (`cases/cases.controller.ts`)
**Base Path:** `/api/v1/cases`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all cases with filtering |
| GET | `/:id` | Get case by ID |
| POST | `/` | Create a new case |
| PUT | `/:id` | Update a case |
| DELETE | `/:id` | Delete a case |
| POST | `/:id/archive` | Archive a case |

### CasePhasesController (`case-phases/case-phases.controller.ts`)
**Base Path:** `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/phases` | Get all phases for a case |
| POST | `/cases/:caseId/phases` | Create a new phase for case |
| GET | `/case-phases/:id` | Get phase by ID |
| PUT | `/case-phases/:id` | Update phase |
| DELETE | `/case-phases/:id` | Delete phase |

### CaseTeamsController (`case-teams/case-teams.controller.ts`)
**Base Path:** `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/team` | Get all team members for a case |
| POST | `/cases/:caseId/team` | Add team member to case |
| PUT | `/case-teams/:id` | Update team member |
| DELETE | `/case-teams/:id` | Remove team member |

### PartiesController (`parties/parties.controller.ts`)
**Base Path:** `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/parties` | Get all parties for a case |
| POST | `/cases/:caseId/parties` | Add party to case |
| PUT | `/parties/:id` | Update party |
| DELETE | `/parties/:id` | Delete party |

### MotionsController (`motions/motions.controller.ts`)
**Base Path:** `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/motions` | Get all motions for a case |
| POST | `/cases/:caseId/motions` | Create motion for case |
| PUT | `/motions/:id` | Update motion |
| DELETE | `/motions/:id` | Delete motion |

---

## 📄 Documents & Versions

### DocumentsController (`documents/documents.controller.ts`)
**Base Path:** `/api/v1/documents`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Upload a new document (multipart/form-data) |
| GET | `/` | List all documents with filtering |
| GET | `/:id` | Get document metadata by ID |
| GET | `/:id/download` | Download document file |
| PUT | `/:id` | Update document metadata |
| DELETE | `/:id` | Delete a document |
| POST | `/:id/ocr` | Trigger OCR processing for document |
| POST | `/:id/redact` | Create redaction job for document |

### DocumentVersionsController (`document-versions/document-versions.controller.ts`)
**Base Path:** `/api/v1/documents/:documentId/versions`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a new version (multipart/form-data) |
| GET | `/` | Get version history |
| GET | `/:version` | Get specific version |
| GET | `/:version/download` | Download specific version |
| GET | `/compare` | Compare two versions (query params: v1, v2) |
| POST | `/:version/restore` | Restore specific version |

---

## 📝 Pleadings & Clauses

### PleadingsController (`pleadings/pleadings.controller.ts`)
**Base Path:** `/api/v1/pleadings`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a new pleading |
| GET | `/` | List all pleadings (filter by caseId, status) |
| GET | `/upcoming-hearings` | Get upcoming hearings |
| GET | `/:id` | Get pleading by ID |
| PUT | `/:id` | Update pleading |
| DELETE | `/:id` | Delete pleading |
| POST | `/:id/file` | File a pleading |

### ClausesController (`clauses/clauses.controller.ts`)
**Base Path:** `/api/v1/clauses`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a new clause |
| GET | `/` | List all clauses (filter by category, search, tag, isActive) |
| GET | `/most-used` | Get most used clauses |
| GET | `/:id` | Get clause by ID |
| PUT | `/:id` | Update clause |
| DELETE | `/:id` | Delete clause |
| POST | `/:id/increment-usage` | Increment usage count |

---

## 📋 Docket Management

### DocketController (`docket/docket.controller.ts`)
**Base Path:** `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/docket` | List all docket entries (filter by caseId) |
| GET | `/docket/:id` | Get docket entry by ID |
| POST | `/docket` | Create docket entry |
| PUT | `/docket/:id` | Update docket entry |
| DELETE | `/docket/:id` | Delete docket entry |
| GET | `/cases/:caseId/docket` | Get all docket entries for case |
| POST | `/cases/:caseId/docket` | Create docket entry for case |
| POST | `/pacer/sync` | Sync docket from PACER |

---

## 💰 Billing System

### BillingController (`billing/billing.controller.ts`)
**Base Path:** `/billing`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/invoices` | Get all invoices |
| GET | `/invoices/:id` | Get invoice by ID |
| POST | `/invoices` | Create invoice |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |
| POST | `/invoices/:id/send` | Send invoice |
| POST | `/invoices/:id/mark-paid` | Mark invoice as paid |
| GET | `/time-entries` | Get all time entries |
| GET | `/time-entries/case/:caseId` | Get time entries by case |
| POST | `/time-entries` | Create time entry |
| PUT | `/time-entries/:id` | Update time entry |
| DELETE | `/time-entries/:id` | Delete time entry |
| GET | `/time-entries/unbilled/:caseId` | Get unbilled time entries |
| GET | `/expenses` | Get all expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/unbilled/:caseId` | Get unbilled expenses |
| POST | `/generate-invoice` | Generate invoice from unbilled items |
| GET | `/summary/:caseId` | Get billing summary for case |

### TimeEntriesController (`billing/time-entries/time-entries.controller.ts`)
**Base Path:** `/api/v1/billing/time-entries`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create time entry |
| POST | `/bulk` | Bulk create time entries |
| GET | `/` | List all time entries with filters |
| GET | `/case/:caseId` | Get time entries by case |
| GET | `/case/:caseId/unbilled` | Get unbilled entries by case |
| GET | `/case/:caseId/totals` | Get totals by case |
| GET | `/user/:userId` | Get time entries by user |
| GET | `/:id` | Get time entry by ID |
| PUT | `/:id` | Update time entry |
| PUT | `/:id/approve` | Approve time entry |
| PUT | `/:id/bill` | Bill time entry to invoice |
| DELETE | `/:id` | Delete time entry |

### InvoicesController (`billing/invoices/invoices.controller.ts`)
**Base Path:** `/api/v1/billing/invoices`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create invoice |
| GET | `/` | List all invoices with filters |
| GET | `/overdue` | Get overdue invoices |
| GET | `/:id` | Get invoice by ID with items |
| GET | `/:id/pdf` | Generate invoice PDF |
| PUT | `/:id` | Update invoice |
| POST | `/:id/send` | Send invoice to client |
| POST | `/:id/record-payment` | Record payment |
| DELETE | `/:id` | Delete invoice |

### ExpensesController (`billing/expenses/expenses.controller.ts`)
**Base Path:** `/api/v1/billing/expenses`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create expense |
| GET | `/` | List all expenses with filters |
| GET | `/case/:caseId` | Get expenses by case |
| GET | `/case/:caseId/unbilled` | Get unbilled expenses by case |
| GET | `/case/:caseId/totals` | Get expense totals by case |
| GET | `/:id` | Get expense by ID |
| PUT | `/:id` | Update expense |
| PUT | `/:id/approve` | Approve expense |
| PUT | `/:id/bill` | Bill expense to invoice |
| PUT | `/:id/reimburse` | Mark expense as reimbursed |
| DELETE | `/:id` | Delete expense |

### TrustAccountsController (`billing/trust-accounts/trust-accounts.controller.ts`)
**Base Path:** `/api/v1/billing/trust-accounts`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create trust account |
| GET | `/` | List trust accounts (filter by clientId, status) |
| GET | `/low-balance` | Get low balance accounts |
| GET | `/:id` | Get trust account by ID |
| GET | `/:id/balance` | Get current balance |
| GET | `/:id/transactions` | Get transaction history |
| POST | `/:id/deposit` | Make deposit |
| POST | `/:id/withdraw` | Make withdrawal |
| POST | `/:id/transaction` | Create transaction |
| PUT | `/:id` | Update trust account |
| DELETE | `/:id` | Delete trust account |

### RateTablesController (`billing/rate-tables/rate-tables.controller.ts`)
**Base Path:** `/api/v1/billing/rates`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create rate table |
| GET | `/` | List rate tables (filter by firmId) |
| GET | `/active` | Get active rate tables |
| GET | `/default/:firmId` | Get default rate table |
| GET | `/:id` | Get rate table by ID |
| GET | `/user-rate/:firmId/:userId` | Get rate for user |
| PUT | `/:id` | Update rate table |
| DELETE | `/:id` | Delete rate table |

### FeeAgreementsController (`billing/fee-agreements/fee-agreements.controller.ts`)
**Base Path:** `/api/v1/billing/fee-agreements`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create fee agreement |
| GET | `/` | List fee agreements (filter by clientId, caseId, status) |
| GET | `/case/:caseId` | Get fee agreement by case |
| GET | `/client/:clientId` | Get fee agreements by client |
| GET | `/:id` | Get fee agreement by ID |
| PUT | `/:id` | Update fee agreement |
| PUT | `/:id/activate` | Activate fee agreement |
| PUT | `/:id/suspend` | Suspend fee agreement |
| PUT | `/:id/terminate` | Terminate fee agreement |
| PUT | `/:id/sign` | Sign fee agreement |
| DELETE | `/:id` | Delete fee agreement |

### BillingAnalyticsController (`billing/analytics/billing-analytics.controller.ts`)
**Base Path:** `/api/v1/billing`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wip-stats` | Get work-in-progress statistics |
| GET | `/realization` | Get realization rates |
| GET | `/operating-summary` | Get operating summary |
| GET | `/ar-aging` | Get accounts receivable aging |

---

## 🔍 Discovery & Production

### DiscoveryController (`discovery/discovery.controller.ts`)
**Base Path:** `/discovery`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all discovery requests |
| GET | `/:id` | Get discovery request by ID |
| POST | `/` | Create discovery request |

### ProductionController (`production/production.controller.ts`)
**Base Path:** `/production`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create production |
| GET | `/` | List all productions |
| GET | `/case/:caseId` | Get productions by case |
| GET | `/status/:status` | Get productions by status |
| GET | `/:id` | Get production by ID |
| PATCH | `/:id` | Update production |
| PATCH | `/:id/status` | Update production status |
| DELETE | `/:id` | Delete production |
| GET | `/case/:caseId/statistics` | Get production statistics |

---

## 📊 Reports & Analytics

### ReportsController (`reports/reports.controller.ts`)
**Base Path:** `/api/v1/reports`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | Get available report templates |
| GET | `/` | Get list of generated reports |
| GET | `/by-type/:type` | Get reports by type |
| GET | `/templates/:id` | Get template by ID |
| POST | `/templates` | Create report template |
| POST | `/schedule` | Schedule recurring report |
| GET | `/scheduled/:userId` | Get scheduled reports for user |
| DELETE | `/scheduled/:id` | Cancel scheduled report |
| GET | `/:id/status` | Get report generation status |
| POST | `/:id/export` | Export report in different format |
| GET | `/list` | Get reports list (legacy) |
| GET | `/:id` | Get specific report by ID |
| POST | `/generate` | Generate a new report |
| POST | `/generateReport` | Generate report (alias) |
| GET | `/:id/download` | Get download URL for report |
| GET | `/:id/getDownloadUrl` | Get download URL (alias) |
| DELETE | `/:id` | Delete report |

---

## 📂 Projects

### ProjectsController (`projects/projects.controller.ts`)
**Base Path:** `/api/v1/projects`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all projects with filters |
| GET | `/:id` | Get project by ID |
| POST | `/` | Create project |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |

---

## ⚙️ Processing Jobs

### ProcessingJobsController (`processing-jobs/processing-jobs.controller.ts`)
**Base Path:** `/api/v1/processing-jobs`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all jobs (filter by documentId, type, status) |
| GET | `/statistics` | Get job statistics |
| GET | `/:id` | Get job by ID |
| GET | `/:id/status` | Get detailed job status |
| POST | `/:id/cancel` | Cancel processing job |

---

## ✅ Compliance

### ComplianceController (`compliance/compliance.controller.ts`)
**Base Path:** `/compliance`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/checks` | Run compliance check |
| GET | `/checks/:caseId` | Get checks by case ID |
| GET | `/checks/detail/:id` | Get check by ID |
| GET | `/audit-logs/:id` | Get audit logs by entity ID |
| POST | `/reports/generate` | Generate compliance report |
| POST | `/audit-logs/export` | Export audit logs |
| GET | `/` | List all compliance items |
| GET | `/:id` | Get compliance item by ID |
| POST | `/` | Create compliance item |

---

## 📞 Communications

### CommunicationsController (`communications/communications.controller.ts`)
**Base Path:** `/communications`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all communications |
| GET | `/:id` | Get communication by ID |
| POST | `/` | Create communication |

---

## 🔗 Integrations

### ExternalApiController (`integrations/external-api/external-api.controller.ts`)
**Base Path:** `/api/v1/integrations`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/pacer/search` | Search PACER for cases |
| POST | `/pacer/sync` | Sync case data from PACER |
| POST | `/calendar/events` | Create calendar event |
| POST | `/calendar/sync` | Sync calendar events |
| GET | `/calendar/upcoming` | Get upcoming calendar events |
| GET | `/status` | Get status of all integrations |

### DataSourcesController (`integrations/data-sources/data-sources.controller.ts`)
**Base Path:** `/integrations/data-sources`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List data source connections |
| POST | `/test` | Test data source connection |

---

## 🔍 Search

### SearchController (`search/search.controller.ts`)
**Base Path:** `/api/v1/search`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Global search across all entities |
| GET | `/cases` | Search cases only |
| GET | `/documents` | Search documents only |
| GET | `/clients` | Search clients only |
| GET | `/suggestions` | Get search suggestions/autocomplete |
| POST | `/reindex` | Reindex search data (admin only) |

---

## 🪝 Webhooks

### WebhooksController (`webhooks/webhooks.controller.ts`)
**Base Path:** `/api/v1/webhooks`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Register new webhook |
| GET | `/` | List all webhooks |
| GET | `/:id` | Get webhook by ID |
| PUT | `/:id` | Update webhook |
| DELETE | `/:id` | Delete webhook |
| POST | `/:id/test` | Test webhook |

---

## 🔑 API Keys

### ApiKeysController (`api-keys/api-keys.controller.ts`)
**Base Path:** `/api/v1/admin/api-keys`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create new API key (Admin only) |
| GET | `/` | List all API keys (Admin only) |
| GET | `/:id` | Get API key details (Admin only) |
| DELETE | `/:id` | Revoke API key (Admin only) |
| GET | `/:id/usage` | Get API key usage statistics (Admin only) |

---

## 📈 Summary Statistics

### Total Endpoints by Domain

| Domain | Endpoint Count |
|--------|----------------|
| Authentication & Users | 16 |
| Case Management | 30 |
| Documents & Versions | 15 |
| Pleadings & Clauses | 13 |
| Docket | 8 |
| Billing (All modules) | 71 |
| Discovery & Production | 9 |
| Reports | 17 |
| Projects | 5 |
| Processing Jobs | 5 |
| Compliance | 9 |
| Communications | 3 |
| Integrations | 8 |
| Search | 6 |
| Webhooks | 6 |
| API Keys | 5 |
| Health & Metrics | 8 |
| **TOTAL** | **234+ Endpoints** |

---

## 🔴 Frontend Integration Gaps

### High Priority - Missing Integrations

1. **Billing Analytics** - No frontend integration for WIP stats, realization, AR aging
2. **Trust Accounts** - Complete module with no frontend UI
3. **Rate Tables** - No frontend for managing billing rates
4. **Fee Agreements** - Complex contract management needs UI
5. **Document Versions** - Version history UI partially implemented
6. **Processing Jobs** - Job monitoring UI needed for OCR/redaction
7. **Webhooks** - Admin panel for webhook management missing
8. **API Keys** - Admin interface for key management needed
9. **Search Reindex** - Admin tool for search maintenance
10. **Report Scheduling** - Recurring report configuration UI missing

### Medium Priority

1. **Case Phases** - CRUD operations not fully integrated
2. **Case Teams** - Team member management UI incomplete
3. **Motions** - Motion tracking UI needed
4. **Production Statistics** - Analytics dashboard missing
5. **Compliance Audit Logs** - Export and viewing UI needed
6. **Calendar Integration** - Event sync UI not implemented
7. **Data Sources** - Connection management UI missing

### Low Priority (Basic CRUD exists)

1. **Parties** - Basic UI exists but could be enhanced
2. **Communications** - Simple list view exists
3. **Discovery** - Basic request management exists

---

## 🎯 Recommended Next Steps

1. **Audit existing frontend DataService methods** against this list
2. **Prioritize billing analytics integration** (high business value)
3. **Implement job monitoring UI** for processing jobs
4. **Create admin panels** for webhooks, API keys, and trust accounts
5. **Add document version comparison UI**
6. **Build report scheduling interface**
7. **Integrate search suggestions** into global search
8. **Add calendar sync functionality**

---

## 📝 Notes

- All endpoints with `@ApiBearerAuth()` require JWT authentication
- Endpoints marked as "Public" with `@Public()` decorator do not require auth
- Some endpoints have permission-based access control (e.g., USER_MANAGE, ADMIN)
- File upload endpoints use `multipart/form-data`
- Most list endpoints support filtering via query parameters
- Pagination is implemented on many list endpoints using `page` and `limit` query params

---

**Document Status:** Complete  
**Last Updated:** December 15, 2025  
**Maintainer:** Development Team

