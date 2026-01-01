/**
 * Rendering Utilities Module
 *
 * Exports utilities for SSR-safe development:
 * - Environment detection (isBrowser, isServer, etc.)
 * - Browser API guards (browserOnly, serverOnly)
 * - Safe browser object access (safeWindow, safeDocument, etc.)
 * - SSR-safe React hooks
 *
 * @module rendering/utils
 */

// Environment detection
export {
  browserOnly,
  isBrowser,
  isDevelopment,
  isNode,
  isProduction,
  isServer,
  safeDocument,
  safeLocalStorage,
  safeNavigator,
  safeSessionStorage,
  safeWindow,
  serverOnly,
} from "./environment";

// SSR-safe hooks
export {
  useClientEffect,
  useIsBrowser,
  useIsClient,
  useSafeLocalStorage,
  useWindowSize,
} from "./ssrSafeHooks";
