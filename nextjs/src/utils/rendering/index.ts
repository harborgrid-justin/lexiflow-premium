/**
 * Rendering Environment Utilities
 * Provides utility functions for determining the current rendering context
 */

/**
 * Check if code is running in browser environment
 * Returns true in browser, false on server
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Check if code is running on server environment
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Get current environment type
 */
export type RenderingEnvironment = "browser" | "server" | "unknown";

export const getEnvironment = (): RenderingEnvironment => {
  if (isBrowser()) return "browser";
  if (isServer()) return "server";
  return "unknown";
};

/**
 * Check if running in a web worker
 */
export const isWebWorker = (): boolean => {
  return isBrowser() && typeof importScripts === "function";
};
