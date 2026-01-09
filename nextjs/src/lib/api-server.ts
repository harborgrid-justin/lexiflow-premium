/**
 * Server-side API utilities
 * Safe for Server Components (uses next/headers)
 */
import { API_BASE_URL } from "@/lib/api-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  // Use try-catch to handle contexts where cookies() is not available (e.g. static generation)
  let token: string | undefined;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get("auth_token")?.value;
  } catch (error) {
    // Ignore error in contexts where cookies are not available
  }

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

    if (response.status === 401) {
      // If unauthorized, redirect to login page
      // Note: This will throw a NEXT_REDIRECT error which is caught by Next.js
      redirect("/login");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    // If it's a redirect error, let it bubble up
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Re-throw redirect errors from the response block above
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      (error as any).message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    // Checking for DIGEST_REDIRECT which is how Next.js handles redirects internally sometimes
    if (
      typeof error === "object" &&
      error !== null &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("API fetch error:", error);
    throw error;
  }
}
