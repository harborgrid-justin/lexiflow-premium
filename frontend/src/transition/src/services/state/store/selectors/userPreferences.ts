/**
 * Example selector - User preferences selector
 */

import { store } from "../index";

interface UserPreferencesState {
  theme: "light" | "dark";
  locale: string;
  sidebarOpen: boolean;
}

export function selectTheme(): "light" | "dark" {
  const preferences = store.getState<UserPreferencesState>("userPreferences");
  return preferences?.theme || "light";
}

export function selectLocale(): string {
  const preferences = store.getState<UserPreferencesState>("userPreferences");
  return preferences?.locale || "en";
}

export function selectSidebarOpen(): boolean {
  const preferences = store.getState<UserPreferencesState>("userPreferences");
  return preferences?.sidebarOpen ?? true;
}
