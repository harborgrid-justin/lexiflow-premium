/**
 * Persist theme mode to storage
 */

import type { ThemeMode } from "../types";

export function persistMode(mode: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("theme-mode", mode);
}
