/**
 * Root Layout Component
 *
 * This is the top-level layout that wraps the entire application.
 * It provides:
 * - App-wide providers (Theme, Auth, Query Client)
 * - Global scripts and styles
 * - Error boundary for the entire app
 * - Document structure (html, head, body)
 * - HydrateFallback for SSR hydration
 *
 * React Router v7 Best Practices Applied:
 * - Type-safe meta and links exports
 * - HydrateFallback for loading states during hydration
 * - Proper provider ordering (QueryClient > Theme > Auth)
 * - Error boundary with recovery options
 * - Accessibility-first approach
 *
 * @module root
 */

import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";

// Import global styles
import "./index.css";

// Import providers
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import { QueryClientProvider } from "@/contexts/query/QueryClientProvider";
import { AppProviders } from "@/providers/AppProviders";

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Global meta tags for the application
 * These are merged with route-specific meta tags
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "LexiFlow AI Legal Suite" },
    {
      name: "description",
      content:
        "Enterprise Legal OS - Case Management, Discovery, Research & Firm Operations",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { charSet: "utf-8" },
    // PWA & Mobile
    { name: "theme-color", content: "#1e40af" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    // Open Graph defaults
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "LexiFlow" },
  ];
}

// ============================================================================
// Links (Stylesheets, Preconnects, etc.)
// ============================================================================

/**
 * Global link tags for fonts and external resources
 */
export function links() {
  return [
    // Preconnect for performance
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous" as const,
    },
    // Favicon
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    // Apple Touch Icon
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    // Manifest for PWA
    { rel: "manifest", href: "/manifest.json" },
  ];
}

// ============================================================================
// HydrateFallback - Loading State During Hydration
// ============================================================================

/**
 * Shows during client-side hydration
 * This is displayed before the JavaScript bundle loads and executes
 *
 * Re-exported from rendering/hydration module for compatibility
 * @see @rendering/hydration/HydrateFallback
 */
export { HydrateFallback } from "@rendering/hydration";
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased dark:bg-gray-900">
        {/* Provider order matters: AppProviders composes all required providers */}
        <QueryClientProvider>
          <AuthProvider>
            <AppProviders>{children}</AppProviders>
          </AuthProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ============================================================================
// Root Component
// ============================================================================

/**
 * Root component that renders the Outlet for child routes
 */
export default function Root() {
  return <Outlet />;
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Global error boundary for uncaught errors
 * Handles both route errors (404, 500) and JavaScript errors
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Log error for debugging (would send to error tracking in production)
  console.error("Root Error Boundary:", error);

  // Determine error type and display appropriate message
  let title = "Application Error";
  let message =
    "Something went wrong. Please try refreshing the page or contact support if the problem persists.";
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    switch (error.status) {
      case 404:
        title = "Page Not Found";
        message = "The page you are looking for does not exist or has been moved.";
        break;
      case 403:
        title = "Access Denied";
        message = "You do not have permission to access this page.";
        break;
      case 401:
        title = "Authentication Required";
        message = "Please log in to access this page.";
        break;
      case 500:
        title = "Server Error";
        message = "An internal server error occurred. Please try again later.";
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || message;
    }
  }

  return (
    <html lang="en">
      <head>
        <title>{title} - LexiFlow</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-red-200 bg-white p-6 shadow-lg dark:border-red-800 dark:bg-gray-800">
              {/* Error Header */}
              <div className="mb-4 flex items-center gap-3">
                {statusCode && (
                  <span className="text-5xl font-bold text-red-300 dark:text-red-700">
                    {statusCode}
                  </span>
                )}
                {!statusCode && (
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
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {title}
                </h1>
              </div>

              {/* Error Message */}
              <p className="mb-4 text-gray-600 dark:text-gray-400">{message}</p>

              {/* Error Details (development only) */}
              {error instanceof Error && process.env.NODE_ENV === "development" && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {error.message}
                    {"\n\n"}
                    {error.stack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Refresh Page
                </button>
                <Link
                  to="/"
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}