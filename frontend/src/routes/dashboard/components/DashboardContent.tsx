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
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { useDashboardState } from '../DashboardProvider';
import { DashboardOverview } from './DashboardOverview';
import { PersonalWorkspace } from './PersonalWorkspace';

// Types
import React from "react";

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardContent: React.FC = () => {
  const { activeTab, currentUser } = useDashboardState();

  switch (activeTab) {
    case 'overview': return <DashboardOverview />;
    case 'tasks': return <PersonalWorkspace activeTab="tasks" currentUser={currentUser} />;
    case 'notifications': return <PersonalWorkspace activeTab="notifications" currentUser={currentUser} />;
    // Fallback
    default: return <DashboardOverview />;
  }
};
