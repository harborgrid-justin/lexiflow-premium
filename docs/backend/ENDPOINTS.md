# LexiFlow Premium Backend API Endpoints

## Overview
Complete list of all REST API endpoints organized by module.

---

## Health & Metrics

### Health Checks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Comprehensive health check |
| GET | `/health/liveness` | Kubernetes liveness probe |
| GET | `/health/readiness` | Kubernetes readiness probe |

### Metrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Prometheus metrics |
| GET | `/metrics/json` | JSON metrics |
| GET | `/metrics/system` | System metrics |

---

## Authentication & Users

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/profile` | Get current user profile |
| PUT | `/api/v1/auth/profile` | Update user profile |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Initiate password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/verify-mfa` | Verify MFA code |

### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Create user |
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### API Keys (`/api/v1/admin/api-keys`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/api-keys` | Create API key |
| GET | `/api/v1/admin/api-keys` | List API keys |
| GET | `/api/v1/admin/api-keys/:id` | Get API key by ID |
| DELETE | `/api/v1/admin/api-keys/:id` | Revoke API key |
| GET | `/api/v1/admin/api-keys/:id/usage` | Get API key usage stats |

---

## Case Management

### Cases (`/api/v1/cases`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases` | List all cases |
| GET | `/api/v1/cases/:id` | Get case by ID |
| POST | `/api/v1/cases` | Create case |
| PUT | `/api/v1/cases/:id` | Update case |
| DELETE | `/api/v1/cases/:id` | Delete case |
| POST | `/api/v1/cases/:id/archive` | Archive case |

### Case Phases (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:caseId/phases` | List phases for case |
| POST | `/api/v1/cases/:caseId/phases` | Create phase |
| GET | `/api/v1/case-phases/:id` | Get phase by ID |
| PUT | `/api/v1/case-phases/:id` | Update phase |
| DELETE | `/api/v1/case-phases/:id` | Delete phase |

### Case Teams (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:caseId/team` | List team members |
| POST | `/api/v1/cases/:caseId/team` | Add team member |
| PUT | `/api/v1/case-teams/:id` | Update team member |
| DELETE | `/api/v1/case-teams/:id` | Remove team member |

### Parties (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:caseId/parties` | List parties |
| POST | `/api/v1/cases/:caseId/parties` | Add party |
| PUT | `/api/v1/parties/:id` | Update party |
| DELETE | `/api/v1/parties/:id` | Remove party |

### Motions (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:caseId/motions` | List motions |
| POST | `/api/v1/cases/:caseId/motions` | Create motion |
| PUT | `/api/v1/motions/:id` | Update motion |
| DELETE | `/api/v1/motions/:id` | Delete motion |

---

## Documents

### Documents (`/api/v1/documents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents` | Upload document |
| GET | `/api/v1/documents` | List documents |
| GET | `/api/v1/documents/:id` | Get document by ID |
| GET | `/api/v1/documents/:id/download` | Download document |
| PUT | `/api/v1/documents/:id` | Update document |
| DELETE | `/api/v1/documents/:id` | Delete document |
| POST | `/api/v1/documents/:id/ocr` | Run OCR on document |
| POST | `/api/v1/documents/:id/redact` | Redact document |

### Document Versions (`/api/v1/documents/:documentId/versions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/:documentId/versions` | Create version |
| GET | `/api/v1/documents/:documentId/versions` | List versions |
| GET | `/api/v1/documents/:documentId/versions/:version` | Get version |
| GET | `/api/v1/documents/:documentId/versions/:version/download` | Download version |
| GET | `/api/v1/documents/:documentId/versions/compare` | Compare versions |
| POST | `/api/v1/documents/:documentId/versions/:version/restore` | Restore version |

### Clauses (`/api/v1/clauses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/clauses` | Create clause |
| GET | `/api/v1/clauses` | List clauses |
| GET | `/api/v1/clauses/most-used` | Get most used clauses |
| GET | `/api/v1/clauses/:id` | Get clause by ID |
| PUT | `/api/v1/clauses/:id` | Update clause |
| DELETE | `/api/v1/clauses/:id` | Delete clause |
| POST | `/api/v1/clauses/:id/increment-usage` | Increment usage count |

