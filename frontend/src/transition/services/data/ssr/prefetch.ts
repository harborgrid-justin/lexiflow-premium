/**
 * SSR Prefetch - Server-side data prefetching
 */

import { queryClient } from "../client/queryClient";

export async function prefetchQueries(
  queries: Array<{
    key: string[];
    fetcher: () => Promise<unknown>;
  }>
): Promise<void> {
  await Promise.all(
    queries.map(({ key, fetcher }) => queryClient.query(key, fetcher))
  );
}

export function getQueriesForRoute(route: string): Array<{
  key: string[];
  fetcher: () => Promise<unknown>;
}> {
  // Map routes to their required data queries
  const routeQueries: Record<
    string,
    Array<{
      key: string[];
      fetcher: () => Promise<unknown>;
    }>
  > = {
    "/dashboard": [
      {
        key: ["dashboard", "stats"],
        fetcher: () => fetch("/api/dashboard/stats").then((r) => r.json()),
      },
    ],
    "/billing": [
      {
        key: ["billing", "invoices"],
        fetcher: () => fetch("/api/billing/invoices").then((r) => r.json()),
      },
    ],
  };

  return routeQueries[route] || [];
}
