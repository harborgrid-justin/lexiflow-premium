# LexiFlow Route Aliases & Navigation Documentation

## Overview
This document provides a comprehensive reference for all frontend routes, their corresponding backend API endpoints, and any aliases used for backward compatibility.

**Last Updated**: 2025-01-17 (Phase 1-3 Implementation Complete)

## Route Alignment Philosophy
- **Frontend routes** use file-based routing (directory names become URL segments)
- **Backend controllers** use NestJS `@Controller()` decorators
- **PATHS constants** defined in `frontend/src/config/paths.config.ts`
- **Navigation items** defined in `frontend/src/config/nav.config.ts`

---

## Core Navigation Routes

### Dashboard & Main
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/dashboard` | `/api/analytics/dashboard` | Dashboard | - |
| `/calendar` | `/api/calendar` | Master Calendar | - |
| `/messages` | `/api/messenger` | Secure Messenger | - |
| `/profile` | `/api/users/profile` | My Profile | - |
| `/settings` | N/A (client-only) | Settings | - |

---

## Case Management Routes

### Primary Case Routes
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/cases` | `/api/cases` | Case Management | `/matters` (deprecated) |
| `/cases/create` | POST `/api/cases` | Create Case | - |
| `/cases/overview` | `/api/cases/overview` | Overview | `/matters/overview` |
| `/cases/calendar-view` | `/api/cases/calendar` | Calendar | `/matters/calendar-view` |
| `/cases/analytics` | `/api/cases/analytics` | Analytics | `/matters/analytics` |
| `/cases/intake` | `/api/cases/intake` | Intake | `/matters/intake` |
| `/cases/operations` | `/api/cases/operations` | Operations | `/matters/operations` |
| `/cases/insights` | `/api/cases/insights` | Insights | `/matters/insights` |
| `/cases/financials` | `/api/cases/financials` | Financials | `/matters/financials` |

**Note**: `matters` is a deprecated alias. All new code should use `cases`.

### Document Management
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/documents` | `/api/documents` | Document Manager | - |
| `/drafting` | `/api/drafting` | Drafting & Assembly | - |
| `/pleadings` | `/api/pleadings` | Pleadings | - |
| `/pleading_builder` | `/api/pleadings/builder` | Pleading Builder | - |
| `/docket` | `/api/docket` | Docket & Filings | - |
| `/correspondence` | `/api/communications` | Correspondence | - |

### Workflow & Litigation
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/workflows` | `/api/workflow` | Case Workflows | - |
| `/litigation` | `/api/cases` (with type filter) | Litigation Matters | - |
| `/litigation_builder` | `/api/strategies` | Litigation Strategy | - |

---

## Litigation Tools Routes

### Discovery Suite (NEW: Phase 3 Expansion)
| Frontend Route | Backend API | Navigation Label | Parent |
|----------------|-------------|------------------|--------|
| `/discovery` | `/api/discovery` | Discovery Center | - |
| `/discovery/requests` | `/api/discovery/requests` | Requests | Discovery Center |
| `/discovery/responses` | `/api/discovery/responses` | Responses | Discovery Center |
| `/discovery/productions` | `/api/discovery/productions` | Productions | Discovery Center |
| `/discovery/timeline` | `/api/discovery/timeline` | Timeline | Discovery Center |

### Evidence & Exhibits
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/evidence` | `/api/evidence` | Evidence Vault | - |
| `/exhibits` | `/api/exhibits` | Exhibit Pro | - |

### Trial Management (NEW: Phase 3 Addition)
| Frontend Route | Backend API | Navigation Label | Parent |
|----------------|-------------|------------------|--------|
| `/trial` | `/api/trial` | Trial Management | - |
| `/trial/calendar` | `/api/trial/calendar` | Trial Calendar | Trial Management |
| `/trial/witnesses` | `/api/trial/witnesses` | Witnesses | Trial Management |
| `/trial/exhibits` | `/api/trial/exhibits` | Trial Exhibits | Trial Management |
| `/trial/motions` | `/api/trial/motions-in-limine` | Motions in Limine | Trial Management |
| `/trial/notes` | `/api/trial/notes` | Trial Notes | Trial Management |

### Research & Legal Intelligence
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/research` | `/api/research` | Research | - |
| `/citations` | `/api/citations` | Citations | - |
| `/war-room` | `/api/war-room` | War Room | `/war_room` (old underscore format) |

---

## Operations Routes

