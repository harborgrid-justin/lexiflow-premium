/**
 * ================================================================================
 * PAGE FRAME - REUSABLE PAGE CONTAINER
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Consistent page padding and max-width
 * - Page header with title and actions
 * - Breadcrumb navigation
 * - Content area with proper spacing
 *
 * USAGE:
 * <PageFrame title="Dashboard" breadcrumbs={[...]}>
 *   <YourContent />
 * </PageFrame>
 *
 * ENTERPRISE PATTERN:
 * - Pure presentation component
 * - No state management
 * - No data fetching
 * - Accepts slots via props
 *
 * @module layouts/PageFrame
 */

import React from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageFrameProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Page Frame
 * Provides consistent layout for all page-level components
 */
export function PageFrame({
  children,
  title,
  breadcrumbs,
  actions,
  className = "",
}: PageFrameProps) {
  return (
    <div
      style={{ backgroundColor: "var(--color-background)" }}
      className={`min-h-screen ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                  {idx > 0 && (
                    <span className="mx-2 text-slate-400">/</span>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span style={{ color: "var(--color-textMuted)" }}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Header */}
        {(title || actions) && (
          <div className="flex items-center justify-between mb-6">
            {title && (
              <h1
                style={{ color: "var(--color-textPrimary)" }}
                className="text-3xl font-bold"
              >
                {title}
              </h1>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
