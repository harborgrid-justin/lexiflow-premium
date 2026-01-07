/**
 * Admin User Management Shell
 *
 * Feature-specific shell for user management with optimized Suspense boundaries.
 * Handles streaming for user lists and permission matrices.
 *
 * @module features/admin/shells/UserManagementShell
 */

import { Suspense, type ReactNode } from 'react';

interface UserManagementShellProps {
  children: ReactNode;
}

/**
 * User management loading skeleton
 */
function UserManagementSkeleton() {
  return (
    <div className="user-management-skeleton">
      <div className="skeleton-toolbar">
        <div className="skeleton-search" />
        <div className="skeleton-filters" />
        <div className="skeleton-actions" />
      </div>
      <div className="skeleton-user-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="skeleton-user-card" />
        ))}
      </div>
    </div>
  );
}

/**
 * User Management Shell
 *
 * Wraps user management interface with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function UserManagementShell({ children }: UserManagementShellProps) {
  return (
    <Suspense fallback={<UserManagementSkeleton />}>
      {children}
    </Suspense>
  );
}
