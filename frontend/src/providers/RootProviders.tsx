/**
 * ================================================================================
 * ROOT PROVIDERS - ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + React Router v7 + Context + Suspense
 * ================================================================================
 *
 * CANONICAL PROVIDER COMPOSITION
 *
 * LAYERING (OUTER → INNER):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ InfrastructureLayer (Foundation)                            │
 * │  ├── EnvProvider          (Environment config)              │
 * │  ├── ConfigProvider       (App configuration)               │
 * │  ├── UtilityProvider      (Helper functions)                │
 * │  ├── ThemeProvider        (Visual system)                   │
 * │  ├── ToastProvider        (Global notifications)            │
 * │  ├── QueryClientProvider  (Data caching)                    │
 * │  ├── SessionProvider      (Session management)              │
 * │  └── WebSocketProvider    (Real-time connection)            │
 * │                                                              │
 * │  ┌───────────────────────────────────────────────────────┐  │
 * │  │ ApplicationLayer (Global App State)                   │  │
 * │  │  ├── AuthProvider           (Authentication)          │  │
 * │  │  ├── FlagsProvider          (Feature flags)           │  │
 * │  │  ├── EntitlementsProvider   (Permissions/RBAC)        │  │
 * │  │  ├── ServiceProvider        (Service health)          │  │
 * │  │  ├── StateProvider          (Global UI state)         │  │
 * │  │  ├── UserProvider           (Current user)            │  │
 * │  │  └── LayoutProvider         (Layout state)            │  │
 * │  │                                                         │  │
 * │  │  ┌──────────────────────────────────────────────────┐  │  │
 * │  │  │ <RouterProvider> (React Router v7)              │  │  │
 * │  │  │   └── <Outlet> (Route components)               │  │  │
 * │  │  │        └── Feature-specific providers           │  │  │
 * │  │  │            (LIVE IN /routes/[feature]/)         │  │  │
 * │  │  └──────────────────────────────────────────────────┘  │  │
 * │  └───────────────────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────────────────┘
 *
 * CRITICAL ARCHITECTURAL RULES:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. CONTEXT LAYERING (NON-NEGOTIABLE)
 *    ┌─────────────────────┬──────────────────────────────────┐
 *    │ OUTER → INFRA       │ No business logic, SSR-safe      │
 *    │ MID   → APPLICATION │ Auth, permissions, global state  │
 *    │ INNER → DOMAIN      │ Feature contexts (in routes/)    │
 *    │ LEAF  → UI          │ Presentation-only                │
 *    └─────────────────────┴──────────────────────────────────┘
 *
 * 2. DATA FLOW (ONE-DIRECTIONAL)
 *    SERVER → LOADER → PROVIDER → VIEW → UI
 *    │        │         │          │      │
 *    │        │         │          │      └─ Props only
 *    │        │         │          └─ Pure render
 *    │        │         └─ Domain derivation
 *    │        └─ Data authority
 *    └─ Business decisions
 *
 * 3. DEPENDENCY RULES
 *    • A context MAY ONLY depend on contexts ABOVE it
 *    • Infrastructure MUST NOT depend on Application/Domain
 *    • Application MUST NOT depend on Domain
 *    • Domain contexts MUST live in /routes/[feature]/
 *
 * 4. NO DOMAIN PROVIDERS IN GLOBAL SCOPE
 *    ❌ CasesProvider, DocumentsProvider, DiscoveryProvider
 *    ❌ Any provider with feature-specific state
 *    ✅ Only infrastructure and application-wide providers
 *
 * 5. LOADER/ACTION INTEGRATION
 *    • Loaders own data truth (server-aware)
 *    • Providers consume loader data via initialData props
 *    • Context derives UI-ready state from loader data
 *    • NO data fetching in provider constructors
 *
 * USAGE PATTERN:
 * ═══════════════════════════════════════════════════════════════
 *
 * // main.tsx
 * import { RootProviders } from './providers/RootProviders';
 *
 * createRoot(document.getElementById('root')!).render(
 *   <RootProviders>
 *     <RouterProvider router={router} />
 *   </RootProviders>
 * );
 *
 * // routes/reports/ReportPage.tsx
 * export function ReportPage() {
 *   const { report } = useLoaderData();
 *   return (
 *     <Suspense fallback={<ReportSkeleton />}>
 *       <Await resolve={report}>
 *         {(data) => (
 *           <ReportProvider initialData={data}>
 *             <ReportView />
 *           </ReportProvider>
 *         )}
 *       </Await>
 *     </Suspense>
 *   );
 * }
 *
 * @module providers/RootProviders
 */

import { type ReactNode } from 'react';

import { ApplicationLayer } from './application/ApplicationLayer';
import { InfrastructureLayer } from './infrastructure/InfrastructureLayer';

export interface RootProvidersProps {
  children: ReactNode;
}

/**
 * Root Providers Composition
 *
 * ENTERPRISE STANDARD COMPLIANCE:
 * ✓ Infrastructure Layer (outermost)
 * ✓ Application Layer (middle)
 * ✓ NO Data Layer (domain contexts live in routes/)
 * ✓ Stable composition (rarely changes)
 * ✓ Clear separation of concerns
 *
 * @param children - RouterProvider or app root
 */
export function RootProviders({ children }: RootProvidersProps) {
  return (
    <InfrastructureLayer>
      <ApplicationLayer>
        {children}
      </ApplicationLayer>
    </InfrastructureLayer>
  );
}

export default RootProviders;
