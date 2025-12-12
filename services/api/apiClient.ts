/**
 * API Client - Axios instance with interceptors
 * Provides centralized HTTP client with authentication, error handling, and request/response interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Token management
let authToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const setRefreshToken = (token: string) => {
  refreshToken = token;
  localStorage.setItem('refresh_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

export const getRefreshToken = (): string | null => {
  if (!refreshToken) {
    refreshToken = localStorage.getItem('refresh_token');
  }
  return refreshToken;
};

export const clearTokens = () => {
  authToken = null;
  refreshToken = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and custom headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for performance monitoring
    (config as any).metadata = { startTime: new Date().getTime() };

    // Add correlation ID for distributed tracing
    if (config.headers) {
      config.headers['X-Correlation-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const config = response.config as any;
    if (config.metadata?.startTime) {
      const duration = new Date().getTime() - config.metadata.startTime;
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = getRefreshToken();
        if (refreshTokenValue) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshTokenValue,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setAuthToken(accessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: { message: error.response.data || 'Access denied' }
      }));
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`[API] Rate limited. Retry after ${retryAfter}s`);
    }

    // Handle 500+ Server Errors
    if (error.response && error.response.status >= 500) {
      console.error('[API] Server error:', error.response.data);
      window.dispatchEvent(new CustomEvent('api:serverError', {
        detail: { error: error.response.data, status: error.response.status }
      }));
    }

    // Handle Network Errors
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      window.dispatchEvent(new CustomEvent('api:networkError', {
        detail: { message: error.message }
      }));
    }

    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const uploadFile = async (
  endpoint: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(endpoint, formData, {
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
};

// Helper function for downloading files
export const downloadFile = async (
  endpoint: string,
  filename?: string
): Promise<void> => {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'download');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Helper for retrying failed requests with exponential backoff
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;

      // Don't retry on certain status codes (4xx client errors except 408, 429)
      if (axiosError.response) {
        const status = axiosError.response.status;
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        if (!retryableStatuses.includes(status)) {
          throw error;
        }
      }

      if (i < maxRetries - 1) {
        // Exponential backoff with jitter
        const backoffDelay = delay * Math.pow(2, i) * (1 + Math.random() * 0.1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError;
};

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 6;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const request = this.queue.shift();

    if (request) {
      try {
        await request();
      } finally {
        this.running--;
        this.process();
      }
    }
  }
}

export const requestQueue = new RequestQueue();

// Helper function for batch requests
export const batchRequests = async <T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }

  return results;
};

// Cache for GET requests
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();

// Helper for cached GET requests
export const cachedGet = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  ttl?: number
): Promise<T> => {
  const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
  const cached = requestCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await apiClient.get<T>(url, config);
  requestCache.set(cacheKey, response.data, ttl);
  return response.data;
};

export default apiClient;
