/**
 * @module hooks/useCodeSplitting
 * @category Hooks - Performance
 *
 * Code splitting and lazy loading utilities for React components.
 * Reduces initial bundle size and improves application load time.
 *
 * @example
 * ```tsx
 * // Basic lazy loading
 * const HeavyComponent = useLazyComponent(() => import('./HeavyComponent'));
 *
 * // With loading state
 * const { Component, isLoading, error } = useLazyComponentWithState(
 *   () => import('./HeavyComponent')
 * );
 *
 * // Preload on hover
 * const { Component, preload } = usePreloadableComponent(
 *   () => import('./HeavyComponent')
 * );
 * ```
 */

import { useState, useEffect, useCallback, lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Component import function type
 */
export type ComponentImportFunc<T = any> = () => Promise<{ default: ComponentType<T> }>;

/**
 * Lazy component loading state
 */
export interface LazyComponentState<T = any> {
  /** Loaded component (null if not loaded) */
  Component: ComponentType<T> | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Manually trigger loading */
  load: () => Promise<void>;
  /** Reset state */
  reset: () => void;
}

/**
 * Preloadable component interface
 */
export interface PreloadableComponent<T = any> {
  /** Lazy component */
  Component: LazyExoticComponent<ComponentType<T>>;
  /** Preload function */
  preload: () => Promise<void>;
  /** Check if already loaded */
  isPreloaded: boolean;
}

/**
 * Basic lazy component hook
 *
 * Creates a lazy-loaded component using React.lazy.
 * Component will be loaded when first rendered.
 *
 * @param importFunc - Dynamic import function
 * @returns Lazy component
 *
 * @example
 * ```tsx
 * function App() {
 *   const LazyDashboard = useLazyComponent(
 *     () => import('./Dashboard')
 *   );
 *
 *   return (
 *     <Suspense fallback={<Loading />}>
 *       <LazyDashboard />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function useLazyComponent<T = any>(
  importFunc: ComponentImportFunc<T>,
): LazyExoticComponent<ComponentType<T>> {
  const [Component] = useState(() => lazy(importFunc));
  return Component;
}

/**
 * Lazy component with loading state
 *
 * Provides manual control over component loading and access to loading state.
 * Useful when you need to handle loading/error states manually.
 *
 * @param importFunc - Dynamic import function
 * @param options - Configuration options
 * @returns Component state object
 *
 * @example
 * ```tsx
 * function App() {
 *   const { Component, isLoading, error, load } = useLazyComponentWithState(
 *     () => import('./HeavyComponent')
 *   );
 *
 *   useEffect(() => {
 *     // Load component after delay
 *     const timer = setTimeout(load, 1000);
 *     return () => clearTimeout(timer);
 *   }, [load]);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!Component) return null;
 *
 *   return <Component />;
 * }
 * ```
 */
export function useLazyComponentWithState<T = any>(
  importFunc: ComponentImportFunc<T>,
  options: {
    /** Auto-load on mount */
    autoLoad?: boolean;
    /** Retry on error */
    retryOnError?: boolean;
    /** Retry delay in ms */
    retryDelay?: number;
  } = {},
): LazyComponentState<T> {
  const { autoLoad = false, retryOnError = false, retryDelay = 1000 } = options;

  const [Component, setComponent] = useState<ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (Component || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component');
      setError(error);

      // Retry if enabled
      if (retryOnError) {
        setTimeout(() => {
          setIsLoading(false);
          void load();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [Component, importFunc, isLoading, retryDelay, retryOnError]);

  const reset = useCallback(() => {
    setComponent(null);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      void load();
    }
  }, [autoLoad, load]);

  return {
    Component,
    isLoading,
    error,
    load,
    reset,
  };
}

/**
 * Preloadable component hook
 *
 * Creates a lazy component with preloading capability.
 * Useful for prefetching components on hover or route preparation.
 *
 * @param importFunc - Dynamic import function
 * @returns Preloadable component object
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   const { Component: Dashboard, preload } = usePreloadableComponent(
 *     () => import('./Dashboard')
 *   );
 *
 *   return (
 *     <Link
 *       to="/dashboard"
 *       onMouseEnter={preload} // Preload on hover
 *     >
 *       Dashboard
 *     </Link>
 *   );
 * }
 * ```
 */
export function usePreloadableComponent<T = any>(
  importFunc: ComponentImportFunc<T>,
): PreloadableComponent<T> {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const promiseRef = useState<Promise<void> | null>(null)[0];

  const Component = useState(() => lazy(importFunc))[0];

  const preload = useCallback(async () => {
    if (isPreloaded || promiseRef) return;

    try {
      await importFunc();
      setIsPreloaded(true);
    } catch (error) {
      console.error('Failed to preload component:', error);
    }
  }, [importFunc, isPreloaded, promiseRef]);

  return {
    Component,
    preload,
    isPreloaded,
  };
}

/**
 * Route-based code splitting hook
 *
 * Manages lazy loading for route components with prefetching.
 * Automatically preloads routes on link hover.
 *
 * @param routes - Route configuration
 * @returns Route components map
 *
 * @example
 * ```tsx
 * function App() {
 *   const routes = useRouteComponents({
 *     dashboard: () => import('./pages/Dashboard'),
 *     settings: () => import('./pages/Settings'),
 *     profile: () => import('./pages/Profile'),
 *   });
 *
 *   return (
 *     <Routes>
 *       <Route path="/dashboard" element={
 *         <Suspense fallback={<Loading />}>
 *           <routes.dashboard.Component />
 *         </Suspense>
 *       } />
 *     </Routes>
 *   );
 * }
 * ```
 */
export function useRouteComponents<T extends Record<string, ComponentImportFunc>>(
  routes: T,
): {
  [K in keyof T]: PreloadableComponent;
} {
  const [routeComponents] = useState(() => {
    const components: Record<string, PreloadableComponent> = {};

    for (const [key, importFunc] of Object.entries(routes)) {
      const Component = lazy(importFunc);
      let preloadPromise: Promise<void> | null = null;
      let isPreloaded = false;

      components[key] = {
        Component,
        preload: async () => {
          if (preloadPromise) return preloadPromise;
          if (isPreloaded) return;

          preloadPromise = importFunc()
            .then(() => {
              isPreloaded = true;
            })
            .catch((error) => {
              console.error(`Failed to preload route ${key}:`, error);
            });

          return preloadPromise;
        },
        get isPreloaded() {
          return isPreloaded;
        },
      };
    }

    return components as {
      [K in keyof T]: PreloadableComponent;
    };
  });

  return routeComponents;
}

/**
 * Dynamic chunk loading with timeout
 *
 * Loads a chunk with timeout and retry logic.
 * Prevents hanging on slow networks.
 *
 * @param importFunc - Import function
 * @param timeout - Timeout in ms
 * @returns Component import promise
 *
 * @example
 * ```tsx
 * const Component = lazy(() =>
 *   loadWithTimeout(
 *     () => import('./HeavyComponent'),
 *     5000 // 5 second timeout
 *   )
 * );
 * ```
 */
export function loadWithTimeout<T>(
  importFunc: ComponentImportFunc<T>,
  timeout: number = 10000,
): Promise<{ default: ComponentType<T> }> {
  return Promise.race([
    importFunc(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Component load timeout')), timeout)
    ),
  ]);
}

/**
 * Load component with retry logic
 *
 * Automatically retries failed imports with exponential backoff.
 *
 * @param importFunc - Import function
 * @param maxRetries - Maximum retry attempts
 * @param baseDelay - Base delay between retries
 * @returns Component import promise
 *
 * @example
 * ```tsx
 * const Component = lazy(() =>
 *   loadWithRetry(
 *     () => import('./Component'),
 *     3, // Retry up to 3 times
 *     1000 // Start with 1 second delay
 *   )
 * );
 * ```
 */
export async function loadWithRetry<T>(
  importFunc: ComponentImportFunc<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<{ default: ComponentType<T> }> {
  let lastError: Error = new Error('Max retries exceeded');

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Import failed');

      if (i < maxRetries - 1) {
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Prefetch multiple components
 *
 * Batch prefetch components for better performance.
 *
 * @param importFuncs - Array of import functions
 * @returns Promise that resolves when all loaded
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   // Prefetch related components on idle
 *   void prefetchComponents([
 *     () => import('./Dashboard'),
 *     () => import('./Settings'),
 *     () => import('./Profile'),
 *   ]);
 * }, []);
 * ```
 */
export async function prefetchComponents(
  importFuncs: ComponentImportFunc[],
): Promise<void> {
  await Promise.allSettled(importFuncs.map(func => func()));
}

/**
 * Request idle callback hook for lazy loading
 *
 * Defers component loading until browser is idle.
 *
 * @param importFunc - Import function
 * @returns Lazy component
 *
 * @example
 * ```tsx
 * const LowPriorityComponent = useIdleLazyComponent(
 *   () => import('./LowPriorityComponent')
 * );
 * ```
 */
export function useIdleLazyComponent<T = any>(
  importFunc: ComponentImportFunc<T>,
): LazyExoticComponent<ComponentType<T>> {
  const [Component] = useState(() =>
    lazy(() => new Promise<{ default: ComponentType<T> }>((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          void importFunc().then(resolve);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          void importFunc().then(resolve);
        }, 1);
      }
    }))
  );

  return Component;
}
