/**
 * REST API Service
 * Provides high-level REST API methods for all backend endpoints
 */

import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

// Generic response type
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination params
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Search params
interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

// REST API wrapper class
class RestApiService {
  // Generic CRUD operations
  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(endpoint);
    return response.data;
  }

  // Authentication
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post('/auth/login', credentials),

    register: (userData: { email: string; password: string; name: string }) =>
      this.post('/auth/register', userData),

    logout: () =>
      this.post('/auth/logout'),

    refreshToken: (refreshToken: string) =>
      this.post('/auth/refresh', { refreshToken }),

    forgotPassword: (email: string) =>
      this.post('/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
      this.post('/auth/reset-password', { token, newPassword }),

    verifyEmail: (token: string) =>
      this.post('/auth/verify-email', { token }),
  };

  // User management
  users = {
    getProfile: () => this.get('/users/profile'),
    updateProfile: (data: any) => this.patch('/users/profile', data),
    changePassword: (oldPassword: string, newPassword: string) =>
      this.post('/users/change-password', { oldPassword, newPassword }),
    getAll: (params?: SearchParams) => this.get('/users', params),
    getById: (id: string) => this.get(`/users/${id}`),
    create: (data: any) => this.post('/users', data),
    update: (id: string, data: any) => this.patch(`/users/${id}`, data),
    delete: (id: string) => this.delete(`/users/${id}`),
  };

  // Case management
  cases = {
    getAll: (params?: SearchParams) => this.get('/cases', params),
    getById: (id: string) => this.get(`/cases/${id}`),
    create: (data: any) => this.post('/cases', data),
    update: (id: string, data: any) => this.patch(`/cases/${id}`, data),
    delete: (id: string) => this.delete(`/cases/${id}`),
    getTimeline: (id: string) => this.get(`/cases/${id}/timeline`),
    getDocuments: (id: string, params?: PaginationParams) =>
      this.get(`/cases/${id}/documents`, params),
    getParties: (id: string) => this.get(`/cases/${id}/parties`),
    addParty: (id: string, data: any) => this.post(`/cases/${id}/parties`, data),
  };

  // Document management
  documents = {
    getAll: (params?: SearchParams) => this.get('/documents', params),
    getById: (id: string) => this.get(`/documents/${id}`),
    create: (data: any) => this.post('/documents', data),
    update: (id: string, data: any) => this.patch(`/documents/${id}`, data),
    delete: (id: string) => this.delete(`/documents/${id}`),
    getVersions: (id: string) => this.get(`/documents/${id}/versions`),
    download: (id: string) => this.get(`/documents/${id}/download`, { responseType: 'blob' }),
    search: (query: string, params?: SearchParams) =>
      this.get('/documents/search', { ...params, q: query }),
  };

  // Client management
  clients = {
    getAll: (params?: SearchParams) => this.get('/clients', params),
    getById: (id: string) => this.get(`/clients/${id}`),
    create: (data: any) => this.post('/clients', data),
    update: (id: string, data: any) => this.patch(`/clients/${id}`, data),
    delete: (id: string) => this.delete(`/clients/${id}`),
    getCases: (id: string, params?: PaginationParams) =>
      this.get(`/clients/${id}/cases`, params),
    getBillings: (id: string, params?: PaginationParams) =>
      this.get(`/clients/${id}/billings`, params),
  };

  // Billing management
  billing = {
    getInvoices: (params?: SearchParams) => this.get('/billing/invoices', params),
    getInvoiceById: (id: string) => this.get(`/billing/invoices/${id}`),
    createInvoice: (data: any) => this.post('/billing/invoices', data),
    sendInvoice: (id: string) => this.post(`/billing/invoices/${id}/send`),
    getTimeEntries: (params?: SearchParams) => this.get('/billing/time-entries', params),
    createTimeEntry: (data: any) => this.post('/billing/time-entries', data),
    updateTimeEntry: (id: string, data: any) => this.patch(`/billing/time-entries/${id}`, data),
    deleteTimeEntry: (id: string) => this.delete(`/billing/time-entries/${id}`),
  };

  // Task management
  tasks = {
    getAll: (params?: SearchParams) => this.get('/tasks', params),
    getById: (id: string) => this.get(`/tasks/${id}`),
    create: (data: any) => this.post('/tasks', data),
    update: (id: string, data: any) => this.patch(`/tasks/${id}`, data),
    delete: (id: string) => this.delete(`/tasks/${id}`),
    complete: (id: string) => this.post(`/tasks/${id}/complete`),
    assign: (id: string, userId: string) => this.post(`/tasks/${id}/assign`, { userId }),
  };

  // Calendar/Events
  events = {
    getAll: (params?: SearchParams) => this.get('/events', params),
    getById: (id: string) => this.get(`/events/${id}`),
    create: (data: any) => this.post('/events', data),
    update: (id: string, data: any) => this.patch(`/events/${id}`, data),
    delete: (id: string) => this.delete(`/events/${id}`),
  };

  // Analytics
  analytics = {
    getDashboard: () => this.get('/analytics/dashboard'),
    getCaseStats: (caseId?: string) =>
      this.get('/analytics/cases', caseId ? { caseId } : undefined),
    getBillingStats: (params?: { startDate?: string; endDate?: string }) =>
      this.get('/analytics/billing', params),
    getUserActivity: (userId?: string, params?: PaginationParams) =>
      this.get('/analytics/activity', { ...params, userId }),
    getReports: (type: string, params?: any) =>
      this.get(`/analytics/reports/${type}`, params),
  };

  // Search
  search = {
    global: (query: string, params?: SearchParams) =>
      this.get('/search', { ...params, q: query }),
    cases: (query: string, params?: SearchParams) =>
      this.get('/search/cases', { ...params, q: query }),
    documents: (query: string, params?: SearchParams) =>
      this.get('/search/documents', { ...params, q: query }),
    clients: (query: string, params?: SearchParams) =>
      this.get('/search/clients', { ...params, q: query }),
  };

  // Notifications
  notifications = {
    getAll: (params?: PaginationParams) => this.get('/notifications', params),
    markAsRead: (id: string) => this.patch(`/notifications/${id}/read`),
    markAllAsRead: () => this.post('/notifications/read-all'),
    delete: (id: string) => this.delete(`/notifications/${id}`),
  };

  // Settings
  settings = {
    get: () => this.get('/settings'),
    update: (data: any) => this.patch('/settings', data),
    getNotificationPreferences: () => this.get('/settings/notifications'),
    updateNotificationPreferences: (data: any) =>
      this.patch('/settings/notifications', data),
  };

  // Audit logs
  audit = {
    getLogs: (params?: SearchParams) => this.get('/audit/logs', params),
    getLogById: (id: string) => this.get(`/audit/logs/${id}`),
    exportLogs: (params?: any) => this.get('/audit/export', { ...params, responseType: 'blob' }),
  };

  // Health check
  health = {
    check: () => this.get('/health'),
    status: () => this.get('/health/status'),
  };
}

// Export singleton instance
export const restApi = new RestApiService();
export default restApi;
