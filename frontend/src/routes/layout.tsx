/**
 * App Layout Route
 *
 * Provides the main application shell with:
 * - Sidebar navigation
 * - Header with search
 * - Global hotkeys
 * - Error boundaries for main content
 * - Authentication check via loader
 *
 * React Router v7 Best Practices:
 * - Uses loader for authentication check
 * - Uses useLoaderData for type-safe data access
 * - Uses useNavigate for programmatic navigation (search results, etc.)
 * - Sidebar/navigation uses NavLink components for proper active states
 *
 * @module routes/layout
 */

import { AppHeader } from '@/components/organisms/AppHeader/AppHeader';
import { ErrorBoundary as ComponentErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';
import { GlobalHotkeys } from '@/components/organisms/GlobalHotkeys/GlobalHotkeys';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { AppShell } from '@/components/ui/layouts/AppShell/AppShell';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { useAuthState } from '@/contexts/auth/AuthProvider';
import { useAppController } from '@/hooks/core';
import type { GlobalSearchResult } from '@/services/search/searchService';
import type { AppView } from '@/types';
import type { IntentResult } from '@/types/intelligence';
import React, { useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/layout";

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Meta tags for the authenticated layout
 * Child routes will override/merge their own meta tags
 */
export function meta({ }: Route.MetaArgs) {
  return [{ title: "LexiFlow AI Legal Suite" }];
}

// ============================================================================
// Loader - Authentication Check
// ============================================================================

/**
 * Loader runs on every navigation to a child route
 * Used for:
 * - Authentication verification
 * - Pre-fetching common data
 * - Setting up server-side context
 */
export async function loader() {
  // Check for authentication token in localStorage (client-side check)
  // Note: In SSR context, this would check cookies/headers
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lexiflow_auth_token');
    const userJson = localStorage.getItem('lexiflow_auth_user');

    if (!token || !userJson) {
      // Not authenticated - redirect to login
      const url = new URL(request.url);
      throw new Response(null, {
        status: 302,
        headers: {
          Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
        },
      });
    }

    try {
      const user = JSON.parse(userJson);
      return { authenticated: true, user };
    } catch {
      // Invalid user data - redirect to login
      throw new Response(null, {
        status: 302,
        headers: { Location: '/login' },
      });
    }
  }

  // Server-side: Allow through (will be checked client-side)
  return { authenticated: true };
}

// ============================================================================
// Layout Component
// ============================================================================

export default function Layout() {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
console.log('useNavigate:', navigate);
  const { caseId } = useParams();

  // Auth state
  const { isLoading: authIsLoading } = useAuthState();

  // App controller provides global state
  const {
    isSidebarOpen,
    toggleSidebar,
    currentUser,
    globalSearch,
    updateSearch,
    switchUser,
    isAppLoading,
    appStatusMessage,
  } = useAppController();

  // Derive activeView from current location
  // e.g., /cases/123 -> 'cases', /documents -> 'documents'
  const activeView = useMemo<AppView>(() => {
    const pathSegment = location.pathname.split('/')[1];
    return (pathSegment || 'dashboard') as AppView;
  }, [location.pathname]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSwitchUser = useCallback(() => {
    switchUser(0);
  }, [switchUser]);

  const handleNavigate = useCallback((view: string) => {
    navigate(`/${view}`);
  }, [navigate]);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleSearchResultClick = useCallback((result: GlobalSearchResult) => {
    // Navigate to the case detail page
    navigate(`/cases/${result.id}`);
  }, [navigate]);

  const handleNeuralCommand = useCallback((intent: IntentResult) => {
    // TODO: Implement neural command handling
    console.log('Neural command:', intent);
  }, []);

  const handleGlobalSearch = useCallback(() => {
    // TODO: Implement global search action
  }, []);

  const handleResetMainContent = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Loading state while app initializes
  // Add safety timeout - but exclude auth loading from timeout
  React.useEffect(() => {
    if (isAppLoading && !authIsLoading) {
      const timeout = setTimeout(() => {
        console.error('[Layout] App loading timeout - redirecting to login');
        navigate('/login');
      }, 15000); // 15 second timeout (increased from 10s)
      return () => clearTimeout(timeout);
    }
  }, [isAppLoading, authIsLoading, navigate]);

  if (isAppLoading || !currentUser) {
    return (
      <div
        className="h-screen w-screen overflow-hidden"
        role="status"
        aria-label={appStatusMessage || "Loading application"}
      >
        <LazyLoader message={appStatusMessage} />
      </div>
    );
  }

  return (
    <AppShell
      activeView={activeView}
      onNavigate={handleNavigate}
      selectedCaseId={caseId || null}
      sidebar={
        <ComponentErrorBoundary scope="Sidebar">
          <Sidebar
            activeView={activeView}
            setActiveView={handleNavigate}
            isOpen={isSidebarOpen}
            onClose={handleToggleSidebar}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
          />
        </ComponentErrorBoundary>
      }
      headerContent={
        <ComponentErrorBoundary scope="Header">
          <AppHeader
            onToggleSidebar={handleToggleSidebar}
            globalSearch={globalSearch}
            setGlobalSearch={updateSearch}
            onGlobalSearch={handleGlobalSearch}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onSearchResultClick={handleSearchResultClick}
            onNeuralCommand={handleNeuralCommand}
          />
        </ComponentErrorBoundary>
      }
    >
      {/* Global keyboard shortcuts */}
      <GlobalHotkeys
        onToggleCommand={() => updateSearch('')}
        onNavigate={handleNavigate}
      />

      {/* Main content area with error boundary */}
      <ComponentErrorBoundary scope="MainContent" onReset={handleResetMainContent}>
        <Outlet />
      </ComponentErrorBoundary>
    </AppShell>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Layout-level error boundary
 * Catches errors from child routes and provides recovery options
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("Layout Error Boundary:", error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg dark:border-red-800 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Page Error
          </h1>
        </div>

        <p className="mb-4 text-gray-600 dark:text-gray-400">
          An error occurred while loading this page. Please try again.
        </p>

        {error instanceof Error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              Error Details
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
          <a
            href="/"
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
