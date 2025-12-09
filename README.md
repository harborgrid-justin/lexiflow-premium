
# LexiFlow AI Legal Suite
### Enterprise-Grade Case Management & Legal Intelligence Platform

## Overview
LexiFlow is a comprehensive legal operating system designed to compete with legacy incumbents like Westlaw and LexisNexis. It unifies Case Management, Docket Tracking, Discovery, Legal Research, and Firm Operations into a single, cohesive "Holographic" interface.

## Architecture

### Frontend Core
- **React 18**: Utilizing Suspense, Concurrent Mode, and Transitions for 60fps performance.
- **Tailwind CSS**: Utility-first styling with a custom semantic design system (tokens.ts).
- **Lucide React**: Vector iconography.
- **Recharts**: Data visualization.

### Data Layer (The "Simulated Backend")
LexiFlow uses a sophisticated client-side architecture to simulate a full enterprise backend environment without a server.
- **IndexedDB Wrapper**: Custom `DatabaseManager` (`services/db.ts`) provides persistent storage in the browser.
- **MicroORM**: An abstraction layer (`services/core/microORM.ts`) that mimics server-side ORM behavior.
- **Repository Pattern**: Domain logic is encapsulated in repositories (`services/repositories/*`).
- **Sync Engine**: `SyncEngine` handles offline-first mutations and optimistic UI updates.
- **Web Workers**: Heavy lifting (Search, Physics, Encryption) is offloaded to separate threads (`services/*Worker.ts`).

### Key Modules

#### 1. Case Management
- **Master List**: Virtualized grid/list views handling thousands of matters.
- **Case Detail**: "Deep" view with specialized tabs for Docket, Strategy, and Discovery.
- **Pleading Builder**: Document automation studio.

#### 2. Discovery Platform
- **E-Discovery**: ESI mapping, legal holds, and custodian interviews.
- **Evidence Vault**: Chain-of-custody tracking with blockchain-style immutability checks.
- **Production Wizard**: Tools for generating bates-stamped volumes.

#### 3. Admin & Data Platform
- **Schema Architect**: Visual database schema designer.
- **Governance Console**: RLS policies, access matrix, and audit logging.
- **Backup Vault**: Point-in-time recovery simulation.

#### 4. Intelligence
- **Rules Engine**: Navigable hierarchy of FRCP/FRE rules.
- **Analytics**: Predictive modeling for judge behavior and case outcomes.
- **Research**: Integrated citation library and Shepardizing-style signal checking.

## Getting Started

1. **Install Dependencies**: `npm install`
2. **Run Dev Server**: `npm run dev`
3. **Build**: `npm run build`

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
