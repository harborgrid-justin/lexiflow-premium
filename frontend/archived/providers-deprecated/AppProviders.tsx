/**
 * ================================================================================
 * APP PROVIDERS - DEPRECATED
 * ================================================================================
 *
 * ⚠️ WARNING: THIS FILE IS DEPRECATED
 *
 * USE RootProviders.tsx INSTEAD
 *
 * REASON FOR DEPRECATION:
 * This file includes DataLayer which contains domain providers that should
 * live in /routes/[feature]/ directories per Enterprise React Architecture Standard.
 *
 * MIGRATION PATH:
 * ```tsx
 * // OLD (DEPRECATED)
 * import { AppProviders } from '@/providers/AppProviders';
 * <AppProviders preloadCaseId={id} filterByCaseId={id}>
 *   <RouterProvider router={router} />
 * </AppProviders>
 *
 * // NEW (ENTERPRISE STANDARD)
 * import { RootProviders } from '@/providers/RootProviders';
 * <RootProviders>
 *   <RouterProvider router={router} />
 * </RootProviders>
 *
 * // Domain providers move to routes:
 * // routes/cases/index.tsx
 * export function Component() {
 *   const { cases } = useLoaderData<typeof loader>();
 *   return (
 *     <Suspense fallback={<Skeleton />}>
 *       <Await resolve={cases}>
 *         {(data) => (
 *           <CasesProvider initialCases={data}>
 *             <CasesView />
 *           </CasesProvider>
 *         )}
 *       </Await>
 *     </Suspense>
 *   );
 * }
 * ```
 *
 * SEE:
 * - RootProviders.tsx for the correct implementation
 * - DATA_LAYER_DEPRECATION.md for migration guide
 * - PROVIDER_INTEGRATION_GUIDE.tsx for complete examples
 *
 * @deprecated Use RootProviders instead
 * @module providers/AppProviders
 */

import { FlagsProviderProps } from "@/lib/flags/context";
import { ReactNode } from "react";
import { ApplicationLayer } from "./application/ApplicationLayer";
import { DataLayer } from "./data/DataLayer";
import { InfrastructureLayer } from "./infrastructure/InfrastructureLayer";

/**
 * @deprecated Use RootProviders instead - DataLayer is being removed
 */
export interface AppProvidersProps {
  children: ReactNode;
  initialFlags?: FlagsProviderProps["initial"];
  /**
   * @deprecated Domain providers should not be global
   * Move to route-specific providers in /routes/[feature]/
   */
  preloadCaseId?: string;
  /**
   * @deprecated Domain providers should not be global
   * Move to route-specific providers in /routes/[feature]/
   */
  filterByCaseId?: string;
}

/**
 * @deprecated Use RootProviders instead
 * This component includes DataLayer which is being removed.
 * See DATA_LAYER_DEPRECATION.md for migration guide.
 */
export function AppProviders({
  children,
  initialFlags,
  preloadCaseId,
  filterByCaseId
}: AppProvidersProps) {
  // Show deprecation warning in development
  if (import.meta.env.DEV) {
    console.warn(
      '[DEPRECATED] AppProviders is deprecated. Use RootProviders instead.\n' +
      'See DATA_LAYER_DEPRECATION.md for migration guide.'
    );
  }
  return (
    <InfrastructureLayer>
      <ApplicationLayer initialFlags={initialFlags}>
        <DataLayer
          preloadCaseId={preloadCaseId}
          filterByCaseId={filterByCaseId}
        >
          {children}
        </DataLayer>
      </ApplicationLayer>
    </InfrastructureLayer>
  );
}

export default AppProviders;
