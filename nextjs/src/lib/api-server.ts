/**
 * Server-side API utilities
 * Safe for Server Components (uses next/headers)
 */
import { API_BASE_URL } from "@/lib/api-config";
import { cookies } from "next/headers";

/**
 * Server-side fetch wrapper with proper error handling
 * Use this in Server Components and API routes
 *
 * @example
 * // In a Server Component:
 * const cases = await apiFetch<Case[]>(API_ENDPOINTS.CASES.LIST);
 * const case = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL('123'));
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token from cookies (Next.js 16: cookies() is async)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      // Add cache control for Next.js 16
      next: {
        revalidate: options?.next?.revalidate ?? 0, // Default: always fresh
        tags: options?.next?.tags,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}
