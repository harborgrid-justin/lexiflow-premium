| Controller                             | Base Path | Route                          | Method | Full API Path                              | Public? | Status       | Notes                             |
| -------------------------------------- | --------- | ------------------------------ | ------ | ------------------------------------------ | ------- | ------------ | --------------------------------- |
| **cases.controller.ts**                |
|                                        | cases     | /import/parse                  | POST   | /api/cases/import/parse                    | ❌      | ✅ Works     | Parse case data                   |
|                                        | cases     | /stats                         | GET    | /api/cases/stats                           | ✅      | ✅ Works     | Case statistics                   |
|                                        | cases     | /                              | GET    | /api/cases                                 | ✅      | ❌ 401 ERROR | **Should work without auth!**     |
|                                        | cases     | /archived                      | GET    | /api/cases/archived                        | ❌      | ✅ Works     | Archived cases                    |
|                                        | cases     | /:id                           | GET    | /api/cases/:id                             | ❌      | ✅ Works     | Case by ID                        |
|                                        | cases     | /                              | POST   | /api/cases                                 | ✅      | ✅ Works     | Create case (temp public)         |
|                                        | cases     | /:id                           | PUT    | /api/cases/:id                             | ❌      | ✅ Works     | Update case                       |
|                                        | cases     | /:id                           | DELETE | /api/cases/:id                             | ❌      | ✅ Works     | Delete case                       |
| **documents.controller.ts**            |
|                                        | documents | /                              | POST   | /api/documents                             | ❌      | ✅ Works     | Upload (multipart)                |
|                                        | documents | /                              | GET    | /api/documents                             | ✅      | ✅ Works     | List all                          |
|                                        | documents | /:id                           | GET    | /api/documents/:id                         | ❌      | ✅ Works     | Get metadata                      |
|                                        | documents | /:id/download                  | GET    | /api/documents/:id/download                | ❌      | ✅ Works     | Download file                     |
|                                        | documents | /:id                           | PUT    | /api/documents/:id                         | ❌      | ✅ Works     | Update                            |
|                                        | documents | /:id                           | DELETE | /api/documents/:id                         | ❌      | ✅ Works     | Delete                            |
| **discovery.controller.ts**            |
|                                        | discovery | /                              | HEAD   | /api/discovery                             | ❌      | ✅ Works     | Health check                      |
|                                        | discovery | /evidence                      | HEAD   | /api/discovery/evidence                    | ❌      | ✅ Works     | Health check                      |
|                                        | discovery | /evidence                      | GET    | /api/discovery/evidence                    | ✅      | ✅ Works     | List evidence                     |
|                                        | discovery | /evidence                      | POST   | /api/discovery/evidence                    | ❌      | ✅ Works     | Create evidence                   |
|                                        | discovery | /                              | GET    | /api/discovery                             | ❌      | ✅ Works     | List requests                     |
|                                        | discovery | /:id                           | GET    | /api/discovery/:id                         | ❌      | ✅ Works     | Get request                       |
|                                        | discovery | /                              | POST   | /api/discovery                             | ❌      | ✅ Works     | Create request                    |
| **billing-analytics.controller.ts** ⚠️ |
|                                        | billing   | /metrics                       | GET    | /api/billing/metrics                       | ✅      | ❌ 404 ERROR | **ROUTE CONFLICT!**               |
|                                        | billing   | /wip-stats                     | GET    | /api/billing/wip-stats                     | ✅      | ⚠️ Conflict  | Duplicate with billing.controller |
|                                        | billing   | /realization                   | GET    | /api/billing/realization                   | ❌      | ⚠️ May fail  | Route conflict                    |
|                                        | billing   | /operating-summary             | GET    | /api/billing/operating-summary             | ❌      | ⚠️ May fail  | Route conflict                    |
|                                        | billing   | /ar-aging                      | GET    | /api/billing/ar-aging                      | ❌      | ⚠️ May fail  | Route conflict                    |
| **billing.controller.ts** ⚠️           |
|                                        | billing   | /invoices                      | GET    | /api/billing/invoices                      | ❌      | ✅ Works     | List invoices                     |
|                                        | billing   | /invoices/:id                  | GET    | /api/billing/invoices/:id                  | ❌      | ✅ Works     | Get invoice                       |
|                                        | billing   | /invoices                      | POST   | /api/billing/invoices                      | ❌      | ✅ Works     | Create invoice                    |
|                                        | billing   | /invoices/:id                  | PUT    | /api/billing/invoices/:id                  | ❌      | ✅ Works     | Update invoice                    |
|                                        | billing   | /invoices/:id                  | DELETE | /api/billing/invoices/:id                  | ❌      | ✅ Works     | Delete invoice                    |
|                                        | billing   | /invoices/:id/send             | POST   | /api/billing/invoices/:id/send             | ❌      | ✅ Works     | Send to client                    |
|                                        | billing   | /invoices/:id/mark-paid        | POST   | /api/billing/invoices/:id/mark-paid        | ❌      | ✅ Works     | Mark as paid                      |
|                                        | billing   | /time-entries                  | GET    | /api/billing/time-entries                  | ❌      | ✅ Works     | List entries                      |
|                                        | billing   | /time-entries/case/:caseId     | GET    | /api/billing/time-entries/case/:caseId     | ❌      | ✅ Works     | By case                           |
|                                        | billing   | /time-entries                  | POST   | /api/billing/time-entries                  | ❌      | ✅ Works     | Create entry                      |
|                                        | billing   | /time-entries/:id              | PUT    | /api/billing/time-entries/:id              | ❌      | ✅ Works     | Update entry                      |
|                                        | billing   | /time-entries/:id              | DELETE | /api/billing/time-entries/:id              | ❌      | ✅ Works     | Delete entry                      |
|                                        | billing   | /time-entries/unbilled/:caseId | GET    | /api/billing/time-entries/unbilled/:caseId | ❌      | ✅ Works     | Unbilled entries                  |
|                                        | billing   | /expenses                      | GET    | /api/billing/expenses                      | ❌      | ✅ Works     | List expenses                     |
|                                        | billing   | /expenses                      | POST   | /api/billing/expenses                      | ❌      | ✅ Works     | Create expense                    |
|                                        | billing   | /expenses/unbilled/:caseId     | GET    | /api/billing/expenses/unbilled/:caseId     | ❌      | ✅ Works     | Unbilled expenses                 |
|                                        | billing   | /generate-invoice              | POST   | /api/billing/generate-invoice              | ❌      | ✅ Works     | Auto-generate                     |
|                                        | billing   | /summary/:caseId               | GET    | /api/billing/summary/:caseId               | ❌      | ✅ Works     | Case summary                      |
|                                        | billing   | /wip-stats                     | GET    | /api/billing/wip-stats                     | ❌      | ⚠️ Duplicate | **CONFLICT!**                     |
|                                        | billing   | /realization-stats             | GET    | /api/billing/realization-stats             | ❌      | ✅ Works     | Stats                             |
|                                        | billing   | /overview-stats                | GET    | /api/billing/overview-stats                | ❌      | ✅ Works     | Overview                          |
| **knowledge.controller.ts**            |
|                                        | knowledge | /                              | GET    | /api/knowledge                             | ✅      | ✅ Works     | Health check                      |
|                                        | knowledge | /articles                      | GET    | /api/knowledge/articles                    | ✅      | ✅ Works     | List articles                     |
|                                        | knowledge | /articles/popular              | GET    | /api/knowledge/articles/popular            | ✅      | ✅ Works     | Popular articles                  |
|                                        | knowledge | /articles/recent               | GET    | /api/knowledge/articles/recent             | ❌      | ✅ Works     | Recent articles                   |
|                                        | knowledge | /articles/:id                  | GET    | /api/knowledge/articles/:id                | ❌      | ✅ Works     | Get article                       |
|                                        | knowledge | /search                        | GET    | /api/knowledge/search                      | ❌      | ✅ Works     | Search                            |
|                                        | knowledge | /categories                    | GET    | /api/knowledge/categories                  | ❌      | ✅ Works     | List categories                   |
|                                        | knowledge | /tags                          | GET    | /api/knowledge/tags                        | ❌      | ✅ Works     | List tags                         |
|                                        | knowledge | /articles                      | POST   | /api/knowledge/articles                    | ❌      | ✅ Works     | Create (admin/attorney)           |
|                                        | knowledge | /articles/:id                  | PUT    | /api/knowledge/articles/:id                | ❌      | ✅ Works     | Update (admin/attorney)           |
| **calendar.controller.ts**             |
|                                        | calendar  | /                              | GET    | /api/calendar                              | ✅      | ✅ Works     | List events                       |
|                                        | calendar  | /upcoming                      | GET    | /api/calendar/upcoming                     | ❌      | ✅ Works     | Upcoming events                   |
|                                        | calendar  | /statute-of-limitations        | GET    | /api/calendar/statute-of-limitations       | ❌      | ✅ Works     | SOL events                        |
|                                        | calendar  | /:id                           | GET    | /api/calendar/:id                          | ❌      | ✅ Works     | Get event                         |
|                                        | calendar  | /                              | POST   | /api/calendar                              | ❌      | ✅ Works     | Create event                      |
|                                        | calendar  | /:id                           | PUT    | /api/calendar/:id                          | ❌      | ✅ Works     | Update event                      |
|                                        | calendar  | /:id/complete                  | PUT    | /api/calendar/:id/complete                 | ❌      | ✅ Works     | Mark complete                     |
|                                        | calendar  | /:id                           | DELETE | /api/calendar/:id                          | ❌      | ✅ Works     | Delete event                      |
| **auth.controller.ts**                 |
|                                        | auth      | /health                        | HEAD   | /api/auth/health                           | ✅      | ✅ Works     | Health check                      |
|                                        | auth      | /health                        | GET    | /api/auth/health                           | ✅      | ✅ Works     | Health check                      |
|                                        | auth      | /register                      | POST   | /api/auth/register                         | ✅      | ✅ Works     | Register (20/min)                 |
|                                        | auth      | /login                         | POST   | /api/auth/login                            | ✅      | ✅ Works     | Login (20/min)                    |
|                                        | auth      | /refresh                       | POST   | /api/auth/refresh                          | ✅      | ✅ Works     | Refresh token (10/min)            |
| **users.controller.ts**                |
|                                        | users     | /                              | POST   | /api/users                                 | ❌      | ✅ Works     | Create (USER_MANAGE perm)         |
|                                        | users     | /                              | GET    | /api/users                                 | ❌      | ✅ Works     | List (USER_MANAGE perm)           |
|                                        | users     | /:id                           | GET    | /api/users/:id                             | ❌      | ✅ Works     | Get (USER_MANAGE perm)            |
|                                        | users     | /:id                           | PUT    | /api/users/:id                             | ❌      | ✅ Works     | Update (USER_MANAGE perm)         |
|                                        | users     | /:id                           | DELETE | /api/users/:id                             | ❌      | ✅ Works     | Delete (USER_MANAGE perm)         |

## Legend

- ✅ Works: Route is functional
- ❌ ERROR: Route is broken (returns error)
- ⚠️ Conflict: Route may not work due to controller conflicts
- 🔒 Auth Required (Public? = ❌)
- 🌐 No Auth Required (Public? = ✅)

## Critical Issues

1. **GET /api/billing/metrics** - Returns 404 (route conflict)
2. **GET /api/cases** - Returns 401 (should be public)
3. **billing-analytics.controller.ts** - Conflicts with billing.controller.ts

## Quick Fixes

1. Change `@Controller('billing')` to `@Controller('billing/analytics')` in billing-analytics.controller.ts
2. Update frontend to call `/api/billing/analytics/*` instead of `/api/billing/*`
3. Debug @Public() decorator in jwt-auth.guard.ts
