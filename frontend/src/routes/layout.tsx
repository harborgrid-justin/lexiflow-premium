/**
 * ================================================================================
 * LAYOUT ROUTE - APP SHELL WRAPPER
 * ================================================================================
 *
 * ENTERPRISE PATTERN:
 * This file now delegates to layouts/AppShellLayout.tsx
 * Domain contexts (CaseProvider, DataSourceProvider, WindowProvider) have been
 * moved to their respective route components per enterprise architecture.
 *
 * MIGRATION COMPLETE:
 * - ThemeProvider → RootProviders (in root.tsx)
 * - Auth/Permissions → AppShellLayout
 * - Domain contexts → Route components
 *
 * @module routes/layout
 */

import { AppShell } from "@/components/layouts/AppShell";
import { AppSidebar } from "@/components/navigation/Sidebar/AppSidebar";
import { TopBar } from "@/components/navigation/TopBar/TopBar";
import { useAppShellLogic } from "@/hooks/useAppShellLogic";
import { RouteErrorBoundary } from "@/routes/_shared/RouteErrorBoundary";
import { requireAuthLoader } from "@/utils/route-guards";
import { Outlet, useRouteError } from "react-router";

// Export the loader for the router to use
export const loader = requireAuthLoader;

/**
 * Layout Component (Enterprise Architecture)
 *
 * SIMPLIFIED: No domain contexts here
 * - Domain contexts live in route components
 * - App-level contexts in AppShellLayout (from router.tsx)
 * - Pure shell rendering with Outlet for child routes
 */
export default function Layout() {
  // Controller: Handles all state, navigation, and business logic
  const { state, handlers } = useAppShellLogic();

  return (
    <AppShell
      // Active State
      activeView={state.activeView}
      selectedCaseId={state.selectedCaseId}

      // Data & UI State
      isFetching={state.isQueryFetching}
      breadcrumbs={state.breadcrumbs}
      timeTracker={state.timeTracker}

      // Action Handlers
      onNavigate={handlers.handleNavigate}

      // Composed Slots
      sidebar={
        <AppSidebar
          isOpen={state.isSidebarOpen}
          onToggle={handlers.handleToggleSidebar}
          activeItem={state.activeView}
          userName={state.currentUser?.name}
          userEmail={state.currentUser?.email}
          userRole={state.currentUser?.role}
          onNavigate={handlers.handleNavigate}
        />
      }
      headerContent={
        <TopBar
          onSearch={handlers.handleGlobalSearch}
          onNeuralCommand={handlers.handleNeuralCommand}
          onResultClick={handlers.handleSearchResultClick}
          onToggleSidebar={handlers.handleToggleSidebar}
        />
      }
    >
      {/* Child Routes (with their own domain contexts) */}
      <Outlet />
    </AppShell>
  );
}

/**
 * Layout Error Boundary
 */
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="flex min-h-screen items-center justify-center p-4">
      <RouteErrorBoundary
        error={error}
        title="Application Error"
        message="Something went wrong in the application layout. Please try refreshing."
        backTo="/"
        backLabel="Return to Dashboard"
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
