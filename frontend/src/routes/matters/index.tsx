/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useLoaderData } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import type { Route } from "./+types/index";
import { mattersLoader } from './loader';
import { MattersPage } from './MattersPage';

export { mattersLoader as loader } from './loader';

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Matters',
    count: data?.matters?.length,
    description: 'Manage legal matters and cases',
  });
}

export default function MattersIndexRoute() {
  const loaderData = useLoaderData<typeof mattersLoader>();
  return <MattersPage loaderData={loaderData} />;
}

export { RouteErrorBoundary as ErrorBoundary };
