/**
 * ================================================================================
 * ENTERPRISE REACT ROUTER CONFIGURATION
 * React Router v7 + Loader/Action Pattern
 * ================================================================================
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Router is the state machine
 * 2. Loaders own data truth (server-aware, deterministic)
 * 3. Actions handle mutations
 * 4. Error boundaries per route capability
 * 5. Type-safe routing with generated types
 *
 * ROUTE HIERARCHY:
 * /                        → Root layout + providers
 * ├── /login              → Public auth routes
 * ├── /register
 * └── /app                → Protected app shell
 *     ├── /dashboard      → Loader + Page + Provider + View
 *     ├── /cases          → Domain routes
 *     └── /reports        → etc.
 *
 * DATA FLOW:
 * URL → loader() → defer()/Promise → Suspense → Await → Provider → View
 *
 * @module router
 */

import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { RootLayout } from "./layouts/RootLayout";

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * Routes Configuration
 * - Declarative route tree
 * - Type-safe params and loaders
 * - Error boundaries per route
 * - Progressive enhancement ready
 */
const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootLayout />, // Renders with error in ErrorBoundary
    children: [
      // ========================================================================
      // PUBLIC ROUTES (No authentication required)
      // ========================================================================
      {
        path: "login",
        lazy: () =>
          import("./routes/auth/login").then((m) => ({
            ...m,
            Component: m.default,
          })),
      },
      {
        path: "register",
        lazy: () => import("./routes/auth/register"),
      },
      {
        path: "forgot-password",
        lazy: () => import("./routes/auth/forgot-password"),
      },
      {
        path: "reset-password",
        lazy: () => import("./routes/auth/reset-password"),
      },

      // ========================================================================
      // PROTECTED ROUTES (Authentication required via layout loader)
      // ========================================================================
      {
        path: "/",
        lazy: () => import("./layouts/AppShellLayout"),
        children: [
          // Home/Dashboard
          {
            index: true,
            lazy: () => import("./routes/home"),
          },
          {
            path: "dashboard",
            lazy: () => import("./routes/dashboard/index.tsx"),
          },

          // Case Management
          {
            path: "cases",
            lazy: () => import("./routes/cases/index.tsx"),
          },
          {
            path: "cases/create",
            lazy: () => import("./routes/cases/create"),
          },
          {
            path: "cases/:caseId",
            lazy: () => import("./routes/cases/case-detail"),
          },

          // Docket Management
          {
            path: "docket",
            lazy: () => import("./routes/docket/index"),
          },
          {
            path: "docket/:entryId",
            lazy: () => import("./routes/docket/entry-detail"),
          },

          // Discovery & Evidence
          {
            path: "discovery",
            lazy: () => import("./routes/discovery/index"),
          },
          {
            path: "evidence",
            lazy: () => import("./routes/evidence/index"),
          },

          // Documents & Pleadings
          {
            path: "documents",
            lazy: () => import("./routes/documents/index"),
          },
          {
            path: "pleadings",
            lazy: () => import("./routes/pleadings/index"),
          },

          // Analytics & Reports
          {
            path: "reports",
            lazy: () => import("./routes/reports/index"),
          },
          {
            path: "analytics",
            lazy: () => import("./routes/analytics/index"),
          },

          // Data Platform
          {
            path: "data-platform",
            lazy: () => import("./routes/data-platform/DataPlatformLayout").then(m => ({ Component: m.default, loader: m.loader })),
            children: [
              {
                index: true,
                lazy: () => import("./routes/data-platform/DataPlatformView"),
              }
            ]
          },

          // Administration
          {
            path: "admin",
            lazy: () => import("./routes/admin/index"),
          },
          {
            path: "settings",
            lazy: () => import("./routes/settings/index"),
          },
        ],
      },

      // ========================================================================
      // ERROR ROUTES
      // ========================================================================
      {
        path: "*",
        lazy: () => import("./routes/404"),
      },
    ],
  },
];

/**
 * Browser Router Instance
 * - Manages navigation history
 * - Handles loader/action execution
 * - Provides router context
 */
const router = createBrowserRouter(routes, {
  future: {
    // Enable React Router v7 future flags
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

// ============================================================================
// ROUTER COMPONENT
// ============================================================================

/**
 * Router Component
 * Renders the entire application router tree
 * Use this as the root component in main.tsx
 */
export function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
