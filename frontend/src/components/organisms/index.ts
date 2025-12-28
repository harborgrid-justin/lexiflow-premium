/**
 * @module components/organisms
 * @category Organisms
 * @description Complex composed components organized by business domain.
 * 
 * DOMAIN ORGANIZATION:
 * - core/           - Infrastructure, monitoring, and foundational UI
 * - navigation/     - Application navigation and routing
 * - cases/          - Case management components
 * - calendar/       - Calendar and scheduling
 * - discovery/      - Document review and discovery
 * - search/         - Search and filtering
 * - collaboration/  - Team collaboration and notifications
 * 
 * ARCHITECTURE PRINCIPLES:
 * 1. Organisms are complex components composed of molecules and atoms
 * 2. Domain-organized for better discoverability and maintenance
 * 3. Each domain has its own index.ts with documentation
 * 4. Components within domains are feature-rich and business-focused
 * 
 * USAGE OPTIONS:
 * ```tsx
 * // Option 1: Import from domain (recommended)
 * import { Table, ErrorBoundary } from '@/components/organisms/core';
 * import { Sidebar, NeuralCommandBar } from '@/components/organisms/navigation';
 * 
 * // Option 2: Import from root barrel (backwards compatible)
 * import { Table, Sidebar } from '@/components/organisms';
 * ```
 */

// ============================================================================
// CORE & INFRASTRUCTURE
// ============================================================================
export * from './core';

// ============================================================================
// NAVIGATION
// ============================================================================
export * from './navigation';

// ============================================================================
// DOMAIN COMPONENTS
// ============================================================================
export * from './cases';
export * from './calendar';
export * from './discovery';
export * from './search';
export * from './collaboration';
