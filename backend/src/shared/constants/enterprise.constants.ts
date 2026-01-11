/**
 * Enterprise Constants
 * Shared constants, feature flags, configuration keys, and status codes for LexiFlow Premium
 *
 * This file contains all shared constants used across multiple modules in the enterprise application.
 * Following strict TypeScript and enterprise-grade practices.
 */

// =============================================================================
// APPLICATION METADATA
// =============================================================================

export const APPLICATION_NAME = 'LexiFlow Premium';
export const APPLICATION_VERSION = '1.0.0';
export const APPLICATION_DESCRIPTION = 'Enterprise Legal Document Management System';
export const API_VERSION = 'v1';
export const API_PREFIX = '/api';

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_SORT_ORDER = 'desc';

export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_RETRY_DELAY_MS = 1000;

export const DEFAULT_CACHE_TTL_SECONDS = 300;
export const DEFAULT_SESSION_TIMEOUT_MS = 3600000;

// =============================================================================
// HTTP STATUS CODES
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource Operations
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  DEADLOCK_DETECTED: 'DEADLOCK_DETECTED',

  // Business Logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  STATE_TRANSITION_ERROR: 'STATE_TRANSITION_ERROR',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // File Operations
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;

// =============================================================================
// CACHE KEYS & TTL
// =============================================================================

export const CACHE_KEYS = {
  USER: 'user',
  CASE: 'case',
  DOCUMENT: 'document',
  ORGANIZATION: 'organization',
  PERMISSIONS: 'permissions',
  ROLES: 'roles',
  SESSION: 'session',
  CONFIG: 'config',
  FEATURE_FLAGS: 'featureFlags',
} as const;

export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// =============================================================================
// QUEUE NAMES
// =============================================================================

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: 'document-processing',
  EMAIL_NOTIFICATIONS: 'email-notifications',
  DATA_EXPORT: 'data-export',
  ANALYTICS: 'analytics',
  AUDIT_LOG: 'audit-log',
  SEARCH_INDEX: 'search-index',
  FILE_CONVERSION: 'file-conversion',
  OCR_PROCESSING: 'ocr-processing',
  BACKUP: 'backup',
  MAINTENANCE: 'maintenance',
} as const;

// =============================================================================
// EVENT TYPES
// =============================================================================

export const EVENT_TYPES = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // Case Events
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_DELETED: 'case.deleted',
  CASE_CLOSED: 'case.closed',
  CASE_REOPENED: 'case.reopened',

  // Document Events
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_SHARED: 'document.shared',
  DOCUMENT_DOWNLOADED: 'document.downloaded',

  // System Events
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',

  // Security Events
  SECURITY_LOGIN_FAILED: 'security.loginFailed',
  SECURITY_ACCESS_DENIED: 'security.accessDenied',
  SECURITY_IP_BLOCKED: 'security.ipBlocked',
  SECURITY_ANOMALY_DETECTED: 'security.anomalyDetected',
} as const;

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION = {
  // String Lengths
  MIN_PASSWORD_LENGTH: 12,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TITLE_LENGTH: 255,

  // File Sizes (in bytes)
  MAX_FILE_SIZE: 104857600,          // 100 MB
  MAX_IMAGE_SIZE: 10485760,          // 10 MB
  MAX_DOCUMENT_SIZE: 52428800,       // 50 MB
  MAX_AVATAR_SIZE: 2097152,          // 2 MB

  // Numeric Ranges
  MIN_AGE: 18,
  MAX_AGE: 150,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999999.99,

  // Array Limits
  MAX_ARRAY_LENGTH: 1000,
  MAX_TAGS_COUNT: 50,
  MAX_BULK_OPERATION_SIZE: 500,
} as const;

// =============================================================================
// DATE & TIME FORMATS
// =============================================================================

export const DATE_FORMATS = {
  ISO_8601: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME_DISPLAY: 'MMM dd, yyyy HH:mm',
  DATE_DISPLAY: 'MMM dd, yyyy',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
} as const;

export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
} as const;

// =============================================================================
// FILE TYPES & EXTENSIONS
// =============================================================================

export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
} as const;

export const FILE_EXTENSIONS = {
  PDF: '.pdf',
  DOC: '.doc',
  DOCX: '.docx',
  XLS: '.xls',
  XLSX: '.xlsx',
  PPT: '.ppt',
  PPTX: '.pptx',
  TXT: '.txt',
  CSV: '.csv',
  JPG: '.jpg',
  JPEG: '.jpeg',
  PNG: '.png',
  GIF: '.gif',
  WEBP: '.webp',
  SVG: '.svg',
  ZIP: '.zip',
  RAR: '.rar',
  SEVEN_Z: '.7z',
} as const;

