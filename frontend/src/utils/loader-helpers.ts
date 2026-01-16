/**
 * Loader Helper Utilities
 *
 * Provides reusable utilities for React Router loaders
 * to handle authentication errors consistently
 */

import type { LoaderFunctionArgs } from "react-router";

/**
 * Handle authentication errors in loaders
 *
 * This function provides consistent handling of authentication errors
 * for both SSR and client-side contexts:
 * - During SSR: Throws a 302 redirect response to login
 * - On client: Re-throws the error to trigger response-handler redirect
 *
 * @param error - The caught error
 * @param args - LoaderFunctionArgs containing the request
 * @throws Response with redirect or re-throws the error
 */
export function handleLoaderAuthError(
  error: unknown,
  args: LoaderFunctionArgs
): never {
  console.error("[Loader] Authentication error:", error);

  // Check if this is an SSR authentication error
  if (error instanceof Error && error.message === "SSR_AUTH_REQUIRED") {
    // During SSR, throw a redirect response
    const url = new URL(args.request.url);
    throw new Response(null, {
      status: 302,
      headers: {
        Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
      },
    });
  }

  // Check if this is a client-side authentication error
  if (
    error instanceof Error &&
    (error.message.includes("Authentication required") ||
      error.message.includes("Session expired"))
  ) {
    // Let the error propagate to trigger the redirect in response-handler
    throw error;
  }

  // For other errors, re-throw
  throw error;
}

/**
 * Wrap a loader function with authentication error handling
 *
 * @param loaderFn - The loader function to wrap
 * @param fallbackData - Optional fallback data to return on non-auth errors
 * @returns Wrapped loader function
 *
 * @example
 * export const clientLoader = withAuthErrorHandler(
 *   async (args) => {
 *     const data = await DataService.getData();
 *     return { data };
 *   },
 *   { data: [] } // fallback
 * );
 */
export function withAuthErrorHandler<T>(
  loaderFn: (args: LoaderFunctionArgs) => Promise<T>,
  fallbackData?: T
) {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    try {
      return await loaderFn(args);
    } catch (error) {
      // Try to handle as auth error first
      // If this is an auth error, this call will throw/redirect.
      handleLoaderAuthError(error, args);

      // If we get here, it's a non-auth error
      console.error("[Loader] Non-auth error:", error);

      if (fallbackData !== undefined) {
        return fallbackData;
      }

      // No fallback provided, re-throw
      throw error;
    }
  };
}
