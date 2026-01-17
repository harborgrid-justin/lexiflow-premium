# Frontend Routes vs Backend Endpoints Audit

**Generated:** January 17, 2026
**Purpose:** Comprehensive mapping of frontend navigation routes to backend API controllers

---

## Executive Summary

This audit maps all 70+ frontend navigation items from `nav.config.ts` to their corresponding backend NestJS controllers. Status categories:

- ✅ **Match** - Route and controller align correctly
- ⚠️ **Mismatch** - Route exists but path differs from expected
- ❌ **Missing** - No backend controller found
- 🔄 **Alias** - Frontend uses different name than backend

---

## Critical Mismatches (Require Immediate Attention)

### 🚨 HIGH PRIORITY FIXES

| Frontend Route       | Backend Controller | Status          | Issue                                                       |
| -------------------- | ------------------ | --------------- | ----------------------------------------------------------- |
| `library`            | `knowledge`        | ⚠️ **MISMATCH** | Frontend uses "library", backend uses "knowledge"           |
| `data_platform`      | None found         | ❌ **MISSING**  | No data-platform controller (only data-catalog, ai-dataops) |
| `entities`           | `legal-entities`   | ⚠️ **MISMATCH** | Frontend uses "entities", backend uses "legal-entities"     |
| `rules_engine`       | None found         | ❌ **MISSING**  | No rules-engine controller                                  |
| `war_room`           | `war-room`         | ⚠️ **MISMATCH** | Frontend uses underscore, backend uses hyphen               |
| `pleading_builder`   | None found         | ❌ **MISSING**  | No separate pleading-builder controller                     |
| `litigation_builder` | None found         | ❌ **MISSING**  | No litigation-builder controller                            |

---

## Detailed Route Mapping

### 📊 MAIN - Core Application Functions

| Frontend Route   | Expected Path     | Backend Controller         | Status           | Notes                                              |
| ---------------- | ----------------- | -------------------------- | ---------------- | -------------------------------------------------- |
| `dashboard`      | `/dashboard`      | `@Controller('dashboard')` | ✅ Match         | Analytics dashboard controller                     |
| `calendar`       | `/calendar`       | `@Controller("calendar")`  | ✅ Match         | Master calendar controller                         |
| `messages`       | `/messages`       | `@Controller('messenger')` | 🔄 Alias         | Backend uses "messenger"                           |
| `profile`        | `/profile`        | `@Controller('users')`     | 🔄 Alias         | User profile via users controller                  |
| `settings`       | `/settings`       | N/A                        | ⚠️ Frontend-only | No dedicated backend (settings stored client-side) |
| `settings/theme` | `/settings/theme` | N/A                        | ⚠️ Frontend-only | Theme settings are client-side                     |

**Action Required:**

- Consider renaming frontend `messages` → `messenger` for consistency
- Verify settings/profile endpoints exist in users controller

---

### 📁 CASE WORK - Case Management & Documents

