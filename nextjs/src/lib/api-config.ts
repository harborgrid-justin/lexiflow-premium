/**
 * API Configuration for Next.js
 * Manages backend API communication with proper server/client handling
 */

// Backend API URL - use environment variable or fallback to localhost
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  // Cases
  CASES: {
    LIST: "/cases",
    DETAIL: (id: string) => `/cases/${id}`,
    CREATE: "/cases",
    UPDATE: (id: string) => `/cases/${id}`,
    DELETE: (id: string) => `/cases/${id}`,
  },
  // Documents
  DOCUMENTS: {
    LIST: "/documents",
    DETAIL: (id: string) => `/documents/${id}`,
    UPLOAD: "/documents/upload",
    DELETE: (id: string) => `/documents/${id}`,
  },
  // Dashboard
  DASHBOARD: {
    METRICS: "/dashboard/metrics",
    ACTIVITY: "/dashboard/activity",
  },
} as const;

/**
 * Fetch wrapper with proper error handling
 * Use this in server components and API routes
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}
