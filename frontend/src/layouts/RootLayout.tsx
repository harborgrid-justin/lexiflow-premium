/**
 * ================================================================================
 * ROOT LAYOUT - DOCUMENT STRUCTURE & GLOBAL PROVIDERS
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - HTML document structure (<html>, <head>, <body>)
 * - Global scripts, styles, meta tags
 * - Root providers (Env, Theme, Toast)
 * - Top-level error boundary
 * - Hydration fallback for SSR
 *
 * DATA FLOW:
 * RootLayout (document structure)
 *   → RootProviders (infrastructure)
 *     → Outlet (child routes)
 *
 * ENTERPRISE PATTERN:
 * - NO authentication logic here (AppShellLayout)
 * - NO domain contexts here (route components)
 * - ONLY document + infrastructure
 *
 * @module layouts/RootLayout
 */

import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

// Import global styles
import "@/index.css";

// NOTE: This legacy layout is not the canonical provider mounting location.
// In the React Router v7 framework build, global providers are mounted in `src/root.tsx`.

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

/**
 * Root Layout
 * Wraps the entire application with document structure and root providers
 */
export function RootLayout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ============================================================================
// ROOT ERROR BOUNDARY
// ============================================================================

/**
 * Root Error Boundary
 * Catches errors at the document level
 * Shows different UI based on error type
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - LexiFlow</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
            {isRouteErrorResponse(error) ? (
              <>
                <h1 className="text-3xl font-bold text-rose-600">
                  {error.status} {error.statusText}
                </h1>
                <p className="text-slate-600">{error.data}</p>
              </>
            ) : error instanceof Error ? (
              <>
                <h1 className="text-3xl font-bold text-rose-600">
                  Unexpected Error
                </h1>
                <p className="text-slate-600">{error.message}</p>
                {process.env.NODE_ENV === 'development' && (
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-rose-600">
                  Unknown Error
                </h1>
                <p className="text-slate-600">
                  Something went wrong. Please try again.
                </p>
              </>
            )}
            <Link
              to="/"
              className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