### Pleadings (`/api/v1/pleadings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/pleadings` | Create pleading |
| GET | `/api/v1/pleadings` | List pleadings |
| GET | `/api/v1/pleadings/upcoming-hearings` | Get upcoming hearings |
| GET | `/api/v1/pleadings/:id` | Get pleading by ID |
| PUT | `/api/v1/pleadings/:id` | Update pleading |
| DELETE | `/api/v1/pleadings/:id` | Delete pleading |
| POST | `/api/v1/pleadings/:id/file` | File pleading |

### Processing Jobs (`/api/v1/processing-jobs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/processing-jobs` | List processing jobs |
| GET | `/api/v1/processing-jobs/statistics` | Get job statistics |
| GET | `/api/v1/processing-jobs/:id` | Get job by ID |
| POST | `/api/v1/processing-jobs/:id/cancel` | Cancel job |

---

## Discovery

### Legal Holds (`/api/v1/discovery/legal-holds`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/legal-holds` | Create legal hold |
| GET | `/api/v1/discovery/legal-holds` | List legal holds |
| GET | `/api/v1/discovery/legal-holds/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/legal-holds/pending-reminders` | Get pending reminders |
| GET | `/api/v1/discovery/legal-holds/:id` | Get legal hold by ID |
| POST | `/api/v1/discovery/legal-holds/:id/release` | Release legal hold |
| PUT | `/api/v1/discovery/legal-holds/:id` | Update legal hold |
| DELETE | `/api/v1/discovery/legal-holds/:id` | Delete legal hold |

### Productions (`/api/v1/discovery/productions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/productions` | Create production |
| GET | `/api/v1/discovery/productions` | List productions |
| GET | `/api/v1/discovery/productions/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/productions/:id` | Get production by ID |
| POST | `/api/v1/discovery/productions/:id/generate-bates` | Generate Bates numbers |
| PUT | `/api/v1/discovery/productions/:id` | Update production |
| DELETE | `/api/v1/discovery/productions/:id` | Delete production |

### Custodians (`/api/v1/discovery/custodians`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/custodians` | Create custodian |
| GET | `/api/v1/discovery/custodians` | List custodians |
| GET | `/api/v1/discovery/custodians/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/custodians/:id` | Get custodian by ID |
| PUT | `/api/v1/discovery/custodians/:id` | Update custodian |
| DELETE | `/api/v1/discovery/custodians/:id` | Delete custodian |

### Custodian Interviews (`/api/v1/discovery/interviews`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/interviews` | Create interview |
| GET | `/api/v1/discovery/interviews` | List interviews |
| GET | `/api/v1/discovery/interviews/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/interviews/custodian/:custodianId` | Get by custodian |
| GET | `/api/v1/discovery/interviews/:id` | Get interview by ID |
| PUT | `/api/v1/discovery/interviews/:id` | Update interview |
| DELETE | `/api/v1/discovery/interviews/:id` | Delete interview |

### Depositions (`/api/v1/discovery/depositions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/depositions` | Create deposition |
| GET | `/api/v1/discovery/depositions` | List depositions |
| GET | `/api/v1/discovery/depositions/upcoming/:caseId` | Get upcoming |
| GET | `/api/v1/discovery/depositions/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/depositions/:id` | Get deposition by ID |
| PUT | `/api/v1/discovery/depositions/:id` | Update deposition |
| DELETE | `/api/v1/discovery/depositions/:id` | Delete deposition |

### Discovery Requests (`/api/v1/discovery/requests`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/requests` | Create request |
| GET | `/api/v1/discovery/requests` | List requests |
| GET | `/api/v1/discovery/requests/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/requests/:id` | Get request by ID |
| PUT | `/api/v1/discovery/requests/:id` | Update request |
| DELETE | `/api/v1/discovery/requests/:id` | Delete request |

### Examinations (`/api/v1/discovery/examinations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/examinations` | Create examination |
| GET | `/api/v1/discovery/examinations` | List examinations |
| GET | `/api/v1/discovery/examinations/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/examinations/:id` | Get examination by ID |
| PUT | `/api/v1/discovery/examinations/:id` | Update examination |
| DELETE | `/api/v1/discovery/examinations/:id` | Delete examination |

