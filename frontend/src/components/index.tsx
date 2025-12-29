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

// ============================================================================
// STUB COMPONENTS (temporary - to be implemented)
// ============================================================================
import React from 'react';

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