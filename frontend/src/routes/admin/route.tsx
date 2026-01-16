/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { adminLoader } from "./loader";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboardView } from "./AdminDashboardView";
import { ErrorBoundary } from "./errors";

/**
 * Admin Route Configuration
 * 
 * Defines the administration dashboard route with:
 * - RBAC enforcement (via loader)
 * - Deferred data loading (at layout level)
 * - Nested administration sub-routes
 */
export const adminRoute = {
  path: "admin",
  element: <AdminLayout />,
  loader: adminLoader,
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <AdminDashboardView />,
    }
  ],
};