// =============================================================================
// REGEX PATTERNS
// =============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
  PHONE_US: /^\+?1?\d{10}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  CASE_NUMBER: /^[A-Z]{2,4}-\d{4,10}$/,
  ZIP_CODE_US: /^\d{5}(-\d{4})?$/,
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  // Core Features
  ENABLE_ANALYTICS: true,
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_CACHING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_WEBSOCKETS: true,
  ENABLE_GRAPHQL: true,

  // Advanced Features
  ENABLE_AI_FEATURES: true,
  ENABLE_OCR: true,
  ENABLE_DOCUMENT_ASSEMBLY: true,
  ENABLE_E_DISCOVERY: true,
  ENABLE_TRIAL_MANAGEMENT: true,

  // Integrations
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_CALENDAR_SYNC: true,
  ENABLE_CLOUD_STORAGE: true,
  ENABLE_THIRD_PARTY_AUTH: false,

  // Experimental
  ENABLE_BETA_FEATURES: false,
  ENABLE_DEBUG_MODE: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_TRACKING: true,
} as const;

// =============================================================================
// ENVIRONMENT VARIABLES KEYS
// =============================================================================

export const ENV_KEYS = {
  // Application
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  APP_URL: 'APP_URL',
  API_URL: 'API_URL',

  // Database
  DATABASE_HOST: 'DATABASE_HOST',
  DATABASE_PORT: 'DATABASE_PORT',
  DATABASE_NAME: 'DATABASE_NAME',
  DATABASE_USER: 'DATABASE_USER',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',

  // Redis
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',

  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRATION: 'JWT_EXPIRATION',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRATION: 'JWT_REFRESH_EXPIRATION',

  // Email
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_USER: 'EMAIL_USER',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  EMAIL_FROM: 'EMAIL_FROM',

  // Storage
  STORAGE_TYPE: 'STORAGE_TYPE',
  AWS_ACCESS_KEY: 'AWS_ACCESS_KEY',
  AWS_SECRET_KEY: 'AWS_SECRET_KEY',
  AWS_REGION: 'AWS_REGION',
  AWS_BUCKET: 'AWS_BUCKET',

  // External Services
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  GOOGLE_API_KEY: 'GOOGLE_API_KEY',
} as const;

// =============================================================================
// RATE LIMITING
// =============================================================================

export const RATE_LIMITS = {
  // API Rate Limits
  API_DEFAULT: {
    windowMs: 60000,      // 1 minute
    maxRequests: 100,
  },
  API_AUTH: {
    windowMs: 900000,     // 15 minutes
    maxRequests: 5,
  },
  API_PUBLIC: {
    windowMs: 60000,      // 1 minute
    maxRequests: 20,
  },
  API_SEARCH: {
    windowMs: 60000,      // 1 minute
    maxRequests: 30,
  },

  // WebSocket Rate Limits
  WS_MESSAGES: {
    windowMs: 1000,       // 1 second
    maxRequests: 10,
  },
  WS_CONNECTIONS: {
    windowMs: 60000,      // 1 minute
    maxRequests: 5,
  },
} as const;

// =============================================================================
// LOGGING
// =============================================================================

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
} as const;

export const LOG_CATEGORIES = {
  APPLICATION: 'application',
  DATABASE: 'database',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  AUDIT: 'audit',
  INTEGRATION: 'integration',
} as const;

// =============================================================================
// ROLES & PERMISSIONS
// =============================================================================

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  EXECUTE: 'execute',
} as const;

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'inApp',
  WEBHOOK: 'webhook',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

// =============================================================================
// SEARCH CONFIGURATION
// =============================================================================

export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 3,
  MAX_SEARCH_LENGTH: 200,
  DEFAULT_SEARCH_LIMIT: 20,
  MAX_SEARCH_RESULTS: 1000,
  HIGHLIGHT_PRE_TAG: '<mark>',
  HIGHLIGHT_POST_TAG: '</mark>',
  FUZZY_DISTANCE: 2,
} as const;

// =============================================================================
// BATCH PROCESSING
// =============================================================================

export const BATCH_CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  MAX_BATCH_SIZE: 1000,
  MIN_BATCH_SIZE: 10,
  BATCH_TIMEOUT_MS: 300000,  // 5 minutes
  CONCURRENT_BATCHES: 5,
} as const;

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

export const HEALTH_CHECK_ENDPOINTS = {
  LIVENESS: '/health/live',
  READINESS: '/health/ready',
  STARTUP: '/health/startup',
} as const;

// =============================================================================
// API DOCUMENTATION
// =============================================================================

export const SWAGGER_CONFIG = {
  TITLE: 'LexiFlow Premium API',
  DESCRIPTION: 'Enterprise Legal Document Management System API',
  VERSION: '1.0.0',
  TAG_PREFIX: 'v1',
  ENABLE_SECURITY: true,
  ENABLE_EXAMPLES: true,
} as const;

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: ['http://localhost:3000', 'http://localhost:5173'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id'],
  CREDENTIALS: true,
  MAX_AGE: 86400,
} as const;

// =============================================================================
// SYSTEM LIMITS
// =============================================================================

export const SYSTEM_LIMITS = {
  MAX_CONCURRENT_REQUESTS: 1000,
  MAX_PAYLOAD_SIZE: 10485760,        // 10 MB
  MAX_JSON_PAYLOAD: 1048576,         // 1 MB
  MAX_URL_LENGTH: 2048,
  MAX_HEADER_SIZE: 8192,
  MAX_REQUEST_TIMEOUT: 300000,       // 5 minutes
  MAX_IDLE_TIMEOUT: 120000,          // 2 minutes
} as const;
