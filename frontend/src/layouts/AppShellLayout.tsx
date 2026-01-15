/**
 * ================================================================================
 * APP SHELL LAYOUT - AUTHENTICATED APP STRUCTURE
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Authentication enforcement via loader
 * - Global layout structure (Sidebar + TopBar + Content)
 * - Integration with LayoutProvider for sidebar state
 * - Navigation state coordination
 * - Layout-level error boundary
 *
 * DATA FLOW:
 * loader() checks auth
 *   → AppShellLayout renders
 *     → LayoutProvider provides global layout state
 *       → Sidebar + TopBar + Outlet
 *
 * ENTERPRISE PATTERN:
 * - Loader enforces authentication (server-aware)
 * - LayoutProvider manages sidebar/panel state (global)
 * - Providers in RootLayout > ApplicationLayer (DRY)
 * - Clean separation: layout structure vs content
 *
 * REACT 18 INTEGRATION:
 * ✓ Consumes LayoutProvider for coordinated state
 * ✓ Sidebar state persists across route changes
 * ✓ Memoized callbacks prevent unnecessary re-renders
 * ✓ No duplicate provider wrapping
 *
 * @module layouts/AppShellLayout
 */

import { AppShell } from "@/components/layouts/AppShell";
import { AppSidebar } from "@/components/navigation/Sidebar/AppSidebar";
import { TopBar } from "@/components/navigation/TopBar/TopBar";
import { useLayout } from '@/providers/application/layoutprovider';
import { useAppShellLogic } from "@/hooks/useAppShellLogic";
import { requireAuthLoader } from "@/utils/route-guards";
import {
  Outlet,
  useRouteError,
  type LoaderFunctionArgs,
} from "react-router";

// ============================================================================
// LOADER
// ============================================================================

/**
 * App Shell Loader
 * Enforces authentication for all child routes
 * Redirects to /login if not authenticated
 */
export async function loader(args: LoaderFunctionArgs) {
  return requireAuthLoader(args);
}

// ============================================================================
// APP SHELL LAYOUT COMPONENT
// ============================================================================

/**
 * App Shell Layout
 * Provides authenticated app structure with sidebar and top bar
 * Providers are now in RootLayout > ApplicationLayer
 */
export default function AppShellLayout() {
  return <AppShellContent />;
}

/**
 * App Shell Content
 * Renders the actual layout structure (sidebar, topbar, main content)
 * Now integrated with global LayoutProvider for coordinated state
 */
function AppShellContent() {
  // Global layout state from LayoutProvider
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    toggleSidebarCollapsed
  } = useLayout();

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
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onToggleCollapsed={toggleSidebarCollapsed}
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
      {/* Child Routes */}
      <Outlet />
    </AppShell>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

/**
 * App Shell Error Boundary
 * Catches errors within the authenticated app area
 */
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div
      style={{ backgroundColor: "var(--color-background)" }}
      className="flex min-h-screen items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-rose-600">
          Application Error
        </h2>
        <p className="text-slate-600">
          Something went wrong in the application. Please try refreshing or
          contact support.
        </p>
        {error instanceof Error && (
          <p className="text-sm text-slate-500">{error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
          <a
            href="/"
            className="flex-1 text-center bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
