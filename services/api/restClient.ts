import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createApiClient } from './apiMiddleware';
import { cacheManager } from './cacheManager';

/**
 * REST API Client for LexiFlow Frontend
 *
 * Provides a clean interface for making REST API calls with:
 * - Automatic authentication
 * - Response caching
 * - Error handling
 * - Retry logic
 * - Request cancellation
 */

export interface RestClientConfig {
  baseURL?: string;
  timeout?: number;
  version?: string;
  enableCaching?: boolean;
  enableRetry?: boolean;
}

export interface RequestOptions extends AxiosRequestConfig {
  cache?: boolean;
  cacheTTL?: number;
}

class RestClient {
  private client: AxiosInstance;
  private version: string;
  private enableCaching: boolean;

  constructor(config: RestClientConfig = {}) {
    this.version = config.version || 'v2';
    this.enableCaching = config.enableCaching !== false;

    this.client = createApiClient({
      baseURL: config.baseURL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/${this.version}`,
      timeout: config.timeout || 30000,
      enableCaching: this.enableCaching,
      enableRetry: config.enableRetry !== false,
      retryConfig: {
        retries: 3,
        retryDelay: 1000,
      },
    });
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.client.get<T>(url, options);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    // Invalidate cache for related resources
    if (this.enableCaching) {
      cacheManager.invalidate(url);
    }

    const response = await this.client.post<T>(url, data, options);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    // Invalidate cache for related resources
    if (this.enableCaching) {
      cacheManager.invalidate(url);
    }

    const response = await this.client.put<T>(url, data, options);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    // Invalidate cache for related resources
    if (this.enableCaching) {
      cacheManager.invalidate(url);
    }

    const response = await this.client.patch<T>(url, data, options);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    // Invalidate cache for related resources
    if (this.enableCaching) {
      cacheManager.invalidate(url);
    }

    const response = await this.client.delete<T>(url, options);
    return response.data;
  }

  /**
   * Upload file(s)
   */
  async upload<T = any>(
    url: string,
    files: File | File[],
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
    } else {
      formData.append('file', files);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Download file
   */
  async download(
    url: string,
    filename?: string,
    onProgress?: (progress: number) => void,
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    // Trigger download
    if (typeof window !== 'undefined') {
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }

    return response.data;
  }

  /**
   * Paginated request with cursor-based pagination
   */
  async paginate<T = any>(
    url: string,
    params?: any,
    options: RequestOptions = {},
  ): Promise<{
    edges: Array<{ node: T; cursor: string }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  }> {
    return this.get(url, { ...options, params });
  }

  /**
   * Batch request
   */
  async batch<T = any>(requests: Array<{ method: string; url: string; data?: any }>): Promise<T[]> {
    const promises = requests.map((req) => {
      switch (req.method.toLowerCase()) {
        case 'get':
          return this.get(req.url);
        case 'post':
          return this.post(req.url, req.data);
        case 'put':
          return this.put(req.url, req.data);
        case 'patch':
          return this.patch(req.url, req.data);
        case 'delete':
          return this.delete(req.url);
        default:
          throw new Error(`Unsupported method: ${req.method}`);
      }
    });

    return Promise.all(promises);
  }

  /**
   * Get API version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Get axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    cacheManager.clear();
  }

  /**
   * Invalidate cache for specific pattern
   */
  invalidateCache(pattern: string | RegExp): number {
    return cacheManager.clearPattern(pattern);
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return cacheManager.getStats();
  }
}

// Export singleton instances for each version
export const restClientV1 = new RestClient({ version: 'v1' });
export const restClientV2 = new RestClient({ version: 'v2' });

// Export default client (V2)
export const restClient = restClientV2;

// Export factory function
export function createRestClient(config: RestClientConfig = {}): RestClient {
  return new RestClient(config);
}

export default restClient;