### Privilege Log (`/api/v1/discovery/privilege-log`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/privilege-log` | Create entry |
| GET | `/api/v1/discovery/privilege-log` | List entries |
| GET | `/api/v1/discovery/privilege-log/export/:caseId` | Export log |
| GET | `/api/v1/discovery/privilege-log/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/privilege-log/:id` | Get entry by ID |
| PUT | `/api/v1/discovery/privilege-log/:id` | Update entry |
| DELETE | `/api/v1/discovery/privilege-log/:id` | Delete entry |

### ESI Sources (`/api/v1/discovery/esi-sources`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/discovery/esi-sources` | Create ESI source |
| GET | `/api/v1/discovery/esi-sources` | List ESI sources |
| GET | `/api/v1/discovery/esi-sources/statistics/:caseId` | Get statistics |
| GET | `/api/v1/discovery/esi-sources/:id` | Get ESI source by ID |
| PUT | `/api/v1/discovery/esi-sources/:id` | Update ESI source |
| DELETE | `/api/v1/discovery/esi-sources/:id` | Delete ESI source |

### Evidence (`/api/v1/discovery/evidence`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/discovery/evidence` | List evidence |
| GET | `/api/v1/discovery/evidence/:id` | Get evidence by ID |
| POST | `/api/v1/discovery/evidence` | Create evidence |
| PUT | `/api/v1/discovery/evidence/:id` | Update evidence (full) |
| PATCH | `/api/v1/discovery/evidence/:id` | Update evidence (partial) |
| DELETE | `/api/v1/discovery/evidence/:id` | Delete evidence |
| POST | `/api/v1/discovery/evidence/:id/chain-of-custody` | Add custody event |

---

## Billing & Finance

### Time Entries (`/api/v1/billing/time-entries`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/time-entries` | Create time entry |
| POST | `/api/v1/billing/time-entries/bulk` | Bulk create entries |
| GET | `/api/v1/billing/time-entries` | List time entries |
| GET | `/api/v1/billing/time-entries/case/:caseId` | Get by case |
| GET | `/api/v1/billing/time-entries/case/:caseId/unbilled` | Get unbilled |
| GET | `/api/v1/billing/time-entries/case/:caseId/totals` | Get totals |
| GET | `/api/v1/billing/time-entries/user/:userId` | Get by user |
| GET | `/api/v1/billing/time-entries/:id` | Get entry by ID |
| PUT | `/api/v1/billing/time-entries/:id` | Update entry |
| PUT | `/api/v1/billing/time-entries/:id/approve` | Approve entry |
| PUT | `/api/v1/billing/time-entries/:id/bill` | Bill entry |
| DELETE | `/api/v1/billing/time-entries/:id` | Delete entry |

### Invoices (`/api/v1/billing/invoices`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/invoices` | Create invoice |
| GET | `/api/v1/billing/invoices` | List invoices |
| GET | `/api/v1/billing/invoices/overdue` | Get overdue invoices |
| GET | `/api/v1/billing/invoices/:id` | Get invoice by ID |
| GET | `/api/v1/billing/invoices/:id/pdf` | Generate PDF |
| PUT | `/api/v1/billing/invoices/:id` | Update invoice |
| POST | `/api/v1/billing/invoices/:id/send` | Send invoice |
| POST | `/api/v1/billing/invoices/:id/record-payment` | Record payment |
| DELETE | `/api/v1/billing/invoices/:id` | Delete invoice |

### Expenses (`/api/v1/billing/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/expenses` | Create expense |
| GET | `/api/v1/billing/expenses` | List expenses |
| GET | `/api/v1/billing/expenses/case/:caseId` | Get by case |
| GET | `/api/v1/billing/expenses/case/:caseId/unbilled` | Get unbilled |
| GET | `/api/v1/billing/expenses/case/:caseId/totals` | Get totals |
| GET | `/api/v1/billing/expenses/:id` | Get expense by ID |
| PUT | `/api/v1/billing/expenses/:id` | Update expense |
| PUT | `/api/v1/billing/expenses/:id/approve` | Approve expense |
| PUT | `/api/v1/billing/expenses/:id/bill` | Bill expense |
| PUT | `/api/v1/billing/expenses/:id/reimburse` | Reimburse expense |
| DELETE | `/api/v1/billing/expenses/:id` | Delete expense |

