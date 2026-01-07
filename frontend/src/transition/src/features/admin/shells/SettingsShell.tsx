/**
 * Admin Settings Shell
 *
 * Feature-specific shell for system settings with optimized Suspense boundaries.
 * Handles streaming for configuration panels and system preferences.
 *
 * @module features/admin/shells/SettingsShell
 */

import { Suspense, type ReactNode } from 'react';

interface SettingsShellProps {
  children: ReactNode;
}

/**
 * Settings loading skeleton
 */
function SettingsSkeleton() {
  return (
    <div className="settings-skeleton">
      <div className="skeleton-sidebar">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton-nav-item" />
        ))}
      </div>
      <div className="skeleton-content">
        <div className="skeleton-section-header" />
        <div className="skeleton-form">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton-form-field" />
          ))}
        </div>
        <div className="skeleton-actions" />
      </div>
    </div>
  );
}

/**
 * Settings Shell
 *
 * Wraps settings interface with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function SettingsShell({ children }: SettingsShellProps) {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      {children}
    </Suspense>
  );
}
