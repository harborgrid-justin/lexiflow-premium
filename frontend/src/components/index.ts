/**
 * @module components
 * @category Components
 * @description Enterprise component library following Atomic Design principles
 * 
 * COMPONENT ARCHITECTURE:
 * - atoms/      - Basic UI primitives (Button, Input, Badge, etc.)
 * - molecules/  - Simple composed components (Card, Modal, Tabs, etc.)
 * - organisms/  - Complex composed components (Sidebar, Table, Calendar, etc.)
 * - layouts/    - Page structure and content arrangement
 * - pages/      - Complete page compositions organized by domain
 * - theme/      - Design tokens and theming utilities
 * 
 * ATOMIC DESIGN SYSTEM:
 * We follow the Atomic Design methodology for component organization:
 * Atoms → Molecules → Organisms → Layouts → Pages
 * 
 * USAGE:
 * Import from the appropriate level or use barrel exports:
 * ```tsx
 * import { Button, Badge } from '@/components/atoms';
 * import { Card, Modal } from '@/components/molecules';
 * import { Sidebar, Table } from '@/components/organisms';
 * import { TabbedPageLayout } from '@/components/layouts';
 * import { CaseListPage } from '@/components/pages';
 * ```
 */

// ============================================================================
// ATOMIC DESIGN LAYERS
// ============================================================================
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './layouts';

// ============================================================================
// UI COMPONENT LIBRARY
// ============================================================================
export * from './ui';

// ============================================================================
// DESIGN SYSTEM
// ============================================================================
export * from './theme';