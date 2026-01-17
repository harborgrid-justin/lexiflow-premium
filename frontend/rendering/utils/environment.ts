/**
 * SSR Environment Detection Utilities
 *
 * Provides utilities for detecting server-side rendering environments
 * and safely accessing browser-only APIs.
 *
 * @module rendering/utils/environment
 */

/**
 * Checks if code is running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Checks if code is running on the server
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Checks if code is running in Node.js environment
 */
export const isNode = (): boolean => {
  const nodeProcess =
    typeof process !== "undefined"
      ? (process as { versions?: { node?: string } })
      : undefined;
  return (
    typeof nodeProcess !== "undefined" &&
    nodeProcess.versions != null &&
    nodeProcess.versions.node != null
  );
};

/**
 * Checks if code is running in development mode
 */
export const isDevelopment = (): boolean => {
  if (isBrowser()) {
    // Use process.env in test environments, import.meta.env in browser
    const nodeEnv =
      typeof process !== "undefined"
        ? (process as { env?: Record<string, string | undefined> }).env
            ?.NODE_ENV
        : undefined;
    if (nodeEnv) {
      return nodeEnv === "development";
    }
    return (
      (import.meta as unknown as { env: Record<string, boolean> }).env?.DEV ??
      false
    );
  }
  return (
    (process as { env?: Record<string, string | undefined> }).env?.NODE_ENV ===
    "development"
  );
};

/**
 * Checks if code is running in production mode
 */
export const isProduction = (): boolean => {
  if (isBrowser()) {
    // Use process.env in test environments, import.meta.env in browser
    const nodeEnv =
      typeof process !== "undefined"
        ? (process as { env?: Record<string, string | undefined> }).env
            ?.NODE_ENV
        : undefined;
    if (nodeEnv) {
      return nodeEnv === "production";
    }
    return (
      (import.meta as unknown as { env: Record<string, boolean> }).env?.PROD ??
      false
    );
  }
  return (
    (process as { env?: Record<string, string | undefined> }).env?.NODE_ENV ===
    "production"
  );
};

/**
 * Safely executes a function only in browser environment
 *
 * @param fn - Function to execute in browser
 * @param fallback - Optional fallback value for server
 * @returns Result of function or fallback
 */
export function browserOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isBrowser()) {
    try {
      return fn();
    } catch (error) {
      console.error("[BrowserOnly] Error executing browser-only code:", error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Safely executes a function only in server environment
 *
 * @param fn - Function to execute on server
 * @param fallback - Optional fallback value for browser
 * @returns Result of function or fallback
 */
export function serverOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isServer()) {
    try {
      return fn();
    } catch (error) {
      console.error("[ServerOnly] Error executing server-only code:", error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Gets a safe reference to window object
 * Returns undefined on server
 */
export const safeWindow = (): (Window & typeof globalThis) | undefined => {
  return browserOnly(() => window);
};

/**
 * Gets a safe reference to document object
 * Returns undefined on server
 */
export const safeDocument = (): Document | undefined => {
  return browserOnly(() => document);
};

/**
 * Gets a safe reference to navigator object
 * Returns undefined on server
 */
export const safeNavigator = (): Navigator | undefined => {
  return browserOnly(() => navigator);
};

/**
 * Gets a safe reference to localStorage
 * Returns null on server or if localStorage is not available
 */
export const safeLocalStorage = (): Storage | null => {
  return (
    browserOnly(() => {
      try {
        return window.localStorage;
      } catch {
        return null;
      }
    }, null) ?? null
  );
};

/**
 * Gets a safe reference to sessionStorage
 * Returns null on server or if sessionStorage is not available
 */
export const safeSessionStorage = (): Storage | null => {
  return (
    browserOnly(() => {
      try {
        return window.sessionStorage;
      } catch {
        return null;
      }
    }, null) ?? null
  );
};
