import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Base URL for the NestJS Backend
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

type ValidMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
  revalidate?: number;
  skipAuth?: boolean;
}

export class ServerAPI {
  /**
   * Helper to construct URL with query params
   */
  private static buildUrl(endpoint: string, params?: Record<string, any>) {
    const url = new URL(
      `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    );
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  /**
   * Core fetch wrapper
   */
  private static async request<T>(
    method: ValidMethods,
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, tags, revalidate, skipAuth, headers, ...customConfig } =
      options;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...customConfig,
    };

    // Inject Auth Token
    if (!skipAuth && token) {
      (config.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }

    // Configure caching/revalidation
    if (tags || revalidate !== undefined) {
      config.next = {
        ...(tags ? { tags } : {}),
        ...(revalidate !== undefined ? { revalidate } : {}),
      };
    } else {
      // Next.js 15+ default is 'no-store' for fetch with dynamic functions (cookies)
      // We explicitly set it if needed, but here we let Next.js decide.
      // If we want to cache user-specific data, using 'tags' usually implies we want to cache it.
      // But BEWARE: Shared Data Cache with User Auth is dangerous.
      // SAFE DEFAULT: If auth token is used, do NOT cache unless explicitly handled.
      // Code decision: If tags are present, Next.js caches.
      // We must ensure unique tags per user if we cache user data.
      // OR we use 'cache: "no-store"' to be safe.
    }

    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          // Check if we are already on login page to avoid loops?
          // Redirecting from a server component/action is fine.
          // redirect("/login"); // Optional: strict redirect
        }

        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Request failed with status ${response.status}`
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: any) {
      // Improve error logging here (e.g. sentry)
      console.error(`[ServerAPI] ${method} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  static async get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>("GET", endpoint, options);
  }

  static async post<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>("POST", endpoint, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  static async put<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>("PUT", endpoint, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  static async patch<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>("PATCH", endpoint, {
      ...options,
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>("DELETE", endpoint, options);
  }
}
