/**
 * @module services/infrastructure/apiClientEnhanced
 * @description Enhanced API client with interceptors support
 *
 * This file provides type definitions and compatibility layer for
 * the enhanced API client with interceptor support.
 */

// Type definitions for interceptors
export type RequestInterceptor = (
  endpoint: string,
  config?: RequestInit & { params?: Record<string, unknown> }
) =>
  | {
      endpoint: string;
      config?: RequestInit & { params?: Record<string, unknown> };
    }
  | Promise<{
      endpoint: string;
      config?: RequestInit & { params?: Record<string, unknown> };
    }>;

export type ResponseInterceptor = <T>(
  response: T,
  endpoint: string
) => T | Promise<T>;

export type ErrorInterceptor = (
  error: Error,
  endpoint: string
) => Error | Promise<Error>;

// Re-export base client
export * from "./apiClient";
