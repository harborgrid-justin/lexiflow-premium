/**
 * Interceptors Service Re-export
 * Re-exports interceptor functionality from the infrastructure layer
 * with compatibility layer for enterprise API
 */

import { setupInterceptors } from "../../services/infrastructure/interceptors.service";
import type {
  ErrorInterceptor,
  RequestInterceptor,
  ResponseInterceptor,
} from "../../services/infrastructure/apiClientEnhanced";

// Type compatibility exports
export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "../../services/infrastructure/apiClientEnhanced";

export interface RequestConfig {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  headers?: HeadersInit;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
}

type RequestInterceptorFn = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;
type ResponseInterceptorFn = <T>(response: Response, data: T) => Promise<T> | T;
type ErrorInterceptorFn = (error: unknown) => Promise<unknown> | unknown;

// Lightweight InterceptorManager that satisfies EnterpriseApiClient usage
export class InterceptorManager {
  private requestInterceptors: RequestInterceptorFn[] = [];
  private responseInterceptors: ResponseInterceptorFn[] = [];
  private errorInterceptors: ErrorInterceptorFn[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    const wrapper: RequestInterceptorFn = async (config) => {
      const result = await interceptor(config.url, {
        method: config.method,
        headers: config.headers,
        signal: config.signal,
        params: config.params,
      });

      if (!result) return config;

      return {
        ...config,
        url: result.endpoint ?? config.url,
        headers: result.config?.headers ?? config.headers,
        params: result.config?.params ?? config.params,
      };
    };

    this.requestInterceptors.push(wrapper);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(
        (fn) => fn !== wrapper
      );
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    const wrapper: ResponseInterceptorFn = async (response, data) => {
      const result = await interceptor(
        data,
        response && "url" in response ? (response as Response).url : ""
      );
      return result as typeof data;
    };

    this.responseInterceptors.push(wrapper);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(
        (fn) => fn !== wrapper
      );
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    const wrapper: ErrorInterceptorFn = async (error) =>
      interceptor(error as Error, "");

    this.errorInterceptors.push(wrapper);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(
        (fn) => fn !== wrapper
      );
    };
  }

  async executeRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let next = config;
    for (const interceptor of this.requestInterceptors) {
      next = await interceptor(next);
    }
    return next;
  }

  async executeResponseInterceptors<T>(
    response: Response,
    data: T
  ): Promise<T> {
    let next = data;
    for (const interceptor of this.responseInterceptors) {
      next = await interceptor(response, next);
    }
    return next;
  }

  async executeErrorInterceptors(error: unknown): Promise<unknown> {
    let next = error;
    for (const interceptor of this.errorInterceptors) {
      next = await interceptor(next);
    }
    return next;
  }
}

// Provide a compatible setup helper that accepts optional options
export function setupDefaultInterceptors(
  manager: InterceptorManager,
  _options?: {
    enableLogging?: boolean;
    enablePerformance?: boolean;
    appName?: string;
    appVersion?: string;
    getAuthToken?: () => string | null;
  }
): () => void {
  return setupInterceptors(manager);
}

// Stub exports for functions that don't exist in the actual service
export const createAuthInterceptor = () => ({});
export const createCaseConversionInterceptor = () => ({});
export const createClientInfoInterceptor = () => ({});
export const createErrorLoggingInterceptor = () => ({});
export const createErrorTransformInterceptor = () => ({});
export const createPerformanceInterceptor = () => ({});
export const createRateLimitInterceptor = () => ({});
export const createRequestIdInterceptor = () => ({});
export const createRequestLoggingInterceptor = () => ({});
export const createResponseLoggingInterceptor = () => ({});
export const createRetryAfterInterceptor = () => ({});
export const createTimestampInterceptor = () => ({});
export const globalInterceptors = { request: [], response: [], error: [] };
