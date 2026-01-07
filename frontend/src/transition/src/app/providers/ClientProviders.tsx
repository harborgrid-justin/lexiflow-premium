/**
 * ClientProviders - Client-only provider wrappers
 * Client state hydration, devtools, browser-specific features
 */

import { type ReactNode, useEffect } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side provider composition
 * Handles client-only features like devtools, hot reload, analytics
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Initialize client-only features
    initializeDevTools();
    initializeAnalytics();
    initializeHotReload();
  }, []);

  return (
    <ClientContext.Provider value={{ isClient: true }}>
      {children}
    </ClientContext.Provider>
  );
}

// Client Context
import { createContext, useContext } from 'react';

interface ClientContextValue {
  isClient: boolean;
}

const ClientContext = createContext<ClientContextValue>({ isClient: false });

export function useClientContext() {
  return useContext(ClientContext);
}

// Client-only initialization functions
function initializeDevTools() {
  if (process.env.NODE_ENV === 'development') {
    // Initialize React DevTools, Redux DevTools, etc.
    console.log('[ClientProviders] DevTools initialized');
  }
}

function initializeAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    // Initialize analytics (Google Analytics, Segment, etc.)
    console.log('[ClientProviders] Analytics initialized');
  }
}

function initializeHotReload() {
  if (import.meta.hot) {
    // Vite HMR
    console.log('[ClientProviders] Hot Module Replacement enabled');
  }
}
