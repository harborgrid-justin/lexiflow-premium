# LexiFlow AI Legal Suite - Copilot Instructions

## Project Overview
LexiFlow is an enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations. The system uses a **backend-first architecture** (as of 2025-12-18) with PostgreSQL + NestJS backend as the primary data layer. Legacy IndexedDB mode is deprecated and only available for development debugging.

## Architecture: Dual Stack System

### Frontend Stack (React + Backend API)
- **Framework**: React 18 with Vite, TypeScript strict mode
- **Data Layer**: Backend-first via consolidated API services (`services/api/index.ts`) - 90+ domain services
- **State Management**: Custom React Query implementation (`services/queryClient.ts`) - NOT using external react-query library
- **Fallback**: Legacy IndexedDB wrapper (`services/db.ts`) - DEPRECATED for production as of 2025-12-18
- **Architecture Pattern**: Repository pattern via `DataService` facade (`services/dataService.ts`) with backend/local routing

### Backend Stack (NestJS + PostgreSQL)
- **Framework**: NestJS 11.x with TypeORM for document management only
- **Database**: PostgreSQL with TypeORM migrations (run via `npm run migration:run` in `/backend`)
- **Queue System**: Bull + Redis for OCR and background jobs
- **Testing**: Jest with separate configs for unit (`jest.config.js`) and E2E (`test/jest-e2e.json`)

## Critical Developer Workflows

### Frontend Development
```bash
npm run dev          # Vite dev server (root directory)
npm run build        # Production build
```

### Backend Development (from `/backend` directory)
```bash
npm run start:dev           # NestJS watch mode
npm run test                # Unit tests
npm run test:e2e           # E2E tests with supertest
npm run migration:generate # Generate new TypeORM migration
npm run migration:run      # Run pending migrations
npm run seed               # Seed test data
npm run db:reset           # Revert + run + seed
```

### Testing Pattern
- Backend E2E tests use test database (configured in `test/setup.ts`)
- Always clean up test data in `afterEach` hooks
- Frontend has no test suite yet - data layer is simulated

## Project-Specific Conventions

### Component Organization (Post-Reorganization)
- **Domain folders**: `components/[domain]/` for feature modules (e.g., `components/case-list/`, `components/discovery/`)
- **Shared components**: `components/common/` for reusable UI primitives
- **Layout components**: `components/layout/` for Sidebar, TopBar, etc.
- **Module registration**: All lazy-loaded via `config/modules.tsx` using `lazyWithPreload` pattern
- **Import pattern**: Use `lazyWithPreload` helper for code-splitting with preload capability

Example from `config/modules.tsx`:
```typescript
const Dashboard = lazyWithPreload(() => import('../components/dashboard/Dashboard'));
```

### Data Access Patterns
**ALWAYS use the `DataService` facade** - automatically routes to backend API in production:
```typescript
import { DataService } from '../services/dataService';

// ✅ Correct (routes to backend API by default)
const cases = await DataService.cases.getAll();
const case = await DataService.cases.add(newCase);

// ✅ Also correct (direct API access)
import { api } from '../services/api';
const cases = await api.cases.getAll();

// ❌ Wrong - bypasses API layer & integration events
import { db } from '../services/db';
await db.getAll('cases');  // DEPRECATED - IndexedDB direct access
```

**Backend API Configuration**:
- Default: Backend API enabled (production mode)
- Override: Set `localStorage.VITE_USE_INDEXEDDB='true'` for legacy mode (shows deprecation warning)
- Check mode: `import { isBackendApiEnabled } from '../services/api';`

**Available DataService domains**: `cases`, `docket`, `evidence`, `documents`, `pleadings`, `hr`, `workflow`, `billing`, `discovery`, `trial`, `compliance`, `admin`, `correspondence`, `quality`, `catalog`, `backup`, `profile`, `marketing`, `jurisdiction`, `knowledge`, `crm`, `analytics`, `operations`, `security`

### Repository Pattern
- Base class: `services/core/Repository.ts` with LRU caching and event listeners
- Custom ORM: `services/core/microORM.ts` abstracts IndexedDB operations
- Integration events: Wrapped repositories in `dataService.ts` publish `SystemEventType` events to `IntegrationOrchestrator`
- Cache invalidation: Use `queryClient.invalidate()` after mutations

### Type System
- **Shared types**: Import from `types.ts` root barrel export (which re-exports from `types/`)
- **Domain types**: `types/models.ts`, `types/enums.ts`, `types/integrationTypes.ts`, `types/ai.ts`
- **BaseEntity**: All entities extend `{ id: string; createdAt: string; updatedAt: string; userId: UserId }`

### Styling & Theming
- **Tailwind CSS**: Utility-first with semantic tokens in `theme/tokens.ts`
- **Theme system**: `ThemeContext` provides light/dark mode, use `useTheme()` hook
- **Color palette**: Slate (neutral), Blue (primary), Emerald (success), Amber (warning), Rose (error), Purple (accent)
- **Convention**: Use semantic color names from tokens, not raw Tailwind colors

