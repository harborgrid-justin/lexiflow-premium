/**
 * Example Route Using HOCs
 *
 * This file demonstrates how to use the new HOCs in a real route component.
 * Copy this pattern to migrate existing routes.
 *
 * @module routes/_shared/hoc/example
 */

import { withAuth } from './withAuth';
import { requireAdmin } from '../loaderUtils';
import type { LoaderFunctionArgs } from 'react-router';

// ============================================================================
// Example 1: Simple Protected Route
// ============================================================================

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This page requires authentication</p>
    </div>
  );
}

// Wrap with auth - redirects to login if not authenticated
export const SimpleDashboard = withAuth(DashboardPage);

// ============================================================================
// Example 2: Admin-Only Route
// ============================================================================

function AdminSettingsPage() {
  return (
    <div>
      <h1>Admin Settings</h1>
      <p>Only administrators can see this</p>
    </div>
  );
}

// Require admin role
export const AdminSettings = withAuth(AdminSettingsPage, {
  requireAdmin: true,
  forbiddenMessage: 'Administrator access is required for settings.'
});

// ============================================================================
// Example 3: Multi-Role Route
// ============================================================================

function CaseManagementPage() {
  return (
    <div>
      <h1>Case Management</h1>
      <p>Legal staff can manage cases</p>
    </div>
  );
}

// Allow multiple roles
export const CaseManagement = withAuth(CaseManagementPage, {
  requireRoles: ['attorney', 'paralegal', 'Senior Partner', 'Partner']
});

// ============================================================================
// Example 4: Permission-Based Route
// ============================================================================

function SensitiveDataPage() {
  return (
    <div>
      <h1>Sensitive Data</h1>
      <p>Requires specific permissions</p>
    </div>
  );
}

// Check permissions
export const SensitiveData = withAuth(SensitiveDataPage, {
  requirePermissions: ['data.read', 'data.export', 'data.delete']
});

// ============================================================================
// Example 5: Route with Protected Loader
// ============================================================================

interface LoaderData {
  adminData: {
    stats: Record<string, number>;
    users: Array<{ id: string; name: string }>;
  };
}

// Loader that requires admin role
const adminDashboardLoader = requireAdmin(
  async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
    // Fetch admin-only data
    const stats = { totalUsers: 100, activeUsers: 85 };
    const users = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ];

    return {
      adminData: { stats, users }
    };
  }
);

function AdminDashboardPage() {
  // Use loader data in component
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Protected data loaded</p>
    </div>
  );
}

// Both component and loader are protected
export const AdminDashboard = withAuth(AdminDashboardPage, { requireAdmin: true });
export const adminDashboardLoaderExport = adminDashboardLoader;

// ============================================================================
// Example 6: Before/After Migration
// ============================================================================

/*
 * BEFORE - With inline auth (43+ routes had this pattern):
 *
 * function OldCaseDetail() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *
 *   if (isLoading) {
 *     return <RouteLoading />;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/auth/login" replace />;
 *   }
 *
 *   if (user?.role !== 'admin') {
 *     return <ForbiddenError />;
 *   }
 *
 *   // Actual component logic (buried under auth checks)
 *   return (
 *     <div>
 *       <h1>Case Details</h1>
 *       <p>Content here</p>
 *     </div>
 *   );
 * }
 */

/*
 * AFTER - With HOC (clean component):
 */

function NewCaseDetail() {
  // Only component logic - auth handled by HOC
  return (
    <div>
      <h1>Case Details</h1>
      <p>Content here</p>
    </div>
  );
}

export const CaseDetail = withAuth(NewCaseDetail, {
  requireAdmin: true
});

/*
 * Code reduction:
 * - Before: ~20 lines of auth boilerplate + business logic
 * - After: 1 line HOC wrapper + business logic
 * - Savings: ~95% reduction in auth code
 */
