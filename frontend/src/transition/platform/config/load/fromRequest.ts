/**
 * Load configuration from request (SSR)
 */

import type { Config } from "../types";

export function loadFromRequest(): Partial<Config> {
  // This would be populated from request headers/cookies in SSR
  // For now, return empty object
  return {};
}