### Fee Agreements (`/api/v1/billing/fee-agreements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/fee-agreements` | Create agreement |
| GET | `/api/v1/billing/fee-agreements` | List agreements |
| GET | `/api/v1/billing/fee-agreements/case/:caseId` | Get by case |
| GET | `/api/v1/billing/fee-agreements/:id` | Get agreement by ID |
| PUT | `/api/v1/billing/fee-agreements/:id` | Update agreement |
| PUT | `/api/v1/billing/fee-agreements/:id/activate` | Activate agreement |
| DELETE | `/api/v1/billing/fee-agreements/:id` | Delete agreement |

### Trust Accounts (`/api/v1/billing/trust-accounts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/trust-accounts` | Create account |
| GET | `/api/v1/billing/trust-accounts` | List accounts |
| GET | `/api/v1/billing/trust-accounts/low-balance` | Get low balance |
| GET | `/api/v1/billing/trust-accounts/:id` | Get account by ID |
| GET | `/api/v1/billing/trust-accounts/:id/balance` | Get balance |
| GET | `/api/v1/billing/trust-accounts/:id/transactions` | Get transactions |
| POST | `/api/v1/billing/trust-accounts/:id/deposit` | Make deposit |
| POST | `/api/v1/billing/trust-accounts/:id/withdraw` | Make withdrawal |
| POST | `/api/v1/billing/trust-accounts/:id/transaction` | Create transaction |
| PUT | `/api/v1/billing/trust-accounts/:id` | Update account |
| DELETE | `/api/v1/billing/trust-accounts/:id` | Delete account |

### Rate Tables (`/api/v1/billing/rates`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/rates` | Create rate table |
| GET | `/api/v1/billing/rates` | List rate tables |
| GET | `/api/v1/billing/rates/active` | Get active tables |
| GET | `/api/v1/billing/rates/default/:firmId` | Get default table |
| GET | `/api/v1/billing/rates/:id` | Get table by ID |
| GET | `/api/v1/billing/rates/user-rate/:firmId/:userId` | Get user rate |
| PUT | `/api/v1/billing/rates/:id` | Update table |
| DELETE | `/api/v1/billing/rates/:id` | Delete table |

### Billing Analytics (`/api/v1/billing`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/billing/analytics/metrics` | Get metrics |
| GET | `/api/v1/billing/analytics/trends` | Get trends |
| GET | `/api/v1/billing/analytics/wip-aging` | Get WIP aging |
| GET | `/api/v1/billing/analytics/ar-aging` | Get AR aging |
| GET | `/api/v1/billing/analytics/realization` | Get realization |

---

## Compliance & Security

### Audit Logs (`/api/v1/audit-logs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs` | List audit logs |
| GET | `/api/v1/audit-logs/export` | Export audit logs |
| GET | `/api/v1/audit-logs/entity/:entityType/:entityId` | Get by entity |
| GET | `/api/v1/audit-logs/user/:userId` | Get by user |
| GET | `/api/v1/audit-logs/:id` | Get log by ID |

### Conflict Checks (`/api/v1/compliance/conflicts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/compliance/conflicts` | List conflicts |
| POST | `/api/v1/compliance/conflicts/check` | Run conflict check |
| GET | `/api/v1/compliance/conflicts/:id` | Get conflict by ID |
| POST | `/api/v1/compliance/conflicts/:id/resolve` | Resolve conflict |
| POST | `/api/v1/compliance/conflicts/:id/waive` | Waive conflict |

### Ethical Walls (`/api/v1/compliance/ethical-walls`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/compliance/ethical-walls` | List walls |
| POST | `/api/v1/compliance/ethical-walls` | Create wall |
| GET | `/api/v1/compliance/ethical-walls/user/:userId` | Get by user |
| GET | `/api/v1/compliance/ethical-walls/:id` | Get wall by ID |
| PUT | `/api/v1/compliance/ethical-walls/:id` | Update wall |
| DELETE | `/api/v1/compliance/ethical-walls/:id` | Delete wall |

