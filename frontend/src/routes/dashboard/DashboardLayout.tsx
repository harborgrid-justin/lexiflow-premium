/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Dashboard Layout Component
 *
 * Provides layout wrapper for dashboard sub-routes (if any exist).
 * Currently dashboard is a single route, so this is a passthrough.
 *
 * @module routes/dashboard/DashboardLayout
 */

import { Outlet } from 'react-router';

export default function DashboardLayout() {
  return <Outlet />;
}
