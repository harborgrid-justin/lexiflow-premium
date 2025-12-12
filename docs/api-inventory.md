# LexiFlow API Inventory - REST Endpoints

**Version**: 1.0.0
**Last Updated**: December 12, 2025
**Base URL**: `http://localhost:3000` (development)
**Documentation**: Available at `/api/docs` (Swagger)

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [User Management](#user-management)
3. [Case Management](#case-management)
4. [Document Management](#document-management)
5. [Billing & Financial](#billing--financial)
6. [Discovery & Evidence](#discovery--evidence)
7. [Compliance & Audit](#compliance--audit)
8. [Communications](#communications)
9. [Analytics & Reporting](#analytics--reporting)
10. [Integrations](#integrations)
11. [Projects & Tasks](#projects--tasks)

---

## Authentication & Authorization

### Base Path: `/api/auth`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/auth/register` | Register new user account | No | - |
| POST | `/auth/login` | Login with email and password | No | - |
| POST | `/auth/refresh` | Refresh access token | Yes | All |
| POST | `/auth/logout` | Logout and invalidate tokens | Yes | All |
| POST | `/auth/forgot-password` | Request password reset | No | - |
| POST | `/auth/reset-password` | Reset password with token | No | - |
| POST | `/auth/verify-email` | Verify email address | No | - |
| POST | `/auth/resend-verification` | Resend verification email | No | - |
| GET | `/auth/oauth/google` | Initiate Google OAuth | No | - |
| GET | `/auth/oauth/google/callback` | Google OAuth callback | No | - |
| GET | `/auth/oauth/microsoft` | Initiate Microsoft OAuth | No | - |
| GET | `/auth/oauth/microsoft/callback` | Microsoft OAuth callback | No | - |
| POST | `/auth/2fa/enable` | Enable two-factor authentication | Yes | All |
| POST | `/auth/2fa/disable` | Disable two-factor authentication | Yes | All |
| POST | `/auth/2fa/verify` | Verify 2FA code | Yes | All |
| GET | `/auth/2fa/qr-code` | Get 2FA QR code | Yes | All |
| GET | `/auth/me` | Get current user profile | Yes | All |

---

## User Management

### Base Path: `/api/users`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/users` | List all users (paginated) | Yes | ADMIN+ |
| POST | `/users` | Create new user | Yes | ADMIN+ |
| GET | `/users/:id` | Get user by ID | Yes | All |
| PUT | `/users/:id` | Update user | Yes | All (own) / ADMIN+ |
| DELETE | `/users/:id` | Delete user | Yes | SUPER_ADMIN |
| GET | `/users/:id/profile` | Get user profile | Yes | All |
| PUT | `/users/:id/profile` | Update user profile | Yes | All (own) / ADMIN+ |
| PUT | `/users/:id/password` | Change password | Yes | All (own) |
| PUT | `/users/:id/roles` | Update user roles | Yes | ADMIN+ |
| GET | `/users/:id/permissions` | Get user permissions | Yes | All |
| GET | `/users/:id/activity` | Get user activity log | Yes | ADMIN+ |
| GET | `/users/:id/preferences` | Get user preferences | Yes | All (own) |
| PUT | `/users/:id/preferences` | Update user preferences | Yes | All (own) |
| POST | `/users/:id/avatar` | Upload user avatar | Yes | All (own) |
| DELETE | `/users/:id/avatar` | Delete user avatar | Yes | All (own) |

---

## Case Management

### Base Path: `/api/cases`

#### Cases (v2 - Current)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/v2/cases` | List all cases (paginated) | Yes | ATTORNEY+ |
| POST | `/api/v2/cases` | Create new case | Yes | ATTORNEY+ |
| GET | `/api/v2/cases/:id` | Get case by ID | Yes | CASE_TEAM |
| PUT | `/api/v2/cases/:id` | Update case | Yes | ATTORNEY+ |
| DELETE | `/api/v2/cases/:id` | Delete case | Yes | ADMIN+ |
| GET | `/api/v2/cases/:id/details` | Get case details | Yes | CASE_TEAM |
| GET | `/api/v2/cases/:id/timeline` | Get case timeline | Yes | CASE_TEAM |
| GET | `/api/v2/cases/:id/documents` | Get case documents | Yes | CASE_TEAM |
| GET | `/api/v2/cases/:id/parties` | Get case parties | Yes | CASE_TEAM |
| GET | `/api/v2/cases/:id/team` | Get case team | Yes | CASE_TEAM |
| POST | `/api/v2/cases/:id/workflow` | Update workflow status | Yes | ATTORNEY+ |
| GET | `/api/v2/cases/search` | Search cases | Yes | ATTORNEY+ |
| GET | `/api/v2/cases/statistics` | Get case statistics | Yes | ATTORNEY+ |

#### Case Teams

**Base Path**: `/api/case-teams`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/case-teams` | List all case teams | Yes | ATTORNEY+ |
| POST | `/case-teams` | Create case team | Yes | ATTORNEY+ |
| GET | `/case-teams/:id` | Get case team | Yes | CASE_TEAM |
| PUT | `/case-teams/:id` | Update case team | Yes | ATTORNEY+ |
| DELETE | `/case-teams/:id` | Delete case team | Yes | ATTORNEY+ |
| POST | `/case-teams/:id/members` | Add team member | Yes | ATTORNEY+ |
| DELETE | `/case-teams/:id/members/:userId` | Remove team member | Yes | ATTORNEY+ |
| PUT | `/case-teams/:id/members/:userId` | Update member role | Yes | ATTORNEY+ |

#### Case Phases

**Base Path**: `/api/case-phases`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/case-phases` | List all phases | Yes | CASE_TEAM |
| POST | `/case-phases` | Create phase | Yes | ATTORNEY+ |
| GET | `/case-phases/:id` | Get phase | Yes | CASE_TEAM |
| PUT | `/case-phases/:id` | Update phase | Yes | ATTORNEY+ |
| DELETE | `/case-phases/:id` | Delete phase | Yes | ATTORNEY+ |
| POST | `/case-phases/:id/complete` | Mark phase complete | Yes | ATTORNEY+ |
| GET | `/case-phases/case/:caseId` | Get phases by case | Yes | CASE_TEAM |

#### Parties

**Base Path**: `/api/parties`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/parties` | List all parties | Yes | ATTORNEY+ |
| POST | `/parties` | Create party | Yes | ATTORNEY+ |
| GET | `/parties/:id` | Get party | Yes | CASE_TEAM |
| PUT | `/parties/:id` | Update party | Yes | ATTORNEY+ |
| DELETE | `/parties/:id` | Delete party | Yes | ATTORNEY+ |
| GET | `/parties/case/:caseId` | Get parties by case | Yes | CASE_TEAM |

#### Motions

**Base Path**: `/api/motions`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/motions` | List all motions | Yes | ATTORNEY+ |
| POST | `/motions` | File motion | Yes | ATTORNEY+ |
| GET | `/motions/:id` | Get motion | Yes | CASE_TEAM |
| PUT | `/motions/:id` | Update motion | Yes | ATTORNEY+ |
| DELETE | `/motions/:id` | Delete motion | Yes | ATTORNEY+ |
| GET | `/motions/case/:caseId` | Get motions by case | Yes | CASE_TEAM |
| POST | `/motions/:id/response` | File motion response | Yes | ATTORNEY+ |

#### Pleadings

**Base Path**: `/api/pleadings`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/pleadings` | List all pleadings | Yes | ATTORNEY+ |
| POST | `/pleadings` | Create pleading | Yes | ATTORNEY+ |
| GET | `/pleadings/:id` | Get pleading | Yes | CASE_TEAM |
| PUT | `/pleadings/:id` | Update pleading | Yes | ATTORNEY+ |
| DELETE | `/pleadings/:id` | Delete pleading | Yes | ATTORNEY+ |
| GET | `/pleadings/case/:caseId` | Get pleadings by case | Yes | CASE_TEAM |

#### Docket

**Base Path**: `/api/docket`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/docket` | List docket entries | Yes | ATTORNEY+ |
| POST | `/docket` | Create docket entry | Yes | ATTORNEY+ |
| GET | `/docket/:id` | Get docket entry | Yes | CASE_TEAM |
| PUT | `/docket/:id` | Update docket entry | Yes | ATTORNEY+ |
| DELETE | `/docket/:id` | Delete docket entry | Yes | ATTORNEY+ |
| GET | `/docket/case/:caseId` | Get docket by case | Yes | CASE_TEAM |
| GET | `/docket/calendar` | Get calendar view | Yes | ATTORNEY+ |
| GET | `/docket/upcoming` | Get upcoming entries | Yes | ATTORNEY+ |

---

## Document Management

### Base Path: `/api/documents`

#### Documents

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/documents` | List documents (paginated) | Yes | PARALEGAL+ |
| POST | `/documents` | Upload document | Yes | PARALEGAL+ |
| GET | `/documents/:id` | Get document metadata | Yes | CASE_TEAM |
| PUT | `/documents/:id` | Update document metadata | Yes | PARALEGAL+ |
| DELETE | `/documents/:id` | Delete document | Yes | ATTORNEY+ |
| GET | `/documents/:id/download` | Download document | Yes | CASE_TEAM |
| GET | `/documents/:id/preview` | Preview document | Yes | CASE_TEAM |
| POST | `/documents/:id/ocr` | Process with OCR | Yes | PARALEGAL+ |
| GET | `/documents/:id/ocr-result` | Get OCR result | Yes | CASE_TEAM |
| POST | `/documents/:id/share` | Share document | Yes | PARALEGAL+ |
| GET | `/documents/case/:caseId` | Get documents by case | Yes | CASE_TEAM |
| GET | `/documents/search` | Full-text search | Yes | PARALEGAL+ |
| POST | `/documents/bulk-upload` | Upload multiple documents | Yes | PARALEGAL+ |

#### Document Versions

**Base Path**: `/api/document-versions`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/document-versions` | List all versions | Yes | PARALEGAL+ |
| POST | `/document-versions` | Create new version | Yes | PARALEGAL+ |
| GET | `/document-versions/:id` | Get version | Yes | CASE_TEAM |
| PUT | `/document-versions/:id` | Update version | Yes | PARALEGAL+ |
| DELETE | `/document-versions/:id` | Delete version | Yes | ATTORNEY+ |
| GET | `/document-versions/document/:docId` | Get versions by document | Yes | CASE_TEAM |
| GET | `/document-versions/:id/compare/:otherId` | Compare two versions | Yes | CASE_TEAM |
| GET | `/document-versions/:id/diff/:otherId` | Get detailed diff | Yes | CASE_TEAM |
| GET | `/document-versions/:id/changes` | Get version changes | Yes | CASE_TEAM |
| GET | `/document-versions/:id/summary` | Get change summary | Yes | CASE_TEAM |
| POST | `/document-versions/:id/revert` | Revert to version | Yes | ATTORNEY+ |

#### Document Templates

**Base Path**: `/api/document-templates`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/document-templates` | List all templates | Yes | PARALEGAL+ |
| POST | `/document-templates` | Create template | Yes | ATTORNEY+ |
| GET | `/document-templates/:id` | Get template | Yes | PARALEGAL+ |
| PUT | `/document-templates/:id` | Update template | Yes | ATTORNEY+ |
| DELETE | `/document-templates/:id` | Delete template | Yes | ADMIN+ |
| POST | `/document-templates/:id/generate` | Generate from template | Yes | PARALEGAL+ |
| GET | `/document-templates/:id/preview` | Preview template | Yes | PARALEGAL+ |
| GET | `/document-templates/most-used` | Get most used templates | Yes | PARALEGAL+ |
| POST | `/document-templates/:id/validate` | Validate template | Yes | ATTORNEY+ |

#### Clauses Library

**Base Path**: `/api/clauses`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/clauses` | List all clauses | Yes | PARALEGAL+ |
| POST | `/clauses` | Create clause | Yes | ATTORNEY+ |
| GET | `/clauses/:id` | Get clause | Yes | PARALEGAL+ |
| PUT | `/clauses/:id` | Update clause | Yes | ATTORNEY+ |
| DELETE | `/clauses/:id` | Delete clause | Yes | ADMIN+ |
| GET | `/clauses/category/:category` | Get clauses by category | Yes | PARALEGAL+ |
| POST | `/clauses/:id/interpolate` | Interpolate variables | Yes | PARALEGAL+ |
| POST | `/clauses/batch-interpolate` | Batch interpolate | Yes | PARALEGAL+ |
| GET | `/clauses/:id/variables` | Get required variables | Yes | PARALEGAL+ |

---

## Billing & Financial

### Base Path: `/api/billing`

#### Time Entries

**Base Path**: `/api/time-entries`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/time-entries` | List time entries | Yes | PARALEGAL+ |
| POST | `/time-entries` | Create time entry | Yes | PARALEGAL+ |
| GET | `/time-entries/:id` | Get time entry | Yes | PARALEGAL+ |
| PUT | `/time-entries/:id` | Update time entry | Yes | PARALEGAL+ (own) |
| DELETE | `/time-entries/:id` | Delete time entry | Yes | ATTORNEY+ |
| POST | `/time-entries/:id/submit` | Submit for approval | Yes | PARALEGAL+ |
| POST | `/time-entries/:id/approve` | Approve time entry | Yes | ATTORNEY+ |
| POST | `/time-entries/:id/reject` | Reject time entry | Yes | ATTORNEY+ |
| POST | `/time-entries/:id/bill` | Mark as billed | Yes | ATTORNEY+ |
| GET | `/time-entries/unbilled` | Get unbilled entries | Yes | ATTORNEY+ |
| GET | `/time-entries/case/:caseId` | Get entries by case | Yes | CASE_TEAM |
| GET | `/time-entries/totals` | Get time totals | Yes | ATTORNEY+ |
| POST | `/time-entries/bulk-approve` | Bulk approve entries | Yes | ATTORNEY+ |

#### Invoices

**Base Path**: `/api/invoices`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/invoices` | List invoices | Yes | ATTORNEY+ |
| POST | `/invoices` | Create invoice | Yes | ATTORNEY+ |
| GET | `/invoices/:id` | Get invoice | Yes | ATTORNEY+ |
| PUT | `/invoices/:id` | Update invoice | Yes | ATTORNEY+ |
| DELETE | `/invoices/:id` | Delete invoice | Yes | ADMIN+ |
| POST | `/invoices/:id/send` | Send invoice to client | Yes | ATTORNEY+ |
| POST | `/invoices/:id/payment` | Record payment | Yes | ATTORNEY+ |
| GET | `/invoices/:id/pdf` | Generate PDF | Yes | ATTORNEY+ |
| GET | `/invoices/client/:clientId` | Get invoices by client | Yes | ATTORNEY+ |
| GET | `/invoices/overdue` | Get overdue invoices | Yes | ATTORNEY+ |
| GET | `/invoices/ar-aging` | Get AR aging report | Yes | ATTORNEY+ |

#### Trust Accounts

**Base Path**: `/api/trust-accounts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/trust-accounts` | List trust accounts | Yes | ATTORNEY+ |
| POST | `/trust-accounts` | Create trust account | Yes | ADMIN+ |
| GET | `/trust-accounts/:id` | Get trust account | Yes | ATTORNEY+ |
| PUT | `/trust-accounts/:id` | Update trust account | Yes | ADMIN+ |
| DELETE | `/trust-accounts/:id` | Delete trust account | Yes | SUPER_ADMIN |
| POST | `/trust-accounts/:id/deposit` | Record deposit | Yes | ATTORNEY+ |
| POST | `/trust-accounts/:id/withdrawal` | Record withdrawal | Yes | ATTORNEY+ |
| GET | `/trust-accounts/:id/balance` | Get current balance | Yes | ATTORNEY+ |
| GET | `/trust-accounts/:id/transactions` | Get transaction history | Yes | ATTORNEY+ |
| GET | `/trust-accounts/:id/reconcile` | Reconciliation report | Yes | ATTORNEY+ |
| GET | `/trust-accounts/low-balance` | Get low balance alerts | Yes | ATTORNEY+ |

#### Expenses

**Base Path**: `/api/expenses`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/expenses` | List expenses | Yes | PARALEGAL+ |
| POST | `/expenses` | Create expense | Yes | PARALEGAL+ |
| GET | `/expenses/:id` | Get expense | Yes | PARALEGAL+ |
| PUT | `/expenses/:id` | Update expense | Yes | PARALEGAL+ (own) |
| DELETE | `/expenses/:id` | Delete expense | Yes | ATTORNEY+ |
| POST | `/expenses/:id/approve` | Approve expense | Yes | ATTORNEY+ |
| GET | `/expenses/case/:caseId` | Get expenses by case | Yes | CASE_TEAM |

#### Rate Tables

**Base Path**: `/api/rate-tables`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/rate-tables` | List rate tables | Yes | ATTORNEY+ |
| POST | `/rate-tables` | Create rate table | Yes | ADMIN+ |
| GET | `/rate-tables/:id` | Get rate table | Yes | ATTORNEY+ |
| PUT | `/rate-tables/:id` | Update rate table | Yes | ADMIN+ |
| DELETE | `/rate-tables/:id` | Delete rate table | Yes | SUPER_ADMIN |

---

## Discovery & Evidence

#### Discovery Requests

**Base Path**: `/api/discovery-requests`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/discovery-requests` | List discovery requests | Yes | PARALEGAL+ |
| POST | `/discovery-requests` | Create discovery request | Yes | ATTORNEY+ |
| GET | `/discovery-requests/:id` | Get discovery request | Yes | CASE_TEAM |
| PUT | `/discovery-requests/:id` | Update discovery request | Yes | ATTORNEY+ |
| DELETE | `/discovery-requests/:id` | Delete discovery request | Yes | ATTORNEY+ |
| GET | `/discovery-requests/case/:caseId` | Get requests by case | Yes | CASE_TEAM |
| POST | `/discovery-requests/:id/respond` | Submit response | Yes | ATTORNEY+ |

#### Depositions

**Base Path**: `/api/depositions`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/depositions` | List depositions | Yes | PARALEGAL+ |
| POST | `/depositions` | Schedule deposition | Yes | ATTORNEY+ |
| GET | `/depositions/:id` | Get deposition | Yes | CASE_TEAM |
| PUT | `/depositions/:id` | Update deposition | Yes | ATTORNEY+ |
| DELETE | `/depositions/:id` | Delete deposition | Yes | ATTORNEY+ |
| GET | `/depositions/case/:caseId` | Get depositions by case | Yes | CASE_TEAM |

#### ESI Sources

**Base Path**: `/api/esi-sources`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/esi-sources` | List ESI sources | Yes | PARALEGAL+ |
| POST | `/esi-sources` | Add ESI source | Yes | ATTORNEY+ |
| GET | `/esi-sources/:id` | Get ESI source | Yes | CASE_TEAM |
| PUT | `/esi-sources/:id` | Update ESI source | Yes | ATTORNEY+ |
| DELETE | `/esi-sources/:id` | Delete ESI source | Yes | ATTORNEY+ |

#### Legal Holds

**Base Path**: `/api/legal-holds`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/legal-holds` | List legal holds | Yes | ATTORNEY+ |
| POST | `/legal-holds` | Create legal hold | Yes | ATTORNEY+ |
| GET | `/legal-holds/:id` | Get legal hold | Yes | ATTORNEY+ |
| PUT | `/legal-holds/:id` | Update legal hold | Yes | ATTORNEY+ |
| DELETE | `/legal-holds/:id` | Delete legal hold | Yes | ATTORNEY+ |

#### Evidence

**Base Path**: `/api/evidence`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/evidence` | List evidence items | Yes | PARALEGAL+ |
| POST | `/evidence` | Add evidence item | Yes | PARALEGAL+ |
| GET | `/evidence/:id` | Get evidence item | Yes | CASE_TEAM |
| PUT | `/evidence/:id` | Update evidence item | Yes | PARALEGAL+ |
| DELETE | `/evidence/:id` | Delete evidence item | Yes | ATTORNEY+ |
| GET | `/evidence/case/:caseId` | Get evidence by case | Yes | CASE_TEAM |
| GET | `/evidence/:id/chain-of-custody` | Get custody chain | Yes | CASE_TEAM |

---

## Compliance & Audit

#### Audit Logs

**Base Path**: `/api/audit-logs`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/audit-logs` | List audit logs | Yes | ADMIN+ |
| GET | `/audit-logs/:id` | Get audit log | Yes | ADMIN+ |
| GET | `/audit-logs/user/:userId` | Get logs by user | Yes | ADMIN+ |
| GET | `/audit-logs/entity/:entityType/:entityId` | Get logs by entity | Yes | ADMIN+ |
| GET | `/audit-logs/search` | Search audit logs | Yes | ADMIN+ |
| GET | `/audit-logs/statistics` | Get audit statistics | Yes | ADMIN+ |
| POST | `/audit-logs/export` | Export audit logs | Yes | ADMIN+ |
| GET | `/audit-logs/session/:sessionId` | Get logs by session | Yes | ADMIN+ |

#### Conflict Checks

**Base Path**: `/api/conflict-checks`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/conflict-checks` | List conflict checks | Yes | ATTORNEY+ |
| POST | `/conflict-checks` | Run conflict check | Yes | ATTORNEY+ |
| GET | `/conflict-checks/:id` | Get conflict check | Yes | ATTORNEY+ |
| PUT | `/conflict-checks/:id` | Update conflict check | Yes | ATTORNEY+ |
| DELETE | `/conflict-checks/:id` | Delete conflict check | Yes | ADMIN+ |
| POST | `/conflict-checks/batch` | Batch conflict check | Yes | ATTORNEY+ |
| POST | `/conflict-checks/party` | Check party conflicts | Yes | ATTORNEY+ |
| GET | `/conflict-checks/:id/resolve` | Mark conflict resolved | Yes | ATTORNEY+ |
| GET | `/conflict-checks/statistics` | Get conflict statistics | Yes | ADMIN+ |

#### Ethical Walls

**Base Path**: `/api/ethical-walls`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/ethical-walls` | List ethical walls | Yes | ADMIN+ |
| POST | `/ethical-walls` | Create ethical wall | Yes | ADMIN+ |
| GET | `/ethical-walls/:id` | Get ethical wall | Yes | ADMIN+ |
| PUT | `/ethical-walls/:id` | Update ethical wall | Yes | ADMIN+ |
| DELETE | `/ethical-walls/:id` | Delete ethical wall | Yes | ADMIN+ |
| POST | `/ethical-walls/:id/add-user` | Add user to wall | Yes | ADMIN+ |
| POST | `/ethical-walls/:id/remove-user` | Remove user from wall | Yes | ADMIN+ |
| GET | `/ethical-walls/:id/breaches` | Get breach incidents | Yes | ADMIN+ |
| GET | `/ethical-walls/:id/effectiveness` | Get effectiveness score | Yes | ADMIN+ |

---

## Communications

#### Messaging

**Base Path**: `/api/messaging`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/messaging/conversations` | List conversations | Yes | All |
| POST | `/messaging/conversations` | Create conversation | Yes | All |
| GET | `/messaging/conversations/:id` | Get conversation | Yes | PARTICIPANT |
| DELETE | `/messaging/conversations/:id` | Delete conversation | Yes | PARTICIPANT |
| GET | `/messaging/conversations/:id/messages` | Get messages | Yes | PARTICIPANT |
| POST | `/messaging/conversations/:id/messages` | Send message | Yes | PARTICIPANT |
| PUT | `/messaging/messages/:id` | Edit message | Yes | SENDER |
| DELETE | `/messaging/messages/:id` | Delete message | Yes | SENDER |
| POST | `/messaging/messages/:id/read` | Mark as read | Yes | PARTICIPANT |

#### Notifications

**Base Path**: `/api/notifications`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/notifications` | List user notifications | Yes | All |
| GET | `/notifications/:id` | Get notification | Yes | All |
| PUT | `/notifications/:id/read` | Mark as read | Yes | All |
| PUT | `/notifications/read-all` | Mark all as read | Yes | All |
| DELETE | `/notifications/:id` | Delete notification | Yes | All |
| GET | `/notifications/unread-count` | Get unread count | Yes | All |
| GET | `/notifications/preferences` | Get preferences | Yes | All |
| PUT | `/notifications/preferences` | Update preferences | Yes | All |

#### Correspondence

**Base Path**: `/api/correspondence`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/correspondence` | List correspondence | Yes | PARALEGAL+ |
| POST | `/correspondence` | Create correspondence | Yes | PARALEGAL+ |
| GET | `/correspondence/:id` | Get correspondence | Yes | PARALEGAL+ |
| PUT | `/correspondence/:id` | Update correspondence | Yes | PARALEGAL+ |
| DELETE | `/correspondence/:id` | Delete correspondence | Yes | ATTORNEY+ |

---

## Analytics & Reporting

#### Dashboard

**Base Path**: `/api/dashboard`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/dashboard/metrics` | Get dashboard metrics | Yes | ATTORNEY+ |
| GET | `/dashboard/cases` | Get case overview | Yes | ATTORNEY+ |
| GET | `/dashboard/billing` | Get billing overview | Yes | ATTORNEY+ |
| GET | `/dashboard/tasks` | Get task summary | Yes | All |
| GET | `/dashboard/deadlines` | Get upcoming deadlines | Yes | PARALEGAL+ |

#### Case Analytics

**Base Path**: `/api/case-analytics`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/case-analytics/:caseId` | Get case analytics | Yes | CASE_TEAM |
| GET | `/case-analytics/bulk` | Bulk case analytics | Yes | ATTORNEY+ |
| GET | `/case-analytics/trends` | Get case trends | Yes | ATTORNEY+ |

#### Judge Statistics

**Base Path**: `/api/judge-stats`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/judge-stats` | List judge statistics | Yes | ATTORNEY+ |
| GET | `/judge-stats/:judgeId` | Get judge statistics | Yes | ATTORNEY+ |
| GET | `/judge-stats/search` | Search judges | Yes | ATTORNEY+ |

#### Billing Analytics

**Base Path**: `/api/billing-analytics`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/billing-analytics/revenue` | Get revenue metrics | Yes | ADMIN+ |
| GET | `/billing-analytics/productivity` | Get productivity metrics | Yes | ADMIN+ |
| GET | `/billing-analytics/utilization` | Get utilization metrics | Yes | ADMIN+ |

#### Discovery Analytics

**Base Path**: `/api/discovery-analytics`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/discovery-analytics/:caseId` | Get discovery analytics | Yes | CASE_TEAM |
| GET | `/discovery-analytics/progress` | Get discovery progress | Yes | ATTORNEY+ |

#### Outcome Predictions

**Base Path**: `/api/outcome-predictions`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/outcome-predictions/predict` | Predict case outcome | Yes | ATTORNEY+ |
| GET | `/outcome-predictions/:caseId` | Get case prediction | Yes | ATTORNEY+ |

#### Reports

**Base Path**: `/api/reports`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/reports` | List available reports | Yes | ATTORNEY+ |
| POST | `/reports/generate` | Generate custom report | Yes | ATTORNEY+ |
| GET | `/reports/:id` | Get report | Yes | ATTORNEY+ |
| POST | `/reports/:id/export` | Export report | Yes | ATTORNEY+ |

---

## Integrations

#### Webhooks

**Base Path**: `/api/webhooks`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/webhooks` | List webhooks | Yes | ADMIN+ |
| POST | `/webhooks` | Create webhook | Yes | ADMIN+ |
| GET | `/webhooks/:id` | Get webhook | Yes | ADMIN+ |
| PUT | `/webhooks/:id` | Update webhook | Yes | ADMIN+ |
| DELETE | `/webhooks/:id` | Delete webhook | Yes | ADMIN+ |
| POST | `/webhooks/:id/test` | Test webhook | Yes | ADMIN+ |
| GET | `/webhooks/:id/deliveries` | Get delivery history | Yes | ADMIN+ |

#### API Keys

**Base Path**: `/api/api-keys`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api-keys` | List API keys | Yes | ADMIN+ |
| POST | `/api-keys` | Create API key | Yes | ADMIN+ |
| GET | `/api-keys/:id` | Get API key | Yes | ADMIN+ |
| PUT | `/api-keys/:id` | Update API key | Yes | ADMIN+ |
| DELETE | `/api-keys/:id` | Delete API key | Yes | ADMIN+ |
| POST | `/api-keys/:id/revoke` | Revoke API key | Yes | ADMIN+ |

#### External APIs

**Base Path**: `/api/external-api`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/external-api/integrations` | List integrations | Yes | ADMIN+ |
| POST | `/external-api/connect` | Connect integration | Yes | ADMIN+ |
| POST | `/external-api/disconnect` | Disconnect integration | Yes | ADMIN+ |

---

## Projects & Tasks

#### Projects

**Base Path**: `/api/projects`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/projects` | List projects | Yes | PARALEGAL+ |
| POST | `/projects` | Create project | Yes | ATTORNEY+ |
| GET | `/projects/:id` | Get project | Yes | TEAM_MEMBER |
| PUT | `/projects/:id` | Update project | Yes | ATTORNEY+ |
| DELETE | `/projects/:id` | Delete project | Yes | ADMIN+ |

#### Tasks

**Base Path**: `/api/tasks`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/tasks` | List tasks | Yes | All |
| POST | `/tasks` | Create task | Yes | PARALEGAL+ |
| GET | `/tasks/:id` | Get task | Yes | All |
| PUT | `/tasks/:id` | Update task | Yes | ASSIGNEE/ATTORNEY+ |
| DELETE | `/tasks/:id` | Delete task | Yes | ATTORNEY+ |
| POST | `/tasks/:id/complete` | Mark complete | Yes | ASSIGNEE |
| GET | `/tasks/assigned-to-me` | Get my tasks | Yes | All |

---

## Authentication Methods

### 1. JWT Bearer Token
```
Authorization: Bearer <access_token>
```

### 2. API Key
```
X-API-Key: <api_key>
```
or
```
Authorization: Bearer <api_key>
```

### 3. OAuth2
- Google OAuth: `/auth/oauth/google`
- Microsoft OAuth: `/auth/oauth/microsoft`

---

## Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful request with no response body |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user
- **API Key**: Configurable per key

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Filtering

Common filter parameters:
- `search`: Full-text search
- `status`: Filter by status
- `caseId`: Filter by case
- `userId`: Filter by user
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `type`: Filter by type

Example: `/api/cases?status=active&search=smith&startDate=2025-01-01`

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2025-12-12T16:00:00.000Z",
  "path": "/api/users"
}
```

---

## Versioning

- **Current Version**: v2 (latest)
- **Legacy Version**: v1 (deprecated, to be removed in 2026)
- **Version Header**: `X-API-Version: 2` (optional)

---

## Swagger Documentation

Interactive API documentation available at:
- **Development**: `http://localhost:3000/api/docs`
- **Production**: `https://api.lexiflow.com/docs`

---

**Total Endpoints**: 180+
**Last Updated**: December 12, 2025
**Maintained By**: Agent 11 - Coordination Team
