/**
 * Platform Services Barrel Export
 *
 * Centralized export for all platform-level services.
 * Includes config, theme, i18n, observability, and security.
 *
 * @example
 * import { useConfig, useTheme, useI18n } from '@/platform';
 */

// Config
export { ConfigProvider, useConfig } from "./config/ConfigProvider";
export { loadFromEnv as loadConfigFromEnv } from "./config/load/fromEnv";
export { loadFromRemoteFlags as loadConfigFromRemoteFlags } from "./config/load/fromRemoteFlags";
export { loadFromRequest as loadConfigFromRequest } from "./config/load/fromRequest";
export type { Config } from "./config/types";

// Theme
export { ThemeProvider, useTheme } from "./theme/ThemeProvider";
export { darkTheme } from "./theme/themes/dark";
export { lightTheme } from "./theme/themes/light";
export { tokens } from "./theme/tokens";
export type { Theme, ThemeMode } from "./theme/types";

// i18n
export { formatDate } from "./i18n/formatters/date";
export { formatCurrency, formatNumber } from "./i18n/formatters/number";
export { I18nProvider, useI18n } from "./i18n/I18nProvider";
export type { Dictionary, Locale } from "./i18n/types";

// Observability
export { analytics } from "./observability/analytics";
export { ErrorBoundaryProvider } from "./observability/ErrorBoundaryProvider";
export { logger } from "./observability/logger";
export { tracer } from "./observability/tracing";

// Security
export { defaultCSP as CSP_CONFIG } from "./security/csp";
export {
  maskString,
  redactAll,
  redactApiKey,
  redactCreditCard,
  redactEmail,
  redactPhone,
  redactSSN,
} from "./security/redaction";
export {
  deleteCookie,
  getCookie,
  setCookie,
} from "./security/storage/secureCookies";
export { secureLocalStorage } from "./security/storage/secureLocalStorage";
