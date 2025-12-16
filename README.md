# LexiFlow AI Legal Suite
### Enterprise-Grade Case Management & Legal Intelligence Platform

## Overview
LexiFlow is a comprehensive legal operating system designed to compete with legacy incumbents like Westlaw and LexisNexis. It unifies Case Management, Docket Tracking, Discovery, Legal Research, and Firm Operations into a single, cohesive "Holographic" interface.

## Architecture

### Frontend Core
- **React 18**: Utilizing Suspense, Concurrent Mode, and Transitions for 60fps performance.
- **Tailwind CSS**: Utility-first styling with a custom semantic design system (`theme/tokens.ts`).
- **Lucide React**: Vector iconography.
- **Recharts**: Data visualization.

### Data Layer (The "Simulated Backend")
LexiFlow uses a sophisticated client-side architecture to simulate a full enterprise backend environment without a server.
- **IndexedDB Wrapper**: Custom `DatabaseManager` (`services/db.ts`) provides persistent, transactional storage in the browser, featuring write-batching for performance.
- **MicroORM & Repository Pattern**: A custom ORM (`services/core/microORM.ts`) and Repository pattern abstract away direct database calls, providing a clean, domain-driven API via the `DataService` facade.
- **React Query (Custom Implementation)**: A lightweight, custom implementation of React Query (`services/queryClient.ts`) handles all server state management, caching, invalidation, and background refetching.
- **Offline-First Sync Engine**: `SyncEngine` (`services/syncEngine.ts`) queues mutations when offline and replays them with exponential backoff and error handling when connectivity is restored, enabling full offline functionality.
- **Web Workers**: Heavy lifting (full-text search, graph physics, encryption) is offloaded to separate threads to keep the UI completely unblocked.

### Key Modules

#### 1. Case Management
- **Master List**: Virtualized grid/list views handling thousands of matters with off-main-thread search.
- **Case Detail**: "Deep" view with specialized tabs for Strategy, Discovery, and Risk.
- **Pleading Builder**: A powerful document automation studio for drafting legal documents.

#### 2. Discovery Platform
- **E-Discovery**: ESI mapping, legal holds, and custodian interviews.
- **Evidence Vault**: Chain-of-custody tracking with blockchain-style immutability checks (`ChainService`).
- **Production Wizard**: Tools for generating bates-stamped volumes.

#### 3. Admin & Data Platform
- **Schema Architect**: Visual database schema designer with code generation.
- **Governance Console**: RLS policies, access matrix, and audit logging.
- **Backup Vault**: Point-in-time recovery simulation.

#### 4. Intelligence
- **Rules Engine**: Navigable hierarchy of FRCP/FRE rules.
- **Analytics**: Predictive modeling for judge behavior and case outcomes.
- **Research**: Integrated citation library and Shepardizing-style signal checking via Gemini API.

## Getting Started

### Port Configuration
- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:5000` (NestJS API)
- **Backend API Docs**: `http://localhost:5000/api/docs` (Swagger)

### Development Commands

#### Run Both Frontend & Backend
```bash
npm run dev:all          # Runs both frontend and backend concurrently
```

#### Frontend Development
```bash
npm run dev:frontend     # Or: cd frontend && npm run dev
```
- Runs on port **3000**
- Hot reload enabled

#### Backend Development
```bash
npm run dev:backend      # Or: cd backend && npm run start:dev
```
- Runs on port **5000**
- Watch mode enabled

### Initial Setup
1. **Install Dependencies**: `npm install` (from root)
2. **Configure Backend**: Copy `backend/.env.example` to `backend/.env` and configure
3. **Run Development**: `npm run dev:all`

### Backend Development
1. **Install Dependencies**: `cd backend && npm install`
2. **Run Dev Server**: `npm run dev:backend` (from root) or `cd backend && npm run start:dev`
3. **Build**: `npm run build:backend` (from root) or `cd backend && npm run build`

### Full Stack Development
- **Run Both**: `npm run dev:all` (runs frontend and backend concurrently)
- **Install All**: `npm run install:all`

## Key Features to Explore
- **Holographic Dock**: Minimize windows to a floating dock for multitasking.
- **Neural Command Bar**: Press `Cmd+K` to navigate or execute AI commands.
- **Visual Lineage**: Check Admin > Data Platform > Lineage for physics-based graph rendering.
- **Offline Mode**: Disconnect network to see the Sync Engine queue actions.

## Technology Stack
- TypeScript
- React
- Vite
- IndexedDB
- Web Workers

## License
Proprietary Enterprise License.