### Firm Operations
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/billing` | `/api/billing` | Billing & Finance | - |
| `/crm` | `/api/crm` | Client CRM | - |
| `/reports` | `/api/reports` | Reports | - |
| `/analytics` | `/api/analytics` | Analytics | - |

### Legal Entities & Practice (Phase 2 Additions)
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/legal-entities` | `/api/legal-entities` | Entity Director | `/entities` (deprecated) |
| `/practice` | `/api/practice` | Practice Areas | - |
| `/daf` | `/api/daf` | DAF Operations | - |

### Data Platform
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/data-catalog` | `/api/data-catalog` | Data Platform | `/data_platform` (deprecated) |

---

## Knowledge Routes

### Knowledge Base & Templates
| Frontend Route | Backend API | Navigation Label | Alias |
|----------------|-------------|------------------|-------|
| `/knowledge` | `/api/knowledge/articles` | Knowledge Base | `/library` (deprecated) |
| `/clauses` | `/api/clauses` | Clause Library | `/catalog/clauses` (deprecated) |
| `/jurisdictions` | `/api/jurisdictions` | Jurisdictions | `/jurisdiction` (singular, deprecated) |
| `/rules-engine` | `/api/rules-engine` | Rules Engine | - |

**Critical Notes**:
- `/library` → `/knowledge` (directory renamed in Phase 1)
- Backend `/knowledge` is health check, use `/knowledge/articles` for data
- `/catalog/clauses` moved to `/clauses` (Phase 1 fix)

---

## Real Estate Division Routes (Phase 2 Implementation)

### Portfolio Management
| Frontend Route | Backend API | Navigation Label | Parent |
|----------------|-------------|------------------|--------|
| `/real_estate` | `/api/real-estate` | Real Estate Division | - |
| `/real_estate/portfolio_summary` | `/api/real-estate/portfolio-summary` | Portfolio Summary | Real Estate |
| `/real_estate/inventory` | `/api/real-estate/inventory` | Inventory (RPUID) | Real Estate |
| `/real_estate/utilization` | `/api/real-estate/utilization` | Utilization Analytics | Real Estate |

### Transactions
| Frontend Route | Backend API | Navigation Label | Parent |
|----------------|-------------|------------------|--------|
| `/real_estate/outgrants` | `/api/real-estate/outgrants` | Outgrants & Revenue | Real Estate |
| `/real_estate/solicitations` | `/api/real-estate/solicitations` | Solicitations | Real Estate |
| `/real_estate/relocation` | `/api/real-estate/relocation` | Relocation | Real Estate |
| `/real_estate/cost_share` | `/api/real-estate/cost-share` | Cost Share Programs | Real Estate |
| `/real_estate/disposal` | `/api/real-estate/disposal` | Disposal Actions | Real Estate |
| `/real_estate/acquisition` | `/api/real-estate/acquisition` | Land Acquisition | Real Estate |
| `/real_estate/encroachment` | `/api/real-estate/encroachment` | Encroachment | Real Estate |

### Administration
| Frontend Route | Backend API | Navigation Label | Parent |
|----------------|-------------|------------------|--------|
| `/real_estate/user_management` | `/api/real-estate/users` | User Management | Real Estate |
| `/real_estate/audit_readiness` | `/api/real-estate/audit` | Audit Readiness (CFI) | Real Estate |

---

## Admin Routes

### System Administration
| Frontend Route | Backend API | Navigation Label | Admin Required |
|----------------|-------------|------------------|----------------|
| `/compliance` | `/api/compliance` | Compliance | ✅ Yes |
| `/audit` | `/api/admin/audit-logs` | Audit Logs | ✅ Yes |
| `/admin` | `/api/admin` | Admin Console | ✅ Yes |

---

## Route Alias Migration Guide

### Phase 1 Critical Fixes (Completed 2025-01-17)
**Issue**: Major path mismatches causing 404 errors

| Old Frontend Route | New Frontend Route | Backend API | Status |
|--------------------|-------------------|-------------|--------|
| `/library` | `/knowledge` | `/api/knowledge/articles` | ✅ Fixed |
| `/entities` | `/legal-entities` | `/api/legal-entities` | ✅ Fixed |
| `/data_platform` | `/data-catalog` | `/api/data-catalog` | ✅ Fixed |
| `/jurisdiction` | `/jurisdictions` | `/api/jurisdictions` | ✅ Fixed |
| `/war_room` | `/war-room` | `/api/war-room` | ✅ Fixed |

**Actions Taken**:
1. ✅ Updated `paths.config.ts` constants
2. ✅ Renamed frontend route directories
3. ✅ Fixed API endpoint paths in service files
4. ✅ Added response format transformations for pagination

### Phase 2 Missing Controllers (Completed 2025-01-17)
**Issue**: Navigation items pointing to non-existent backends

| Frontend Route | Backend Module | Status |
|----------------|---------------|--------|
| `/real-estate` | `RealEstateModule` | ✅ Created |
| `/rules-engine` | `RulesEngineModule` | ✅ Created |
| `/daf` | `DafModule` | ✅ Created |
| `/practice` | `PracticeModule` | ✅ Created |

**Actions Taken**:
1. ✅ Created 4 production-grade backend modules with full CRUD
2. ✅ Added TypeORM entities with soft deletes
3. ✅ Registered modules in `app.imports.ts`
4. ✅ Created E2E test suites for all 4 modules
5. ✅ Generated database migration file

### Phase 3 Enhanced Navigation (Completed 2025-01-17)
**Issue**: Hidden/missing sub-routes in navigation

| Parent Route | New Sub-Routes | Status |
|--------------|----------------|--------|
| `/discovery` | requests, responses, productions, timeline | ✅ Added |
| `/trial` | calendar, witnesses, exhibits, motions, notes | ✅ Added |

**Actions Taken**:
1. ✅ Added Discovery sub-routes to `paths.config.ts`
2. ✅ Added Trial management paths to `paths.config.ts`
3. ✅ Exposed Discovery children in `nav.config.ts`
4. ✅ Exposed Trial children in `nav.config.ts`
5. ✅ Updated this documentation

---

## Backend API Response Formats

### Standard Pagination Format
All list endpoints return:
```typescript
{
  data: T[],
  total: number,
  page?: number,
  limit?: number,
  hasMore?: boolean
}
```

### Frontend Transformation Pattern
```typescript
// In API service files:
const response = await apiClient.get<{ data: T[], total: number }>('/endpoint');
return response.data.data; // Extract array from pagination wrapper

