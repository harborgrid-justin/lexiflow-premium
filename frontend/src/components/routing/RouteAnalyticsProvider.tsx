/**
 * Route Analytics Provider
 *
 * Wraps the application to provide automatic route tracking,
 * prefetching, and transition management.
 *
 * @module components/routing/RouteAnalyticsProvider
 */

import { routeAnalytics } from '@/services/analytics/routeAnalytics';
import { routePrefetch } from '@/services/routing/routePrefetch';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigation } from 'react-router';

export interface RouteAnalyticsProviderProps {
  children: React.ReactNode;
  enableAnalytics?: boolean;
  enablePrefetch?: boolean;
  prefetchHighPriority?: boolean;
}

/**
 * Route Analytics Provider Component
 *
 * Automatically tracks route changes and manages prefetching
 */
export function RouteAnalyticsProvider({
  children,
  enableAnalytics = true,
  enablePrefetch = true,
  prefetchHighPriority = true,
}: RouteAnalyticsProviderProps) {
  const location = useLocation();
  const navigation = useNavigation();
  const previousLocation = useRef<string>();
  const isInitialMount = useRef(true);

  // Initialize on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // Set enabled states
      routeAnalytics.setEnabled(enableAnalytics);
      routePrefetch.setEnabled(enablePrefetch);

      // Prefetch high-priority routes
      if (prefetchHighPriority && enablePrefetch) {
        routePrefetch.prefetchHighPriority();
      }
    }
  }, [enableAnalytics, enablePrefetch, prefetchHighPriority]);

  // Track route changes
  useEffect(() => {
    const currentPath = location.pathname;

    // Skip if this is the same route
    if (currentPath === previousLocation.current) {
      return;
    }

    // Mark route load start
    if (enableAnalytics) {
      routeAnalytics.markRouteLoadStart(currentPath);
    }

    // Track route change after navigation completes
    if (navigation.state === 'idle') {
      if (enableAnalytics) {
        routeAnalytics.trackRouteChange(currentPath, previousLocation.current);
      }

      if (enablePrefetch) {
        // Record visit for predictive prefetching
        routePrefetch.recordVisit(currentPath, previousLocation.current);

        // Prefetch predicted next routes
        routePrefetch.prefetchPredicted(currentPath);
      }

      // Update previous location
      previousLocation.current = currentPath;
    }
  }, [location.pathname, navigation.state, enableAnalytics, enablePrefetch]);

  // Log analytics summary in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const interval = setInterval(() => {
        const summary = routeAnalytics.getAnalyticsSummary();
        const prefetchStats = routePrefetch.getStatistics();
        console.log('[Route Analytics Summary]', summary);
        console.log('[Route Prefetch Stats]', prefetchStats);
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return <>{children}</>;
}

/**
 * HOC to wrap components with route analytics
 */
export function withRouteAnalytics<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function RouteAnalyticsWrappedComponent(props: P) {
    return (
      <RouteAnalyticsProvider>
        <Component {...props} />
      </RouteAnalyticsProvider>
    );
  };
}