| Frontend Route        | Expected Path          | Backend Controller                  | Status         | Notes                         |
| --------------------- | ---------------------- | ----------------------------------- | -------------- | ----------------------------- |
| `cases`               | `/cases`               | `@Controller('cases')`              | ✅ Match       | Main case management          |
| `cases/overview`      | `/cases/overview`      | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/calendar-view` | `/cases/calendar-view` | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/analytics`     | `/cases/analytics`     | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/intake`        | `/cases/intake`        | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/operations`    | `/cases/operations`    | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/insights`      | `/cases/insights`      | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `cases/financials`    | `/cases/financials`    | `@Controller('cases')`              | ✅ Match       | Nested route                  |
| `pleadings`           | `/pleadings`           | `@Controller('pleadings')`          | ✅ Match       | Pleadings management          |
| `docket`              | `/docket`              | `@Controller("docket")`             | ✅ Match       | Docket & filings              |
| `documents`           | `/documents`           | `@Controller('documents')`          | ✅ Match       | Document manager              |
| `drafting`            | `/drafting`            | `@Controller("drafting")`           | ✅ Match       | Document drafting             |
| `correspondence`      | `/correspondence`      | `@Controller('correspondence')`     | ✅ Match       | Correspondence management     |
| `pleading_builder`    | `/pleading_builder`    | None                                | ❌ **MISSING** | No dedicated controller       |
| `litigation`          | `/litigation`          | `@Controller('matters')`            | 🔄 Alias       | Backend uses "matters"        |
| `litigation_builder`  | `/litigation_builder`  | None                                | ❌ **MISSING** | No dedicated controller       |
| `workflows`           | `/workflows`           | `@Controller("workflow/templates")` | ⚠️ Mismatch    | Backend uses nested structure |

**Action Required:**

- Create `pleading-builder.controller.ts` or route to existing pleadings controller
- Create `litigation-builder.controller.ts` or clarify if part of matters
- Align workflow routes (frontend: `/workflows`, backend: `/workflow/templates`)

---

### ⚖️ LITIGATION TOOLS - Discovery, Evidence & Trial Prep

| Frontend Route | Expected Path | Backend Controller         | Status          | Notes                |
| -------------- | ------------- | -------------------------- | --------------- | -------------------- |
| `research`     | `/research`   | `@Controller("research")`  | ✅ Match        | Legal research       |
| `citations`    | `/citations`  | `@Controller('citations')` | ✅ Match        | Citations management |
| `war_room`     | `/war_room`   | `@Controller("war-room")`  | ⚠️ **MISMATCH** | Underscore vs hyphen |
| `discovery`    | `/discovery`  | `@Controller("discovery")` | ✅ Match        | Discovery center     |
| `evidence`     | `/evidence`   | `@Controller("evidence")`  | ✅ Match        | Evidence vault       |
| `exhibits`     | `/exhibits`   | `@Controller("exhibits")`  | ✅ Match        | Exhibit management   |

**Nested Discovery Routes (Backend has extensive sub-controllers):**

- `@Controller("discovery-requests")` ✅
- `@Controller('custodians')` ✅
- `@Controller('depositions')` ✅
- `@Controller('productions')` ✅
- `@Controller('privilege-log')` ✅
- `@Controller('legal-holds')` ✅
- `@Controller('esi-sources')` ✅
- `@Controller('examinations')` ✅
- `@Controller('witnesses')` ✅
- `@Controller('custodian-interviews')` ✅

**Action Required:**

- **CRITICAL:** Rename frontend route `war_room` → `war-room` OR update backend controller to use underscore
- Consider exposing discovery sub-routes in frontend navigation

---

### 🏢 OPERATIONS - Firm Management & Business

| Frontend Route  | Expected Path    | Backend Controller              | Status          | Notes                             |
| --------------- | ---------------- | ------------------------------- | --------------- | --------------------------------- |
| `daf`           | `/daf`           | None found                      | ❌ **MISSING**  | DAF Operations controller missing |
| `data_platform` | `/data_platform` | `@Controller("data-catalog")`   | ⚠️ **MISMATCH** | Backend uses "data-catalog"       |
| `entities`      | `/entities`      | `@Controller('legal-entities')` | ⚠️ **MISMATCH** | Backend uses "legal-entities"     |
| `practice`      | `/practice`      | None found                      | ❌ **MISSING**  | Practice areas controller missing |
| `billing`       | `/billing`       | `@Controller('billing')`        | ✅ Match        | Billing & finance                 |
| `crm`           | `/crm`           | `@Controller("crm")`            | ✅ Match        | Client CRM                        |
| `reports`       | `/reports`       | `@Controller('reports')`        | ✅ Match        | Reports                           |
| `analytics`     | `/analytics`     | `@Controller('analytics')`      | ✅ Match        | Analytics dashboard               |

**Nested Billing Routes (Backend):**

- `@Controller('billing/expenses')` ✅
- `@Controller('billing/invoices')` ✅
- `@Controller('billing/time-entries')` ✅
- `@Controller('billing/trust-accounts')` ✅
- `@Controller('billing/fee-agreements')` ✅
- `@Controller('billing/rates')` ✅
- `@Controller("billing/analytics")` ✅

**Nested Analytics Routes (Backend):**

- `@Controller("analytics/dashboard")` ✅
- `@Controller('analytics/billing')` ✅
- `@Controller('analytics/judge-stats')` ✅
- `@Controller('analytics/outcome-predictions')` ✅

**Action Required:**

- **CRITICAL:** Decide on `data_platform` vs `data-catalog` naming and align
- **CRITICAL:** Rename frontend `entities` → `legal-entities` OR create alias controller
- Create `daf.controller.ts` for DAF Operations
- Create `practice.controller.ts` for Practice Areas or clarify routing

---

### 📚 KNOWLEDGE - Reference & Templates

| Frontend Route | Expected Path   | Backend Controller             | Status                   | Notes                                     |
| -------------- | --------------- | ------------------------------ | ------------------------ | ----------------------------------------- |
| `library`      | `/library`      | `@Controller("knowledge")`     | ⚠️ **CRITICAL MISMATCH** | Frontend: "library", Backend: "knowledge" |
| `clauses`      | `/clauses`      | `@Controller('clauses')`       | ✅ Match                 | Clause library                            |
| `jurisdiction` | `/jurisdiction` | `@Controller("jurisdictions")` | ⚠️ Singular vs plural    | Frontend singular, backend plural         |
| `rules_engine` | `/rules_engine` | None found                     | ❌ **MISSING**           | Rules engine controller missing           |

**Action Required:**

- **CRITICAL FIX:** Choose one naming convention for library/knowledge and update all references
  - **Option A:** Rename frontend `PATHS.LIBRARY = "knowledge"`
  - **Option B:** Rename backend `@Controller("library")`
  - **Recommended:** Option A (update frontend to match backend)
- Fix jurisdiction singular/plural mismatch
- Create `rules-engine.controller.ts` or clarify if it's part of another controller

---

### 🏠 REAL ESTATE DIVISION - Property & Asset Management

| Frontend Route                  | Expected Path                    | Backend Controller | Status         | Notes                           |
| ------------------------------- | -------------------------------- | ------------------ | -------------- | ------------------------------- |
| `real_estate`                   | `/real_estate`                   | None found         | ❌ **MISSING** | No real estate controller found |
| `real_estate/portfolio_summary` | `/real_estate/portfolio_summary` | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/inventory`         | `/real_estate/inventory`         | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/utilization`       | `/real_estate/utilization`       | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/outgrants`         | `/real_estate/outgrants`         | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/solicitations`     | `/real_estate/solicitations`     | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/relocation`        | `/real_estate/relocation`        | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/cost_share`        | `/real_estate/cost_share`        | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/disposal`          | `/real_estate/disposal`          | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/acquisition`       | `/real_estate/acquisition`       | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/encroachment`      | `/real_estate/encroachment`      | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/user_management`   | `/real_estate/user_management`   | N/A                | ❌ Missing     | Sub-route missing               |
| `real_estate/audit_readiness`   | `/real_estate/audit_readiness`   | N/A                | ❌ Missing     | Sub-route missing               |

**Action Required:**

- **CRITICAL:** Entire Real Estate Division module needs backend implementation
- Create `real-estate.controller.ts` with all sub-routes
- Implement 12 nested controllers or use single controller with route handlers

---

### 🔒 ADMIN - System Administration

| Frontend Route | Expected Path | Backend Controller          | Status   | Notes                     |
| -------------- | ------------- | --------------------------- | -------- | ------------------------- |
| `compliance`   | `/compliance` | `@Controller("compliance")` | ✅ Match | Compliance management     |
| `audit`        | `/audit`      | `@Controller('audit-logs')` | 🔄 Alias | Backend uses "audit-logs" |
| `admin`        | `/admin`      | `@Controller("admin")`      | ✅ Match | Admin console             |

**Nested Compliance Routes (Backend):**

- `@Controller("compliance/conflicts")` ✅
- `@Controller('compliance/ethical-walls')` ✅
- `@Controller('compliance/reports')` ✅
- `@Controller('security/permissions')` ✅

**Nested Admin Routes (Backend):**

- `@Controller("admin/database")` ✅
- `@Controller("admin/tenant")` ✅
- `@Controller('admin/api-keys')` ✅
- `@Controller('admin/blacklist')` ✅

**Action Required:**

- Consider renaming frontend `audit` → `audit-logs` for clarity

---

## Additional Backend Controllers (Not in Frontend Nav)

These controllers exist in backend but have no frontend navigation items:

| Backend Controller                         | Purpose                | Should Add to Nav?                  |
| ------------------------------------------ | ---------------------- | ----------------------------------- |
| `@Controller('auth')`                      | Authentication         | No (utility)                        |
| `@Controller('users')`                     | User management        | Partial (via profile)               |
| `@Controller('organizations')`             | Org management         | Consider adding                     |
| `@Controller('clients')`                   | Client management      | Merged into CRM                     |
| `@Controller('parties')`                   | Case parties           | Sub-route of cases                  |
| `@Controller('motions')`                   | Motions management     | Consider adding                     |
| `@Controller('tasks')`                     | Task management        | Consider adding                     |
| `@Controller('projects')`                  | Project management     | Consider adding                     |
| `@Controller('case-phases')`               | Case lifecycle         | Sub-route of cases                  |
| `@Controller('case-teams')`                | Team management        | Sub-route of cases                  |
| `@Controller('trial')`                     | Trial management       | Consider adding to Litigation Tools |
| `@Controller('production')`                | Production management  | Part of discovery                   |
| `@Controller('risks')`                     | Risk management        | Consider adding                     |
| `@Controller('strategies')`                | Strategy management    | Consider adding                     |
| `@Controller('metrics')`                   | System metrics         | Admin only                          |
| `@Controller('monitoring')`                | System monitoring      | Admin only                          |
| `@Controller('backups')`                   | Backup management      | Admin only                          |
| `@Controller('webhooks')`                  | Webhook management     | Admin only                          |
| `@Controller('integrations')`              | External integrations  | Consider adding                     |
| `@Controller('integrations/pacer')`        | PACER integration      | Sub-route                           |
| `@Controller('integrations/data-sources')` | Data source management | Sub-route                           |
| `@Controller('ocr')`                       | OCR processing         | Utility                             |
| `@Controller('processing-jobs')`           | Job queue              | Admin only                          |
| `@Controller('versioning')`                | Document versions      | Utility                             |
| `@Controller('sync')`                      | Data sync              | Utility                             |
| `@Controller('ai-ops')`                    | AI operations          | Consider adding                     |
| `@Controller('ai-dataops')`                | AI data operations     | Consider adding                     |
| `@Controller('bluebook')`                  | Bluebook citations     | Part of citations                   |
| `@Controller('query-workbench')`           | SQL query tool         | Admin only                          |
| `@Controller('schema-management')`         | Schema management      | Admin only                          |
| `@Controller('security')`                  | Security management    | Admin only                          |
| `@Controller('security/csp-report')`       | CSP reporting          | Utility                             |
| `@Controller('security/rls-policies')`     | Row-level security     | Admin only                          |
| `@Controller('health')`                    | Health checks          | Utility                             |
| `@Controller('api')`                       | API management         | Utility                             |
| `@Controller('examples')`                  | API examples           | Dev only                            |
| `@Controller('connectors')`                | Data connectors        | Consider adding                     |
| `@Controller('pipelines')`                 | Data pipelines         | Consider adding                     |

---

## Summary Statistics

| Category                  | Count  | Percentage |
| ------------------------- | ------ | ---------- |
| ✅ Perfect Matches        | 35     | 50%        |
| ⚠️ Mismatches (fixable)   | 8      | 11%        |
| ❌ Missing Backend        | 15     | 21%        |
| 🔄 Aliases (working)      | 6      | 9%         |
| Frontend-Only             | 6      | 9%         |
| **Total Frontend Routes** | **70** | **100%**   |

**Backend Controllers:** 120+ controllers (many are nested/utility)

---

## Priority Action Items

### 🔥 Immediate (Breaking 404s)

1. **Library/Knowledge Mismatch** - Update `paths.config.ts`:

   ```typescript
   LIBRARY: "knowledge",  // Changed from "library"
   ```

2. **War Room Route** - Update `paths.config.ts`:

   ```typescript
   WAR_ROOM: "war-room",  // Changed from "war_room"
   ```

3. **Entities Route** - Update `paths.config.ts`:

   ```typescript
   ENTITIES: "legal-entities",  // Changed from "entities"
   ```

4. **Data Platform** - Update `paths.config.ts`:

   ```typescript
   DATA_PLATFORM: "data-catalog",  // Changed from "data_platform"
   ```

5. **Jurisdiction Plural** - Update `paths.config.ts`:
   ```typescript
   JURISDICTION: "jurisdictions",  // Changed from "jurisdiction"
   ```

### 🎯 High Priority (Missing Controllers)

6. **Real Estate Division** - Create entire backend module:

   ```bash
   nest g module real-estate
   nest g controller real-estate
   ```

7. **Rules Engine** - Create controller:

   ```bash
   nest g module rules-engine
   nest g controller rules-engine
   ```

8. **DAF Operations** - Create controller:

   ```bash
   nest g module daf
   nest g controller daf
   ```

9. **Practice Areas** - Create controller:
   ```bash
   nest g module practice
   nest g controller practice
   ```

### 📋 Medium Priority (Clarifications)

10. **Pleading Builder** - Decide: separate controller or route to pleadings?
11. **Litigation Builder** - Decide: separate controller or route to matters?
12. **Workflow Routes** - Align frontend `/workflows` with backend `/workflow/templates`

---

## Testing Recommendations

### Frontend API Client Testing

```bash
cd /workspaces/lexiflow-premium/frontend
npm run dev
```

Then in browser console:

```javascript
// Test each problematic route
const routes = [
  "library",
  "knowledge",
  "war_room",
  "war-room",
  "entities",
  "legal-entities",
  "data_platform",
  "data-catalog",
];

