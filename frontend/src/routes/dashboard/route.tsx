import { loader } from "./loader";
import DashboardLayout from "./DashboardLayout";
import DashboardView from "./DashboardView";
import { ErrorBoundary } from "./errors";
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Command Center',
    description: 'Overview of cases, tasks, and deadlines',
  });
}

export const dashboardRoute = {
  path: "dashboard",
  element: <DashboardLayout />,
  loader: loader,
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <DashboardView />,
    }
  ],
};
