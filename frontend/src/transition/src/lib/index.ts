/**
 * Library Utilities Barrel Export
 *
 * Centralized export for all utility libraries.
 * Provides common helpers for HTTP, functional programming, dates, and types.
 *
 * @example
 * import { httpGet, pipe, formatDate, Result } from '@/shared/lib';
 */

// HTTP utilities
export {
  HttpError,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
} from "./http/index";

// Functional programming utilities
export { compose, curry, debounce, pipe, throttle } from "./fp";

// Date utilities
export { addDays, diffDays, formatDate, formatTime, isToday } from "./dates";

// Type utilities
export { err, ok } from "./types";
export type {
  AsyncResult,
  DeepPartial,
  DeepRequired,
  Maybe,
  Mutable,
  Nullable,
  Optional,
  Result,
} from "./types";