### Web Workers
Used for CPU-intensive tasks (full-text search, graph physics, encryption):
- `services/searchWorker.ts` - Off-thread search indexing
- `services/cryptoWorker.ts` - Encryption operations
- `hooks/useNexusGraph.ts` - Physics simulation for graph layouts

Pattern: Create worker via `new Worker(url)` where `url = URL.createObjectURL(blob)`

### Backend Module Structure
Each NestJS domain follows this pattern:
```
src/[domain]/
├── dto/                    # class-validator DTOs
├── entities/              # TypeORM entities
├── [domain].controller.ts # REST endpoints (@Controller)
├── [domain].service.ts    # Business logic
├── [domain].module.ts     # Module definition
└── tests/                 # Unit tests (*.spec.ts)
```

Key modules: `documents`, `document-versions`, `clauses`, `pleadings`, `ocr`, `processing-jobs`, `cases`, `auth`, `users`, `compliance`, `communications`

### Backend Testing Conventions
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests
- E2E tests extend from `test/setup.ts` for automatic DB lifecycle
- Mock external services (Redis, file system) in unit tests
- Use `supertest` for HTTP assertions in E2E

## Integration Points

### Frontend ↔ Backend (FULLY INTEGRATED as of 2025-12-18)
**Backend-first architecture** - frontend defaults to PostgreSQL/NestJS backend:
- **API Layer**: `services/api/index.ts` - 90+ consolidated domain services
- **REST API**: All CRUD operations via backend (Swagger at `/api/docs`)
- **Fallback**: Legacy IndexedDB mode available via `localStorage.VITE_USE_INDEXEDDB='true'` (DEPRECATED)
- **Configuration**: `services/apiConfig.ts` - backend mode detection and warnings
- **Routing**: `DataService` automatically routes requests based on `isBackendApiEnabled()`

### External APIs
- **Google Gemini API**: Legal research and citation analysis (`services/geminiService.ts`)
- **Configuration**: API keys stored in localStorage via `StorageUtils` (not in .env for demo purposes)

### Event System
`IntegrationOrchestrator` (`services/integrationOrchestrator.ts`) publishes domain events:
- `CASE_CREATED`, `DOCKET_INGESTED`, `DOCUMENT_UPLOADED`, `TIME_LOGGED`
- Subscribers defined in same file (e.g., conflict checks, compliance scans)
- Pattern: Async event handlers with try/catch and logging

## Navigation & Routing

### Route Configuration
- **Path constants**: Defined in `config/paths.config.ts` as `PATHS.DASHBOARD`, `PATHS.CASES`, etc.
- **Navigation config**: `config/nav.config.ts` defines `NAVIGATION_ITEMS` array
- **Module registry**: `services/moduleRegistry.ts` maps paths to lazy-loaded components
- **Initialization**: Call `initializeModules()` from `config/modules.tsx` on app bootstrap

### Holographic Routing
Custom routing system (`services/holographicRouting.ts`) supports minimizable windows and a dock metaphor - windows can float and minimize to dock.

## Common Pitfalls & Solutions

### Issue: "Query not invalidating after mutation"
**Solution**: Ensure you're calling `queryClient.invalidate(['queryKey'])` AND publishing integration events. The DataService wrapped repositories do both.

### Issue: "Component import not found after reorganization"
**Solution**: Import paths changed - use domain-based paths like `components/dashboard/Dashboard` not `components/Dashboard`. Check `config/modules.tsx` for canonical paths.

### Issue: "Backend migration fails"
**Solution**: Check `src/database/data-source.ts` for connection config. Ensure PostgreSQL is running. Run `npm run migration:show` to see pending migrations.

### Issue: "IndexedDB version error"
**Solution**: IndexedDB schema is managed in `services/db.ts` `openDB()`. Version increments require adding new stores/indexes carefully. Clear browser storage if corrupted during dev.

### Issue: "Worker initialization fails in build"
**Solution**: Vite handles workers differently. Ensure worker files use `?worker` suffix in import or createObjectURL pattern. Check `vite.config.ts` for worker plugin config.

## Key Files Reference

**Must-read for new contributors:**
- `README.md` - System overview and features
- `config/modules.tsx` - Module registration and lazy loading
- `services/dataService.ts` - Data access facade (use this, not db directly)
- `services/db.ts` - IndexedDB wrapper and store definitions
- `types.ts` + `types/` - Type system barrel exports
- `backend/src/app.module.ts` - Backend module structure
- `backend/README.md` - Backend-specific documentation

**Architecture deep dives:**
- `services/api/index.ts` - Consolidated backend API services (90+ domains)
- `services/apiConfig.ts` - Backend-first configuration with deprecation warnings
- `services/dataService.ts` - Facade pattern with automatic backend/local routing
- `services/queryClient.ts` - Custom React Query implementation
- `services/core/Repository.ts` - Base repository with caching (legacy IndexedDB)
- `services/integrationOrchestrator.ts` - Event-driven integration
- `backend/src/database/data-source.ts` - TypeORM configuration

## Design System References
- Tokens: `theme/tokens.ts`
- Icons: Lucide React (imported from `lucide-react`)
- Charts: Recharts (for analytics dashboards)
- PDF: `pdfjs-dist` for document rendering
