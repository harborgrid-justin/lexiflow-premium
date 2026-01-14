/**
 * Prefetch Link Component
 *
 * Enhanced Link component with automatic prefetching on hover
 * and viewport intersection.
 *
 * @module components/routing/PrefetchLink
 */

import { routeAnalytics } from '@/services/analytics/routeAnalytics';
import { useRoutePrefetch } from '@/services/routing/routePrefetch';
import { useEffect, useRef } from 'react';
import { Link, LinkProps } from 'react-router';

export interface PrefetchLinkProps extends Omit<LinkProps, 'prefetch'> {
  prefetch?: 'hover' | 'viewport' | 'both' | 'none';
  prefetchDelay?: number;
  trackIntent?: boolean;
}

/**
 * Enhanced Link with prefetching capabilities
 */
export function PrefetchLink({
  to,
  prefetch = 'hover',
  prefetchDelay,
  trackIntent = true,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}: PrefetchLinkProps) {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const {
    onHover,
    onHoverLeave,
    observeElement,
    unobserveElement,
  } = useRoutePrefetch();

  const path = typeof to === 'string' ? to : to.pathname || '';

  // Set up viewport-based prefetching
  useEffect(() => {
    if ((prefetch === 'viewport' || prefetch === 'both') && elementRef.current) {
      observeElement(elementRef.current, path);

      return () => {
        if (elementRef.current) {
          unobserveElement(elementRef.current);
        }
      };
    }
  }, [path, prefetch, observeElement, unobserveElement]);

  // Handle hover events
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch === 'hover' || prefetch === 'both') {
      onHover(path, e.currentTarget);
    }

    if (trackIntent) {
      routeAnalytics.trackNavigationIntent(path);
    }

    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch === 'hover' || prefetch === 'both') {
      onHoverLeave(path);
    }

    onMouseLeave?.(e);
  };

  return (
    <Link
      ref={elementRef}
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}
