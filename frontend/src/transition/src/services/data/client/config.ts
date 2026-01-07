/**
 * Backend API Configuration
 *
 * Centralized configuration for backend API connection.
 * Uses platform env config for consistent configuration.
 *
 * @module services/data/client/config
 */

import { env } from "../../../platform/config/env";

export interface BackendConfig {
  /** Base URL of the backend API */
  apiUrl: string;
  /** API version prefix */
  apiVersion: string;
  /** Whether to include credentials (cookies) */
  withCredentials: boolean;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Get backend configuration based on environment
 */
export function getBackendConfig(): BackendConfig {
  return {
    apiUrl: env.apiBaseUrl,
    apiVersion: "/api",
    withCredentials: true,
    timeout: env.apiTimeout,
  };
}

/**
 * Build full API endpoint URL
 */
export function buildApiUrl(endpoint: string): string {
  const config = getBackendConfig();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If endpoint already includes /api, don't add it again
  if (cleanEndpoint.startsWith("/api")) {
    return `${config.apiUrl}${cleanEndpoint}`;
  }

  return `${config.apiUrl}${config.apiVersion}${cleanEndpoint}`;
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const url = buildApiUrl("/health");
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}
