# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LexiFlow is an enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations. The system uses a **dual-stack architecture**:
- **Frontend**: React 18 + Vite with IndexedDB persistence (offline-first, simulates backend)
- **Backend**: NestJS 11 + PostgreSQL for document processing and API services

## Commands

### Root-level (npm workspaces)
```bash
npm run dev              # Start frontend dev server
npm run dev:backend      # Start backend in watch mode
npm run dev:all          # Run frontend + backend concurrently
npm run build            # Build both frontend and backend
npm run test             # Run tests for both workspaces
```

### Frontend (`/frontend`)
```bash
npm run dev              # Vite dev server
npm run build            # Production build
npm run test             # Jest tests
npm run test:watch       # Jest watch mode
```

### Backend (`/backend`)
```bash
npm run start:dev        # NestJS watch mode
npm run test             # Unit tests (Jest)
npm run test:e2e         # E2E tests with supertest
npm run lint             # ESLint
npm run format           # Prettier

# Database
npm run migration:run    # Run TypeORM migrations
npm run migration:generate # Generate new migration
npm run seed             # Seed test data
npm run db:reset         # Revert + migrate + seed
```

## Architecture

### Frontend Data Layer
The frontend uses a client-side-first architecture with IndexedDB:

1. **DataService facade** (`frontend/services/dataService.ts`) - Always use this for data access, never call `db.*` directly
2. **Repository pattern** (`frontend/services/core/Repository.ts`) - Base class with LRU caching
3. **MicroORM** (`frontend/services/core/microORM.ts`) - Abstracts IndexedDB operations
4. **Custom QueryClient** (`frontend/services/queryClient.ts`) - React Query-like implementation (not the external library)
5. **SyncEngine** (`frontend/services/syncEngine.ts`) - Offline-first mutation queue with exponential backoff
6. **IntegrationOrchestrator** (`frontend/services/integrationOrchestrator.ts`) - Event-driven integration (publishes `SystemEventType` events)

DataService domains: `cases`, `docket`, `evidence`, `documents`, `pleadings`, `hr`, `workflow`, `billing`, `discovery`, `trial`, `compliance`, `admin`, `correspondence`, `quality`, `catalog`, `backup`, `profile`, `marketing`, `jurisdiction`, `knowledge`, `crm`, `analytics`, `operations`, `security`

### Backend Module Structure
NestJS modules follow this pattern:
```
src/[domain]/
├── dto/                    # class-validator DTOs
├── entities/               # TypeORM entities
├── [domain].controller.ts  # REST endpoints
├── [domain].service.ts     # Business logic
└── [domain].module.ts      # Module definition
```

Key backend modules: `cases`, `documents`, `document-versions`, `clauses`, `pleadings`, `ocr`, `processing-jobs`, `auth`, `users`, `compliance`, `communications`, `discovery`, `billing`, `analytics`

### Frontend Component Organization
- Domain folders: `frontend/components/[domain]/` (e.g., `case-list/`, `discovery/`)
- Shared components: `frontend/components/common/`
- Layout components: `frontend/components/layout/`
- Module registration: `frontend/config/modules.tsx` using `lazyWithPreload` pattern

### Integration Points
- Frontend can use backend API via `apiServices` when `VITE_USE_BACKEND_API=true`
- Backend Swagger docs at `http://localhost:3000/api/docs`
- WebSocket support via `RealtimeModule`

## Key Conventions

### Data Access (Frontend)
```typescript
// Correct - use DataService facade
import { DataService } from '../services/dataService';
const cases = await DataService.cases.getAll();

// Wrong - bypasses Repository layer & integration events
import { db } from '../services/db';
await db.getAll('cases');
```

### Types
- Import from `frontend/types.ts` (barrel export from `frontend/types/`)
- Domain types in: `types/models.ts`, `types/enums.ts`, `types/integrationTypes.ts`
- All entities extend `BaseEntity`: `{ id: string; createdAt: string; updatedAt: string; userId: UserId }`

### Styling
- Tailwind CSS with semantic tokens in `frontend/theme/tokens.ts`
- Color palette: Slate (neutral), Blue (primary), Emerald (success), Amber (warning), Rose (error), Purple (accent)
- Use `useTheme()` hook for light/dark mode

### Backend Testing
- Unit tests: `@nestjs/testing` with `Test.createTestingModule()`
- E2E tests: `test/jest-e2e.json` config, use `supertest` for HTTP assertions
- Mock external services (Redis, file system) in unit tests

## Environment Setup

### Backend requires:
- PostgreSQL 14+
- Redis 6+ (optional, set `REDIS_ENABLED=false` for demo mode)
- Copy `.env.example` to `.env` and configure

### Frontend:
- Set `VITE_USE_BACKEND_API=true` to connect to backend (default: IndexedDB only)
