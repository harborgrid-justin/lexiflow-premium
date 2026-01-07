/**
 * Server-side state hydration
 */

interface ServerState {
  [key: string]: any;
}

export function prepareServerState(request: any): ServerState {
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

function extractThemeFromCookies(request: any): "light" | "dark" {
  const cookies = request.cookies || {};
  return cookies.theme || "light";
}

function extractLocaleFromHeaders(request: any): string {
  const acceptLanguage = request.headers?.["accept-language"] || "";
  const locale = acceptLanguage.split(",")[0]?.split("-")[0];
  return locale || "en";
}

export function serializeState(state: ServerState): string {
  return JSON.stringify(state);
}
