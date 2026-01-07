/**
 * HTTP Utilities
 *
 * Re-export of base HTTP client for generic library usage.
 * Note: For domain services, prefer using the `services/data/client/httpClient` or gateways.
 */

export { HttpError, httpFetch } from "../../services/data/client/httpClient";
export type {
  HttpRequestInit,
  HttpResponse,
} from "../../services/data/client/httpClient";

// Base methods
import {
  httpFetch,
  type HttpRequestInit,
  type HttpResponse,
} from "../../services/data/client/httpClient";

export async function httpGet<T = unknown>(
  url: string,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, { ...init, method: "GET" });
}

export async function httpPost<T = unknown>(
  url: string,
  body: unknown,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function httpPut<T = unknown>(
  url: string,
  body: unknown,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, {
    ...init,
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function httpDelete<T = unknown>(
  url: string,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, { ...init, method: "DELETE" });
}
