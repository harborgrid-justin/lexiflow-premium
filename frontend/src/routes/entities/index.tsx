/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useLoaderData } from 'react-router';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';


import { EntitiesPage } from './EntitiesPage';
import { type clientLoader } from './loader';

import type { Route } from './+types/index';

export { clientLoader } from './loader';

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Legal Entities',
    count: data?.entities?.length,
    description: 'Manage legal entities, parties, and organizations',
  });
}

export default function EntitiesIndexRoute() {
  const loaderData = useLoaderData<typeof clientLoader>();
  return <EntitiesPage loaderData={loaderData} />;
}

export { RouteErrorBoundary as ErrorBoundary };
