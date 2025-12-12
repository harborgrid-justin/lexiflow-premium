/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

// API Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// API Timeouts (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds
export const UPLOAD_TIMEOUT = 300000; // 5 minutes for file uploads
export const DOWNLOAD_TIMEOUT = 180000; // 3 minutes for downloads

// Retry Configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // Initial delay in ms (exponential backoff)
export const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Cache Configuration
export const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
export const STALE_TIME = 2 * 60 * 1000; // 2 minutes

// Pagination Defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY_TOKEN: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    OAUTH_GOOGLE: '/auth/oauth/google',
    OAUTH_MICROSOFT: '/auth/oauth/microsoft',
    OAUTH_CALLBACK: '/auth/oauth/callback',
    MFA_SETUP: '/auth/mfa/setup',
    MFA_VERIFY: '/auth/mfa/verify',
    MFA_DISABLE: '/auth/mfa/disable',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    PREFERENCES: '/users/preferences',
    SECURITY: '/users/security',
    SESSIONS: '/users/sessions',
    REVOKE_SESSION: (sessionId: string) => `/users/sessions/${sessionId}`,
  },

  // Cases
  CASES: {
    BASE: '/cases',
    BY_ID: (id: string) => `/cases/${id}`,
    SEARCH: '/cases/search',
    STATISTICS: '/cases/statistics',
    TIMELINE: (id: string) => `/cases/${id}/timeline`,
    PARTIES: (id: string) => `/cases/${id}/parties`,
    TEAM: (id: string) => `/cases/${id}/team`,
    PHASES: (id: string) => `/cases/${id}/phases`,
    LINK_CASE: (id: string) => `/cases/${id}/link`,
    EXPORT: (id: string) => `/cases/${id}/export`,
  },

  // Documents
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    BULK_UPLOAD: '/documents/bulk-upload',
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    PREVIEW: (id: string) => `/documents/${id}/preview`,
    VERSIONS: (id: string) => `/documents/${id}/versions`,
    OCR: (id: string) => `/documents/${id}/ocr`,
    SEARCH: '/documents/search',
    TAGS: '/documents/tags',
    SHARE: (id: string) => `/documents/${id}/share`,
    ACCESS_LOG: (id: string) => `/documents/${id}/access-log`,
  },

  // Billing
  BILLING: {
    TIME_ENTRIES: '/billing/time-entries',
    TIME_ENTRY_BY_ID: (id: string) => `/billing/time-entries/${id}`,
    INVOICES: '/billing/invoices',
    INVOICE_BY_ID: (id: string) => `/billing/invoices/${id}`,
    GENERATE_INVOICE: '/billing/invoices/generate',
    EXPENSES: '/billing/expenses',
    EXPENSE_BY_ID: (id: string) => `/billing/expenses/${id}`,
    RATES: '/billing/rates',
    TRUST_ACCOUNTS: '/billing/trust-accounts',
    PAYMENTS: '/billing/payments',
    REPORTS: '/billing/reports',
    WIP: '/billing/work-in-progress',
  },

  // Discovery
  DISCOVERY: {
    REQUESTS: '/discovery/requests',
    REQUEST_BY_ID: (id: string) => `/discovery/requests/${id}`,
    DEPOSITIONS: '/discovery/depositions',
    DEPOSITION_BY_ID: (id: string) => `/discovery/depositions/${id}`,
    PRODUCTIONS: '/discovery/productions',
    INTERROGATORIES: '/discovery/interrogatories',
    ADMISSIONS: '/discovery/admissions',
    LEGAL_HOLDS: '/discovery/legal-holds',
    ESI_SOURCES: '/discovery/esi-sources',
    PRIVILEGE_LOG: '/discovery/privilege-log',
  },

  // Compliance
  COMPLIANCE: {
    AUDIT_LOG: '/compliance/audit-log',
    AUDIT_EXPORT: '/compliance/audit-log/export',
    REPORTS: '/compliance/reports',
    METRICS: '/compliance/metrics',
    CONFLICTS: '/compliance/conflicts',
    ETHICAL_WALLS: '/compliance/ethical-walls',
    POLICIES: '/compliance/policies',
    VIOLATIONS: '/compliance/violations',
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    CASES: '/analytics/cases',
    BILLING: '/analytics/billing',
    PERFORMANCE: '/analytics/performance',
    TRENDS: '/analytics/trends',
    REPORTS: '/analytics/reports',
    CUSTOM_QUERY: '/analytics/custom-query',
    EXPORT: '/analytics/export',
  },

  // Clients
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
    SEARCH: '/clients/search',
    CONTACTS: (id: string) => `/clients/${id}/contacts`,
    MATTERS: (id: string) => `/clients/${id}/matters`,
    BILLING: (id: string) => `/clients/${id}/billing`,
    TRUST: (id: string) => `/clients/${id}/trust`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    UNREAD_COUNT: '/notifications/unread-count',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },

  // Search
  SEARCH: {
    GLOBAL: '/search',
    CASES: '/search/cases',
    DOCUMENTS: '/search/documents',
    CLIENTS: '/search/clients',
    SUGGESTIONS: '/search/suggestions',
  },

  // Health & Status
  HEALTH: {
    STATUS: '/health',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * API Request Headers
 */
export const API_HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_FORM: 'multipart/form-data',
  ACCEPT_JSON: 'application/json',
  CORRELATION_ID: 'X-Correlation-ID',
  REQUEST_ID: 'X-Request-ID',
  CLIENT_VERSION: 'X-Client-Version',
} as const;

/**
 * Environment Configuration
 */
export const ENV = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
  apiUrl: API_BASE_URL,
  graphqlUrl: GRAPHQL_URL,
  wsUrl: WS_URL,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  enableGraphQL: import.meta.env.VITE_ENABLE_GRAPHQL !== 'false',
  enableWebSockets: import.meta.env.VITE_ENABLE_WEBSOCKETS !== 'false',
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
} as const;
