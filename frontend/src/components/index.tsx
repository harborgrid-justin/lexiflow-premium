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
 * import { Button, Badge } from '@/shared/ui/atoms';
 * import { Card, Modal } from '@/shared/ui/molecules';
 * import { Sidebar, Table } from '@/shared/ui/organisms';
 * import { TabbedPageLayout } from '@/components/layouts';
 * import { CaseListPage } from '@/components/pages';
 * ```
 */

// ============================================================================
// ATOMIC DESIGN LAYERS
// ============================================================================
// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES
// Import directly from '@/shared/ui/atoms', '@/components/ui/molecules', etc.
// export * from './atoms';
// export * from './molecules';
// export * from './organisms';
// export * from './layouts';

// ============================================================================
// UI COMPONENT LIBRARY
// ============================================================================
// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES
// Import directly from '@/shared/ui/atoms', '@/components/ui/molecules', etc.
// export * from './ui';

// ============================================================================
// DESIGN SYSTEM
// ============================================================================

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================
import React from 'react';

export { SidebarFooter } from './organisms/Sidebar/SidebarFooter';
export { SidebarHeader } from './organisms/Sidebar/SidebarHeader';

// ============================================================================
// STUB COMPONENTS (temporary - to be implemented)
// ============================================================================
export const NotificationCenter: React.FC<{ className?: string }> = ({ className }) => {
    return <div className={className}>Notification Center (stub)</div>;
};

export const TaskCreationModal: React.FC<{ isOpen?: boolean; onClose?: () => void; className?: string }> = ({ isOpen, onClose, className }) => {
    if (!isOpen) return null;
    return (
        <div className={className}>
            <div>Task Creation Modal (stub)</div>
            <button onClick={onClose}>Close</button>
        </div>
    );
};
