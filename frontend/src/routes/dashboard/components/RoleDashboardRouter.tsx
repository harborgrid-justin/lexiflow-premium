/**
 * @module features/dashboard/RoleDashboardRouter
 * @category Dashboard
 * @description Routes to appropriate dashboard view based on user role
 * Provides role-specific dashboards for different user types
 */

import React from 'react';

import { type User } from '@/types';

import { EnhancedDashboardOverview } from './EnhancedDashboardOverview';
import {
  AttorneyDashboard,
  ParalegalDashboard,
  AdminDashboard,
  PartnerDashboard,
} from './role-dashboards';

// ============================================================================
// TYPES
// ============================================================================

export interface RoleDashboardRouterProps {
  /** Current user */
  currentUser: User;
  /** Callback when a case is selected */
  onSelectCase?: (caseId: string) => void;
  /** Force specific view (for testing/preview) */
  forceView?: 'attorney' | 'paralegal' | 'admin' | 'partner' | 'overview';
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RoleDashboardRouter: React.FC<RoleDashboardRouterProps> = ({
  currentUser,
  onSelectCase,
  forceView,
}) => {
  // Determine user role from currentUser
  const getUserRole = (): 'attorney' | 'paralegal' | 'admin' | 'partner' | 'overview' => {
    if (forceView) return forceView;

    // Map user role to dashboard type
    const role = currentUser.role?.toLowerCase() || '';

    if (role.includes('attorney') || role.includes('lawyer')) return 'attorney';
    if (role.includes('paralegal') || role.includes('legal assistant')) return 'paralegal';
    if (role.includes('admin') || role.includes('administrator')) return 'admin';
    if (role.includes('partner') || role.includes('managing')) return 'partner';

    // Default to overview for unknown roles
    return 'overview';
  };

  const roleView = getUserRole();

  // Render appropriate dashboard based on role
  switch (roleView) {
    case 'attorney':
      return <AttorneyDashboard />;

    case 'paralegal':
      return <ParalegalDashboard />;

    case 'admin':
      return <AdminDashboard />;

    case 'partner':
      return <PartnerDashboard />;

    case 'overview':
    default:
      return <EnhancedDashboardOverview onSelectCase={onSelectCase} />;
  }
};

RoleDashboardRouter.displayName = 'RoleDashboardRouter';
