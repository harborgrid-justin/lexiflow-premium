/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useLoaderData } from "react-router";

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import { DashboardPage } from './DashboardPage';
import { loader } from "./loader";

export { loader };

export function meta() {
  return createMeta({
    title: 'Command Center',
    description: 'Overview of cases, tasks, and deadlines',
  });
}

export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();

  return <DashboardPage loaderData={loaderData} />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return <RouteErrorBoundary error={error} title="Dashboard Error" />;
}
