/**
 * @module components/dashboard/DashboardContent
 * @category Dashboard
 * @description Content router for dashboard tabs, delegating to specific dashboard views.
 *
 * THEME SYSTEM USAGE:
 * This component delegates to child components that use the theme system.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { DashboardOverview } from './DashboardOverview';
import { PersonalWorkspace } from './PersonalWorkspace';

// Types
import type { User } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DashboardContentProps {
  /** Currently active tab identifier. */
  activeTab: string;
  /** Callback when a case is selected. */
  onSelectCase: (caseId: string) => void;
  /** Current user information. */
  currentUser: User;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, onSelectCase, currentUser }) => {
  switch (activeTab) {
    case 'overview': return <DashboardOverview onSelectCase={onSelectCase} />;
    case 'tasks': return <PersonalWorkspace activeTab="tasks" currentUser={currentUser} />;
    case 'notifications': return <PersonalWorkspace activeTab="notifications" currentUser={currentUser} />;
    // Fallback
    default: return <DashboardOverview onSelectCase={onSelectCase} />;
  }
};