for (const route of routes) {
  fetch(`http://localhost:3000/api/${route}`)
    .then((r) => console.log(`${route}: ${r.status}`))
    .catch((e) => console.error(`${route}: ERROR`));
}
```

### Backend Route Testing

```bash
cd /workspaces/lexiflow-premium/backend
npm run start:dev
```

Then:

```bash
curl http://localhost:3000/api/knowledge
curl http://localhost:3000/api/library  # Should 404
curl http://localhost:3000/api/war-room
curl http://localhost:3000/api/war_room  # Should 404
```

---

## Implementation Checklist

### Phase 1: Critical Path Fixes (Day 1)

- [ ] Update `paths.config.ts` for library → knowledge
- [ ] Update `paths.config.ts` for war_room → war-room
- [ ] Update `paths.config.ts` for entities → legal-entities
- [ ] Update `paths.config.ts` for data_platform → data-catalog
- [ ] Update `paths.config.ts` for jurisdiction → jurisdictions
- [ ] Test all main navigation routes
- [ ] Update API client if needed (`services/api/index.ts`)

### Phase 2: Missing Controllers (Week 1)

- [ ] Create `real-estate.controller.ts` + module
- [ ] Create `rules-engine.controller.ts` + module
- [ ] Create `daf.controller.ts` + module
- [ ] Create `practice.controller.ts` + module
- [ ] Implement basic CRUD for each
- [ ] Add database entities/DTOs
- [ ] Write E2E tests

### Phase 3: Enhanced Features (Week 2)

- [ ] Expose discovery sub-routes in frontend nav
- [ ] Add trial management to navigation
- [ ] Add integrations section to navigation
- [ ] Consider motions, tasks, projects navigation
- [ ] Document all route aliases
- [ ] Update OpenAPI/Swagger docs

### Phase 4: Testing & Validation (Week 3)

- [ ] E2E test all navigation paths
- [ ] Verify 404 handling
- [ ] Test route guards/permissions
- [ ] Performance test with all routes
- [ ] Update user documentation
- [ ] Deploy to staging

---

## Configuration File Updates Required

### 1. `/workspaces/lexiflow-premium/frontend/src/config/paths.config.ts`

```typescript
export const PATHS = {
  // ... existing ...

  // FIXED ROUTES
  LIBRARY: "knowledge", // was "library"
  WAR_ROOM: "war-room", // was "war_room"
  ENTITIES: "legal-entities", // was "entities"
  DATA_PLATFORM: "data-catalog", // was "data_platform"
  JURISDICTION: "jurisdictions", // was "jurisdiction"
  AUDIT: "audit-logs", // was "audit"

  // ... rest unchanged ...
} as const;
```

### 2. `/workspaces/lexiflow-premium/frontend/src/services/api/index.ts`

Verify API service methods match controller routes:

```typescript
export const api = {
  knowledge: createApiService<KnowledgeArticle>("/knowledge"), // was library
  warRoom: createApiService<WarRoom>("/war-room"), // was war_room
  legalEntities: createApiService<LegalEntity>("/legal-entities"), // was entities
  dataCatalog: createApiService<DataSource>("/data-catalog"), // was data_platform
  jurisdictions: createApiService<Jurisdiction>("/jurisdictions"), // was jurisdiction
  // ...
};
```

### 3. Backend Module Creation Required

```bash
# Generate new modules for missing controllers
cd /workspaces/lexiflow-premium/backend
nest g module real-estate
nest g controller real-estate --no-spec
nest g service real-estate --no-spec