// Or for full pagination:
return {
  items: response.data.data,
  total: response.data.total,
  page: response.data.page || 1,
  pageSize: response.data.limit || 50,
  hasMore: (response.data.page || 1) * (response.data.limit || 50) < response.data.total
};
```

---

## Common Pitfalls

### 1. Array.map() Errors
**Symptom**: `jurisdictions.map is not a function`
**Cause**: Backend returns `{data: [], total: number}`, frontend expects `[]`
**Fix**: Extract `data` array in API service before returning

### 2. 404 on Catalog Endpoints
**Symptom**: `404 /catalog/clauses`
**Cause**: Backend uses `/clauses`, not `/catalog/clauses`
**Fix**: Update API endpoint paths in service files

### 3. Knowledge Base "Something Went Wrong"
**Symptom**: Generic error on knowledge base route
**Cause**: Calling `/knowledge` (health check) instead of `/knowledge/articles`
**Fix**: Use correct endpoint in API service

### 4. Sidebar Link 404s
**Symptom**: Navigation link leads to 404
**Cause**: Path constant doesn't match directory name or backend path
**Fix**: Align all three: `paths.config.ts`, directory name, backend `@Controller()`

---

## OpenAPI/Swagger Documentation

Backend API documentation available at: `http://localhost:3000/api/docs`

### Newly Added Endpoints (Phase 2)

#### Real Estate API
- `GET /api/real-estate` - List all properties
- `GET /api/real-estate/portfolio-summary` - Portfolio summary
- `GET /api/real-estate/inventory` - Property inventory (RPUID)
- `GET /api/real-estate/utilization` - Utilization analytics
- `GET /api/real-estate/:id` - Get property by ID
- `POST /api/real-estate` - Create property
- `PUT /api/real-estate/:id` - Update property
- `DELETE /api/real-estate/:id` - Delete property (soft delete)

#### Rules Engine API
- `GET /api/rules-engine` - List all rules
- `GET /api/rules-engine/categories` - Get rule categories
- `GET /api/rules-engine/:id` - Get rule by ID
- `POST /api/rules-engine` - Create rule
- `POST /api/rules-engine/execute` - Execute a rule
- `PUT /api/rules-engine/:id` - Update rule
- `DELETE /api/rules-engine/:id` - Delete rule (soft delete)

