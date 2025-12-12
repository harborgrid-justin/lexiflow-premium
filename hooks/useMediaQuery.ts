/**
 * useMediaQuery Hook
 * React hook for CSS media queries
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track if a media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((mediaQuery: string): boolean => {
    // Prevents SSR issues
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(mediaQuery).matches;
  }, []);

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => setMatches(getMatches(query));

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Modern browsers use addEventListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', documentChangeHandler);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(documentChangeHandler);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', documentChangeHandler);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(documentChangeHandler);
      }
    };
  }, [query, getMatches]);

  return matches;
}

/**
 * Breakpoint helpers for common responsive designs
 */
export const breakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/**
 * Convenience hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery(breakpoints.mobile);
export const useIsTablet = () => useMediaQuery(breakpoints.tablet);
export const useIsDesktop = () => useMediaQuery(breakpoints.desktop);
export const useIsSm = () => useMediaQuery(breakpoints.sm);
export const useIsMd = () => useMediaQuery(breakpoints.md);
export const useIsLg = () => useMediaQuery(breakpoints.lg);
export const useIsXl = () => useMediaQuery(breakpoints.xl);
export const useIs2xl = () => useMediaQuery(breakpoints['2xl']);

/**
 * Hook to check system preferences
 */
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: high)');

export default useMediaQuery;
