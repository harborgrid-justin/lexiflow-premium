/**
 * Resolve theme mode from storage and system preference
 */

import type { ThemeMode } from "../types";

export function resolveMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  // Check localStorage
  const stored = localStorage.getItem("theme-mode") as ThemeMode;
  if (stored && ["light", "dark", "system"].includes(stored)) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}
