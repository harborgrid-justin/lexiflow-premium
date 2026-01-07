/**
 * Root Application Component
 *
 * Sets up provider composition with Suspense boundaries for streaming SSR.
 * AuthProvider loads identity behind Suspense to avoid blocking initial shell.
 *
 * Provider nesting order:
 * 1. GlobalShell (skeleton) - streams immediately
 * 2. AppProviders (config, theme, i18n, observability, security)
 * 3. Suspense boundary
 * 4. Identity resolution (AuthProvider + SessionProvider)
 * 5. AppShell (app chrome) - streams after providers ready
 * 6. RouterProvider (page content)
 */

import { Suspense } from 'react';
import { AppProviders } from './providers/AppProviders';
import { RouterProvider } from './routing/RouterProvider';
import { AppShell } from './shells/AppShell';
import { GlobalShell } from './shells/GlobalShell';

export function App() {
  return (
    <Suspense fallback={<GlobalShell />}>
      <AppProviders children={
        <Suspense fallback={<AppShell />}>
          <RouterProvider />
        </Suspense>
      } />
    </Suspense>
  );
}
