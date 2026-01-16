/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { useLoaderData } from "react-router";
import { createMeta } from '../_shared/meta-utils';
import { searchLoader } from './loader';
import { SearchPage } from './SearchPage';

export { searchLoader as loader } from './loader';

export function meta() {
  return createMeta({
    title: 'Search',
    description: 'Global search across all domains',
  });
}

export default function SearchIndexRoute() {
  const loaderData = useLoaderData<typeof searchLoader>();
  return <SearchPage loaderData={loaderData} />;
}