### Permissions (`/api/v1/security/permissions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/security/permissions` | List permissions |
| POST | `/api/v1/security/permissions` | Create permission |
| DELETE | `/api/v1/security/permissions/:id` | Delete permission |
| POST | `/api/v1/security/permissions/check-access` | Check access |
| POST | `/api/v1/security/permissions/access-matrix` | Get access matrix |

### RLS Policies (`/api/v1/security/rls-policies`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/security/rls-policies` | List policies |
| POST | `/api/v1/security/rls-policies` | Create policy |
| GET | `/api/v1/security/rls-policies/:id` | Get policy by ID |
| PUT | `/api/v1/security/rls-policies/:id` | Update policy |
| DELETE | `/api/v1/security/rls-policies/:id` | Delete policy |

### Compliance Reports (`/api/v1/compliance/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/compliance/reports/access` | Access report |
| GET | `/api/v1/compliance/reports/activity` | Activity report |
| GET | `/api/v1/compliance/reports/conflicts` | Conflicts report |
| GET | `/api/v1/compliance/reports/ethical-walls` | Ethical walls report |

---

## Communications

### Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread count |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences |

### Messaging (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/conversations` | List conversations |
| GET | `/api/v1/conversations/:id` | Get conversation |
| POST | `/api/v1/conversations` | Create conversation |
| DELETE | `/api/v1/conversations/:id` | Delete conversation |
| GET | `/api/v1/conversations/:id/messages` | Get messages |
| POST | `/api/v1/conversations/:id/messages` | Send message |
| PUT | `/api/v1/messages/:id/read` | Mark message read |
| DELETE | `/api/v1/messages/:id` | Delete message |

### Correspondence (`/api/v1/communications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/communications` | List correspondence |
| GET | `/api/v1/communications/:id` | Get correspondence |
| POST | `/api/v1/communications` | Create correspondence |
| PUT | `/api/v1/communications/:id` | Update correspondence |
| DELETE | `/api/v1/communications/:id` | Delete correspondence |
| POST | `/api/v1/communications/:id/send` | Send correspondence |

### Service Jobs (`/api/v1/service-jobs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/service-jobs` | List service jobs |
| GET | `/api/v1/service-jobs/:id` | Get job by ID |
| POST | `/api/v1/service-jobs` | Create job |
| PUT | `/api/v1/service-jobs/:id` | Update job |
| POST | `/api/v1/service-jobs/:id/complete` | Complete job |
| POST | `/api/v1/service-jobs/:id/assign` | Assign job |
| POST | `/api/v1/service-jobs/:id/cancel` | Cancel job |

---

## Analytics & Search

### Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard` | Get dashboard |
| GET | `/api/v1/dashboard/my-cases` | Get my cases |
| GET | `/api/v1/dashboard/deadlines` | Get deadlines |
| GET | `/api/v1/dashboard/tasks` | Get tasks |
| GET | `/api/v1/dashboard/billing-summary` | Get billing summary |

### Case Analytics (`/api/v1/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/case-metrics` | Get case metrics |
| GET | `/api/v1/analytics/case-metrics/:caseId` | Get case metrics |
| GET | `/api/v1/analytics/case-trends` | Get case trends |
| GET | `/api/v1/analytics/practice-area-breakdown` | Get breakdown |

### Discovery Analytics (`/api/v1/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/discovery-funnel` | Get funnel |
| GET | `/api/v1/analytics/discovery-funnel/:caseId` | Get funnel by case |
| GET | `/api/v1/analytics/discovery-timeline` | Get timeline |
| GET | `/api/v1/analytics/discovery-metrics/:caseId` | Get metrics |
| GET | `/api/v1/analytics/production-volume` | Get volume |

### Billing Analytics (`/api/v1/analytics/billing`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/billing/metrics` | Get billing metrics |
| GET | `/api/v1/analytics/billing/trends` | Get billing trends |
| GET | `/api/v1/analytics/billing/wip-aging` | Get WIP aging |
| GET | `/api/v1/analytics/billing/ar-aging` | Get AR aging |
| GET | `/api/v1/analytics/billing/realization` | Get realization |

