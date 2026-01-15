/\*\*

- ================================================================================
- DATA LAYER DEPRECATION NOTICE
- ================================================================================
-
- ⚠️ WARNING: THE DATA LAYER IS DEPRECATED
-
- As of [current date], the DataLayer pattern in /providers/data/ is deprecated
- and will be removed in a future release.
-
- WHY DEPRECATED:
- ───────────────────────────────────────────────────────────────────────────────
- 1.  VIOLATES ENTERPRISE STANDARD
- • Domain providers should be feature-scoped, not global
- • Loader-first data flow requires providers in route directories
- • Global domain state creates coupling and makes code-splitting impossible
-
- 2.  PERFORMANCE ISSUES
- • All domain providers load on app start (unnecessary bundle size)
- • Cannot lazy-load domain-specific state
- • Prevents route-level code splitting
-
- 3.  ARCHITECTURAL PROBLEMS
- • Breaks separation of concerns (global vs domain)
- • Makes testing harder (must mock entire DataLayer)
- • Circular dependency risks
-
- MIGRATION PATH:
- ───────────────────────────────────────────────────────────────────────────────
-
- BEFORE (Global DataLayer):
- ```tsx

  ```
- // main.tsx
- import { AppProviders } from './providers/AppProviders';
-
- createRoot(root).render(
- <AppProviders preloadCaseId={caseId}>
-     <RouterProvider router={router} />
- </AppProviders>
- );
-
- // providers/AppProviders.tsx
- export function AppProviders({ children, preloadCaseId }: AppProvidersProps) {
- return (
-     <InfrastructureLayer>
-       <ApplicationLayer>
-         <DataLayer preloadCaseId={preloadCaseId}>  {/* ❌ DEPRECATED *\/}
-           {children}
-         </DataLayer>
-       </ApplicationLayer>
-     </InfrastructureLayer>
- );
- }
-
- // providers/data/DataLayer.tsx
- export function DataLayer({ children, preloadCaseId }: DataLayerProps) {
- return (
-     <CasesProvider preloadCaseId={preloadCaseId}>
-       <DocumentsProvider>
-         <DiscoveryProvider>
-           {children}
-         </DiscoveryProvider>
-       </DocumentsProvider>
-     </CasesProvider>
- );
- }
- ```

  ```
-
- AFTER (Route-Scoped Providers):
- ```tsx

  ```
- // main.tsx
- import { RootProviders } from './providers/RootProviders';
-
- createRoot(root).render(
- <RootProviders> {/_ ✅ Only Infrastructure + Application _\/}
-     <RouterProvider router={router} />
- </RootProviders>
- );
-
- // routes/cases/loader.ts
- export async function loader({ params }: Route.LoaderArgs) {
- const cases = await DataService.cases.getAll();
- return defer({ cases });
- }
-
- // routes/cases/index.tsx
- import { CasesProvider } from './CasesProvider';
- import { CasesView } from './CasesView';
-
- export function Component() {
- const { cases } = useLoaderData<typeof loader>();
-
- return (
-     <Suspense fallback={<CasesSkeleton />}>
-       <Await resolve={cases}>
-         {(resolvedCases) => (
-           <CasesProvider initialCases={resolvedCases}>  {/* ✅ Feature-scoped *\/}
-             <CasesView />
-           </CasesProvider>
-         )}
-       </Await>
-     </Suspense>
- );
- }
-
- // routes/cases/CasesProvider.tsx (moved from providers/data/casesprovider/)
- export function CasesProvider({ children, initialCases }: CasesProviderProps) {
- const [cases, setCases] = useState(initialCases);
- // ... provider logic
- }
- ```

  ```
-
- STEP-BY-STEP MIGRATION:
- ───────────────────────────────────────────────────────────────────────────────
-
- 1.  IDENTIFY DOMAIN PROVIDERS
- List all providers in /providers/data/:
- - CasesProvider
- - DocumentsProvider
- - DiscoveryProvider
- - BillingProvider
- - DocketProvider
- - ClientsProvider
- - TasksProvider
- - ComplianceProvider
- - CommunicationsProvider
- - AnalyticsProvider
- - TrialProvider
- - HRProvider
-
- 2.  CREATE ROUTE DIRECTORIES (if not existing)
- ```bash

  ```
- mkdir -p src/routes/cases
- mkdir -p src/routes/documents
- mkdir -p src/routes/discovery
- # etc.
- ```

  ```
-
- 3.  MOVE PROVIDER FILES
- ```bash

  ```
- mv src/providers/data/casesprovider/ src/routes/cases/
- mv src/providers/data/documentsprovider/ src/routes/documents/
- # etc.
- ```

  ```
-
- 4.  UPDATE PROVIDER PROPS (Add initialData)
- ```tsx

  ```
- // OLD
- interface CasesProviderProps {
-      children: ReactNode;
-      preloadCaseId?: string;  // ❌ Provider shouldn't fetch
- }
-
- // NEW
- interface CasesProviderProps {
-      children: ReactNode;
-      initialCases: Case[];  // ✅ From loader
- }
- ```

  ```
-
- 5.  REMOVE useEffect DATA FETCHING
- ```tsx

  ```
- // OLD
- useEffect(() => {
-      DataService.cases.getAll().then(setCases);  // ❌ Fetching in provider
- }, []);
-
- // NEW
- const [cases, setCases] = useState(initialCases); // ✅ From loader
- ```

  ```
-
- 6.  CREATE/UPDATE ROUTE LOADERS
- ```tsx

  ```
- // routes/cases/loader.ts
- export async function loader() {
-      const cases = await DataService.cases.getAll();
-      return defer({ cases });
- }
- ```

  ```
-
- 7.  UPDATE ROUTE COMPONENTS
- ```tsx

  ```
- // routes/cases/index.tsx
- export function Component() {
-      const { cases } = useLoaderData<typeof loader>();
-      return (
-        <Suspense fallback={<Skeleton />}>
-          <Await resolve={cases}>
-            {(data) => (
-              <CasesProvider initialCases={data}>
-                <CasesView />
-              </CasesProvider>
-            )}
-          </Await>
-        </Suspense>
-      );
- }
- ```

  ```
-
- 8.  REMOVE DataLayer IMPORTS
- Find and remove all imports of DataLayer:
- ```bash

  ```
- grep -r "import.\*DataLayer" src/
- # Remove these imports
- ```

  ```
-
- 9.  UPDATE AppProviders.tsx
- Remove DataLayer composition:
- ```tsx

  ```
- // OLD
- <InfrastructureLayer>
-      <ApplicationLayer>
-        <DataLayer>  {/* ❌ REMOVE *\/}
-          {children}
-        </DataLayer>
-      </ApplicationLayer>
- </InfrastructureLayer>
-
- // NEW
- <InfrastructureLayer>
-      <ApplicationLayer>
-        {children}  {/* ✅ Direct *\/}
-      </ApplicationLayer>
- </InfrastructureLayer>
- ```

  ```
-
- 10. DELETE /providers/data/ DIRECTORY
-     After all providers are migrated:
-     ```bash
-     rm -rf src/providers/data/
-     ```
-
- MIGRATION CHECKLIST:
- ───────────────────────────────────────────────────────────────────────────────
- [ ] Identified all domain providers in /providers/data/
- [ ] Created corresponding route directories
- [ ] Moved provider files to route directories
- [ ] Updated provider props to accept initialData
- [ ] Removed useEffect data fetching from providers
- [ ] Created/updated route loaders
- [ ] Updated route components to use loader data
- [ ] Removed DataLayer imports
- [ ] Updated AppProviders composition
- [ ] Deleted /providers/data/ directory
- [ ] Updated tests
- [ ] Updated documentation
-
- BENEFITS OF MIGRATION:
- ───────────────────────────────────────────────────────────────────────────────
- ✅ Smaller initial bundle (lazy-load domain providers)
- ✅ Better code splitting (per-route providers)
- ✅ Clearer data flow (loader → provider → view)
- ✅ Easier testing (isolated domain contexts)
- ✅ Standards compliance (Enterprise React Architecture)
- ✅ Better performance (no global domain state)
- ✅ More maintainable (feature-scoped code)
-
- BACKWARD COMPATIBILITY:
- ───────────────────────────────────────────────────────────────────────────────
- None. This is a breaking change that requires code updates.
- The old DataLayer pattern will be removed entirely.
-
- SUPPORT:
- ───────────────────────────────────────────────────────────────────────────────
- See PROVIDER_INTEGRATION_GUIDE.tsx for complete examples.
- Refer to routes/dashboard/ or routes/cases/ for working implementations.
  \*/

export {};
