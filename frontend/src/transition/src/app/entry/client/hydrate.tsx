/**
 * Client-side Hydration Entry Point
 * Bootstrap React app with hydrateRoot
 */

import { hydrateRoot } from 'react-dom/client';
import { App } from '../../App';
import { ClientProviders } from '../../providers/ClientProviders';

export function hydrate() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  hydrateRoot(
    rootElement,
    <ClientProviders>
      <App />
    </ClientProviders>
  );
}

// Auto-hydrate if not in module context
if (typeof window !== 'undefined' && !import.meta.hot) {
  hydrate();
}
