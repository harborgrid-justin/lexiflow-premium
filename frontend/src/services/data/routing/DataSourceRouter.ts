/**
 * DataSourceRouter
 * 
 * Responsibility: Routes data operations to the appropriate source (Backend API or IndexedDB)
 * Pattern: Strategy pattern for data source selection
 * 
 * This module encapsulates the logic for determining whether to use the backend API
 * or fall back to local IndexedDB storage. It provides a clean abstraction layer
 * that allows the rest of the application to remain agnostic to the data source.
 */

import { isBackendApiEnabled, api } from '@/api';

/**
 * Generic data source interface that both backend and IndexedDB implement
 */
export interface DataSource<T = any> {
  getAll: (...args: unknown[]) => Promise<T[]>;
  get?: (id: string) => Promise<T | undefined>;
  add?: (item: T) => Promise<T>;
  update?: (id: string, updates: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void> | Promise<{ success: boolean; id: string }>;
  [key: string]: unknown; // Allow additional methods
}

/**
 * Routes to the appropriate data source based on configuration
 */
export class DataSourceRouter {
  /**
   * Determines if backend API should be used
   */
  static shouldUseBackend(): boolean {
    return isBackendApiEnabled();
  }

  /**
   * Routes to backend or fallback based on availability
   * 
   * @param backendSource - The backend API service
   * @param fallbackSource - The local/IndexedDB source
   * @returns The appropriate data source
   */
  static route<T>(
    backendSource: DataSource<T> | null,
    fallbackSource: DataSource<T>
  ): DataSource<T> {
    if (this.shouldUseBackend() && backendSource) {
      return backendSource;
    }
    return fallbackSource;
  }

  /**
   * Routes with getter pattern (for lazy evaluation)
   * 
   * @param getBackendSource - Lazy getter for backend source
   * @param getFallbackSource - Lazy getter for fallback source
   * @returns The appropriate data source
   */
  static routeLazy<T>(
    getBackendSource: () => DataSource<T> | null,
    getFallbackSource: () => DataSource<T>
  ): DataSource<T> {
    if (this.shouldUseBackend()) {
      const backend = getBackendSource();
      if (backend) return backend;
    }
    return getFallbackSource();
  }

  /**
   * Creates a property descriptor for lazy routing (used with Object.defineProperty)
   * 
   * @param apiPath - Path to backend API service (e.g., 'cases', 'docket')
   * @param fallbackFactory - Factory function for fallback source
   * @returns PropertyDescriptor for use with Object.defineProperty
   */
  static createPropertyDescriptor<T>(
    apiPath: string | null,
    fallbackFactory: () => any
  ): PropertyDescriptor {
    return {
      get: () => {
        if (this.shouldUseBackend() && apiPath) {
          // Access api object dynamically
          const apiService = (api as any)[apiPath];
          if (apiService) return apiService;
        }
        return fallbackFactory();
      },
      enumerable: true,
      configurable: true
    };
  }

  /**
   * Helper for creating route maps for batch registration
   * 
   * Example:
   * ```ts
   * const routes = DataSourceRouter.createRouteMap({
   *   cases: { api: 'cases', fallback: () => getCaseRepository() },
   *   docket: { api: 'docket', fallback: () => getDocketRepository() }
   * });
   * ```
   */
  static createRouteMap<TMap extends Record<string, any>>(
    config: {
      [K in keyof TMap]: {
        api: string | null;
        fallback: () => DataSource<TMap[K]>;
      };
    }
  ): Record<keyof TMap, PropertyDescriptor> {
    const descriptors: any = {};
    for (const [key, { api: apiPath, fallback }] of Object.entries(config)) {
      (descriptors as any)[key] = this.createPropertyDescriptor(apiPath, fallback);
    }
    return descriptors as Record<keyof TMap, PropertyDescriptor>;
  }
}

/**
 * Legacy compatibility helper - maintains the isBackendApiEnabled check pattern
 */
export function routeDataSource<T>(
  backendSource: DataSource<T> | null,
  fallbackSource: DataSource<T>
): DataSource<T> {
  return DataSourceRouter.route(backendSource, fallbackSource);
}
