import { AppShell } from "@/components/layouts/AppShell";
import { AppSidebar } from "@/components/navigation/Sidebar/AppSidebar";
import { TopBar } from "@/components/navigation/TopBar/TopBar";
import { useAppShellLogic } from "@/hooks/useAppShellLogic";
import { RouteErrorBoundary } from "@/routes/_shared/RouteErrorBoundary";
import { WindowProvider } from "@/routes/_shared/window/WindowContext";
import { CaseProvider } from "@/routes/cases/CaseProvider";
import { DataSourceProvider } from "@/routes/dashboard/data/DataSourceContext";
import { ThemeProvider } from "@/theme";
import { requireAuthLoader } from "@/utils/route-guards";
import { Outlet, useRouteError } from "react-router";

// Export the loader for the router to use
export const loader = requireAuthLoader;

/**
 * Root Layout Component
 *
 * This component acts as the "View" in the MVC pattern for the application shell.
 * It strictly handles rendering and composition, delegating all logic to the
 * useAppShellLogic hook (Controller).
 */
export default function Layout() {
  // Controller: Handles all state, navigation, and business logic
  const { state, handlers } = useAppShellLogic();

  return (
    <ThemeProvider>
      <WindowProvider>
        <CaseProvider>
          <DataSourceProvider>
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
              {/* Child Routes */}
              <Outlet />
            </AppShell>
          </DataSourceProvider>
        </CaseProvider>
      </WindowProvider>
    </ThemeProvider>
  );
}

/**
 * Layout Error Boundary
 */
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
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
