/**
 * Data Client
 *
 * Centralized exports for HTTP client infrastructure.
 *
 * @module services/data/client
 */

// HTTP Client
export {
  HttpError,
  httpDelete,
  httpFetch,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from "./httpClient";

export type { HttpRequestInit, HttpResponse } from "./httpClient";

// Authentication Transport
export {
  authDelete,
  authGet,
  authPatch,
  authPost,
  authPut,
  authenticatedFetch,
} from "./authTransport";

export type { AuthenticatedRequestInit } from "./authTransport";

// Configuration
export { buildApiUrl, checkBackendHealth, getBackendConfig } from "./config";

export type { BackendConfig } from "./config";
