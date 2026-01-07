/**
 * Server-side state hydration
 */

interface ServerState {
  [key: string]: unknown;
}

export interface HydrationRequest {
  cookies?: Record<string, string>;
  headers?: Record<string, string | string[] | undefined>;
}

export function prepareServerState(request: HydrationRequest): ServerState {
  // Extract initial state from request context
  // Could include user data, feature flags, etc.

  return {
    userPreferences: {
      theme: extractThemeFromCookies(request),
      locale: extractLocaleFromHeaders(request),
      sidebarOpen: true,
    },
  };
}

function extractThemeFromCookies(request: HydrationRequest): "light" | "dark" {
  const cookies = request.cookies || {};
  const theme = cookies.theme;
  return theme === "dark" || theme === "light" ? theme : "light";
}

function extractLocaleFromHeaders(request: HydrationRequest): string {
  const header = request.headers?.["accept-language"];
  const acceptLanguage = Array.isArray(header) ? header[0] : header || "";
  const locale = acceptLanguage.split(",")[0]?.split("-")[0];
  return locale || "en";
}

export function serializeState(state: ServerState): string {
  return JSON.stringify(state);
}