#### DAF Operations API
- `GET /api/daf` - List all operations
- `GET /api/daf/dashboard` - Operations dashboard
- `GET /api/daf/compliance` - Compliance status
- `GET /api/daf/:id` - Get operation by ID
- `POST /api/daf` - Create operation
- `PUT /api/daf/:id` - Update operation
- `DELETE /api/daf/:id` - Delete operation (soft delete)

#### Practice Areas API
- `GET /api/practice` - List all practice areas
- `GET /api/practice/statistics` - Practice area statistics
- `GET /api/practice/:id` - Get practice area by ID
- `POST /api/practice` - Create practice area
- `PUT /api/practice/:id` - Update practice area
- `DELETE /api/practice/:id` - Delete practice area (soft delete)

---

## Testing the Routes

### Frontend Testing
```bash
# Start frontend dev server
npm run dev  # Root directory, runs on port 3400

# Navigate to routes in browser:
http://localhost:3400/knowledge
http://localhost:3400/legal-entities
http://localhost:3400/data-catalog
http://localhost:3400/jurisdictions
http://localhost:3400/war-room
http://localhost:3400/real-estate
http://localhost:3400/rules-engine
http://localhost:3400/daf
http://localhost:3400/practice
http://localhost:3400/discovery/requests
http://localhost:3400/trial/calendar
```

### Backend Testing
```bash
cd backend

# Run E2E tests for new modules
npm run test:e2e test/real-estate/real-estate.e2e-spec.ts
npm run test:e2e test/rules-engine/rules-engine.e2e-spec.ts
npm run test:e2e test/daf/daf.e2e-spec.ts
npm run test:e2e test/practice/practice.e2e-spec.ts

# Run migrations
npm run migration:run

# Start backend dev server
npm run start:dev  # Runs on port 3000

# Test API endpoints:
curl http://localhost:3000/api/real-estate
curl http://localhost:3000/api/rules-engine
curl http://localhost:3000/api/daf
curl http://localhost:3000/api/practice
```

---

## Implementation Status Summary

### ✅ Phase 1: Critical Path Fixes (100% Complete)
- [x] Update paths.config.ts with backend-aligned paths
- [x] Rename frontend route directories
- [x] Fix API endpoint paths in service files
- [x] Add response format transformations

### ✅ Phase 2: Missing Controllers (100% Complete)
- [x] Create real-estate.controller.ts + module
- [x] Create rules-engine.controller.ts + module
- [x] Create daf.controller.ts + module
- [x] Create practice.controller.ts + module
- [x] Implement basic CRUD for each
- [x] Add database entities/DTOs
- [x] Write E2E tests
- [x] Register modules in app.imports.ts
- [x] Generate database migration

### ✅ Phase 3: Enhanced Features (100% Complete)
- [x] Expose discovery sub-routes in frontend nav
- [x] Add trial management to navigation
- [x] Add trial sub-routes (calendar, witnesses, exhibits, motions, notes)
- [x] Document all route aliases
- [x] Update OpenAPI/Swagger docs (via this guide)

---

## Maintenance Notes

### When Adding New Routes
1. **Define path constant** in `paths.config.ts`
2. **Create directory** in `frontend/src/routes/` matching the path
3. **Create backend controller** with matching `@Controller()` path (use hyphens not underscores)
4. **Add navigation item** in `nav.config.ts` with appropriate icon and category
5. **Create frontend API service** in `frontend/src/api/` or `frontend/src/lib/frontend-api/`
6. **Handle pagination** - extract `data` array if backend returns `{data, total}`
7. **Document alias** if replacing/deprecating an old route
8. **Update this file** with the new route mapping

### Naming Conventions
- **Frontend routes**: Use hyphens for multi-word routes (`legal-entities`, `war-room`)
- **Backend controllers**: Match frontend with `@Controller('legal-entities')`
- **Path constants**: Use SCREAMING_SNAKE_CASE (`LEGAL_ENTITIES`, `WAR_ROOM`)
- **API services**: Use camelCase file names (`legalEntities-api.ts`)

---

## Related Files

- Frontend path config: `frontend/src/config/paths.config.ts`
- Frontend navigation: `frontend/src/config/nav.config.ts`
- Backend module registry: `backend/src/app.imports.ts`
- Backend controllers: `backend/src/[module]/[module].controller.ts`
- Frontend API services: `frontend/src/api/` and `frontend/src/lib/frontend-api/`

---

**Last Audit**: 2025-01-17 22:45 UTC
**Next Review**: After any major feature additions or navigation restructuring

