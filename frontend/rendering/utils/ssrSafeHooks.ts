/**
 * SSR-Safe Hooks Utilities
 *
 * Utilities for creating SSR-safe React hooks that handle
 * browser-only APIs gracefully.
 *
 * @module rendering/utils/ssrSafeHooks
 */

import { useEffect, useState } from "react";
import { isBrowser } from "./environment";

/**
 * Hook that returns true only when running in the browser
 *
 * This is useful for components that need to render differently
 * on server vs client to avoid hydration mismatches.
 *
 * @returns true if running in browser, false on server
 */
export function useIsBrowser(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && isBrowser();
}

/**
 * Hook that returns true only after the component has mounted
 *
 * Useful for preventing hydration mismatches when using browser APIs
 * or when rendering content that differs between server and client.
 *
 * @returns true after mount, false before
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * SSR-safe version of useEffect that only runs on the client
 *
 * @param effect - Effect function to run only on client
 * @param deps - Dependency array
 */
export function useClientEffect(
  effect: () => void | (() => void),
  deps?: React.DependencyList
): void {
  useEffect(() => {
    if (isBrowser()) {
      return effect();
    }
  }, deps);
}

/**
 * Hook for getting window dimensions with SSR safety
 *
 * @returns Object with width and height, or undefined on server
 */
export function useWindowSize(): { width?: number; height?: number } {
  const [size, setSize] = useState<{ width?: number; height?: number }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

/**
 * Hook for safely accessing localStorage with SSR support
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 */
export function useSafeLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (!isBrowser()) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (isBrowser()) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
