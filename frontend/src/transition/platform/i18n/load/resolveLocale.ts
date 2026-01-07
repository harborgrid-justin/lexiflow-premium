/**
 * Resolve locale from storage and browser preference
 */

import type { Locale } from "../types";

const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr"];

export function resolveLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  // Check localStorage
  const stored = localStorage.getItem("locale") as Locale;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split("-")[0] as Locale;
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang;
  }

  return "en";
}
