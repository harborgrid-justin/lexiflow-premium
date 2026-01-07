/**
 * RouterProvider - Router integration wrapper
 * Framework-agnostic router provider with basic client-side routing
 */

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { routes } from './routes';

interface RouterContextValue {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}

interface RouterProviderProps {
  children: ReactNode;
}

/**
 * Basic client-side router provider
 * Uses window.location for navigation
 */
export function RouterProvider({ children }: RouterProviderProps) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Intercept link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href && anchor.origin === window.location.origin) {
        e.preventDefault();
        const path = anchor.pathname;
        navigate(path);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Find matching route
  const matchedRoute = routes.find(route => {
    if (route.path === '*') return false;
    if (route.path === currentPath) return true;
    return false;
  });

  const routeToRender = matchedRoute || routes.find(r => r.path === '*');

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {routeToRender?.element || children}
    </RouterContext.Provider>
  );
}