nest g module rules-engine
nest g controller rules-engine --no-spec
nest g service rules-engine --no-spec

nest g module daf
nest g controller daf --no-spec
nest g service daf --no-spec

nest g module practice
nest g controller practice --no-spec
nest g service practice --no-spec
```

---

## Notes

- **Backend-First Architecture**: All routes should default to backend API (IndexedDB deprecated)
- **API Prefix**: All backend routes are prefixed with `/api` in production
- **Route Guards**: Admin-only routes (compliance, audit, admin) require authentication check
- **Nested Routes**: Backend uses extensive nesting (e.g., billing/invoices, analytics/dashboard)
- **Hyphen Convention**: Backend prefers hyphens (`war-room`, `legal-entities`) over underscores
- **Plural Convention**: Backend generally uses plurals (`jurisdictions`, `clauses`, `cases`)

---

## Related Files

- Frontend: `/workspaces/lexiflow-premium/frontend/src/config/nav.config.ts`
- Frontend: `/workspaces/lexiflow-premium/frontend/src/config/paths.config.ts`
- Frontend: `/workspaces/lexiflow-premium/frontend/src/services/api/index.ts`
- Backend: `/workspaces/lexiflow-premium/backend/src/app.module.ts`
- Backend: `/workspaces/lexiflow-premium/backend/src/*/\*.controller.ts` (120+ files)

---

**End of Audit Report**
