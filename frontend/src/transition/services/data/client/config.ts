/**
 * Backend API Configuration
 *
 * Centralized configuration for backend API connection.
 * Supports different environments (development, production, edge).
 *
 * @module services/data/client/config
 */

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
  // Check if we're in browser
  const isBrowser = typeof window !== "undefined";

  // Get API URL from environment or use defaults
  const apiUrl = isBrowser
    ? (window as any).__BACKEND_API_URL__ ||
      import.meta.env?.VITE_BACKEND_API_URL ||
      "http://localhost:3000"
    : process.env.VITE_BACKEND_API_URL ||
      process.env.BACKEND_API_URL ||
      "http://localhost:3000";

  return {
    apiUrl,
    apiVersion: "/api",
    withCredentials: true,
    timeout: 30000,
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
