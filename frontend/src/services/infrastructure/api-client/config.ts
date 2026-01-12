/**
 * API Client Configuration
 * Centralized configuration for timeouts, tokens, and URLs
 */

import {
  API_TIMEOUT_MS,
  getApiBaseUrl,
  getApiPrefix,
} from "@/config/network/api.config";
import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from "@/config/security/security.config";
import { TIMEOUTS, URLS, HOSTS } from "@/config/ports.config";

export const DEFAULT_TIMEOUT = API_TIMEOUT_MS;
export const HEALTH_CHECK_TIMEOUT = TIMEOUTS.HEALTH_CHECK;

export const AUTH_TOKEN_KEY =
  import.meta.env?.VITE_AUTH_TOKEN_KEY || AUTH_TOKEN_STORAGE_KEY;

export const REFRESH_TOKEN_KEY =
  import.meta.env?.VITE_AUTH_REFRESH_TOKEN_KEY ||
  AUTH_REFRESH_TOKEN_STORAGE_KEY;

/**
 * Build complete base URL with API prefix
 */
export function buildBaseURL(): string {
  const base = getApiBaseUrl();
  const prefix = getApiPrefix();

  // If base is empty (dev proxy), return prefix
  if (!base) {
    return prefix;
  }

  // If base already ends with prefix, return as is
  if (base.endsWith(prefix)) {
    return base;
  }

  // Append prefix, ensuring no double slashes
  return `${base.replace(/\/$/, "")}${prefix}`;
}

/**
 * Get current origin safely (handles SSR)
 */
export function getOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return URLS.backend(HOSTS.LOCAL);
}