### Outcome Predictions (`/api/v1/analytics/outcome-predictions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/outcome-predictions/:caseId` | Get predictions |
| POST | `/api/v1/analytics/outcome-predictions/analyze` | Analyze case |
| GET | `/api/v1/analytics/outcome-predictions/:caseId/similar-cases` | Get similar |
| GET | `/api/v1/analytics/outcome-predictions/model/accuracy` | Get accuracy |

### Judge Stats (`/api/v1/analytics/judge-stats`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/judge-stats` | List judge stats |
| GET | `/api/v1/analytics/judge-stats/:judgeId` | Get judge stats |
| GET | `/api/v1/analytics/judge-stats/:judgeId/motion-grants` | Get motion grants |
| GET | `/api/v1/analytics/judge-stats/:judgeId/case-duration` | Get case duration |

### Search (`/api/v1/search`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Global search |
| GET | `/api/v1/search/cases` | Search cases |
| GET | `/api/v1/search/documents` | Search documents |
| GET | `/api/v1/search/clients` | Search clients |
| GET | `/api/v1/search/suggestions` | Get suggestions |
| POST | `/api/v1/search/reindex` | Trigger reindex |

---

## Docket

### Docket Entries (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/docket` | List all docket entries |
| GET | `/api/v1/docket/:id` | Get entry by ID |
| POST | `/api/v1/docket` | Create entry |
| DELETE | `/api/v1/docket/:id` | Delete entry |
| GET | `/api/v1/cases/:caseId/docket` | Get case docket |
| POST | `/api/v1/cases/:caseId/docket` | Add to case docket |
| PUT | `/api/v1/docket/:id` | Update entry |
| POST | `/api/v1/pacer/sync` | PACER sync |

---

## Other

### Projects (`/api/v1/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List projects |
| GET | `/api/v1/projects/:id` | Get project by ID |
| POST | `/api/v1/projects` | Create project |
| PUT | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |

### Reports (`/api/v1/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/templates` | List templates |
| GET | `/api/v1/reports` | List reports |
| GET | `/api/v1/reports/:id` | Get report by ID |
| POST | `/api/v1/reports/generate` | Generate report |
| GET | `/api/v1/reports/:id/download` | Download report |
| DELETE | `/api/v1/reports/:id` | Delete report |

### Webhooks (`/api/v1/webhooks`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks` | Create webhook |
| GET | `/api/v1/webhooks` | List webhooks |
| GET | `/api/v1/webhooks/:id` | Get webhook by ID |
| PUT | `/api/v1/webhooks/:id` | Update webhook |
| DELETE | `/api/v1/webhooks/:id` | Delete webhook |
| POST | `/api/v1/webhooks/:id/test` | Test webhook |
| GET | `/api/v1/webhooks/:id/deliveries` | Get deliveries |

### Integrations (`/api/v1/integrations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/integrations/pacer/search` | PACER search |
| POST | `/api/v1/integrations/pacer/sync` | PACER sync |
| POST | `/api/v1/integrations/calendar/events` | Create event |
| POST | `/api/v1/integrations/calendar/sync` | Calendar sync |
| GET | `/api/v1/integrations/calendar/upcoming` | Get upcoming |
| GET | `/api/v1/integrations/status` | Integration status |

---

## Summary

**Total Endpoints: 250+**

| Category | Count |
|----------|-------|
| Health & Metrics | 6 |
| Auth & Users | 15 |
| Case Management | 19 |
| Documents | 17 |
| Discovery | 52 |
| Billing & Finance | 48 |
| Compliance & Security | 22 |
| Communications | 22 |
| Analytics & Search | 26 |
| Docket | 8 |
| Integrations | 5 |
| Other | 15 |

---

## Integrations (`/api/v1/integrations`)

### Data Sources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/integrations/data-sources` | List all configured data connections |
| POST | `/integrations/data-sources/test` | Test connection to external database |

### External APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/integrations/pacer/search` | Search PACER court records |
| POST | `/integrations/calendar/sync` | Sync with Google/Outlook calendar |
| GET | `/integrations/status` | Check status of all integrations |

---

*Generated: $(date)*
*Backend: LexiFlow Premium v1.0.0*
