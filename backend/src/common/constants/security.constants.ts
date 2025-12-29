/**
 * Security Constants
 *
 * Centralized security configuration constants for LexiFlow Premium
 * Following OWASP Top 10 and industry best practices
 */

/**
 * Password Policy Constants
 */
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  MIN_SPECIAL_CHARS: 1,
  PREVENT_COMMON_PASSWORDS: true,
  PREVENT_USER_INFO: true,
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  MAX_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  CONCURRENT_SESSIONS_LIMIT: 5,
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Rate Limiting Defaults
 */
export const RATE_LIMIT_DEFAULTS = {
  GLOBAL: {
    POINTS: 100,
    DURATION: 60, // seconds
  },
  LOGIN: {
    POINTS: 5,
    DURATION: 300, // 5 minutes
  },
  API: {
    POINTS: 1000,
    DURATION: 60, // 1 minute
  },
  GRAPHQL: {
    POINTS: 500,
    DURATION: 60, // 1 minute
  },
  UPLOAD: {
    POINTS: 20,
    DURATION: 60, // 1 minute
  },
  DOWNLOAD: {
    POINTS: 50,
    DURATION: 60, // 1 minute
  },
} as const;

/**
 * CSRF Configuration
 */
export const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  TOKEN_COOKIE_NAME: 'csrf-token',
  TOKEN_HEADER_NAME: 'x-csrf-token',
  COOKIE_OPTIONS: {
    httpOnly: false, // Must be readable by JavaScript
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

/**
 * XSS Prevention
 */
export const XSS_CONFIG = {
  SANITIZE_OUTPUT: true,
  ENCODE_HTML_ENTITIES: true,
  REMOVE_SCRIPT_TAGS: true,
  REMOVE_EVENT_HANDLERS: true,
  ALLOWED_HTML_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'a',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ],
  ALLOWED_ATTRIBUTES: ['href', 'title', 'target'],
} as const;

/**
 * Input Validation Limits
 */
export const INPUT_VALIDATION = {
  MAX_JSON_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_URL_LENGTH: 2048, // 2 KB
  MAX_HEADER_SIZE: 8192, // 8 KB
  MAX_STRING_LENGTH: 10000,
  MAX_ARRAY_LENGTH: 1000,
  MAX_OBJECT_DEPTH: 10,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS_CONFIG = {
  HSTS_MAX_AGE: 31536000, // 1 year in seconds
  HSTS_INCLUDE_SUBDOMAINS: true,
  HSTS_PRELOAD: true,
  FRAME_OPTIONS: 'DENY',
  CONTENT_TYPE_OPTIONS: 'nosniff',
  XSS_PROTECTION: '1; mode=block',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
} as const;

/**
 * Encryption Configuration
 */
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  AUTH_TAG_LENGTH: 16,
  SALT_ROUNDS: 12,
  PBKDF2_ITERATIONS: 100000,
} as const;

/**
 * Audit Logging
 */
export const AUDIT_CONFIG = {
  LOG_AUTH_ATTEMPTS: true,
  LOG_PERMISSION_CHECKS: true,
  LOG_DATA_MODIFICATIONS: true,
  LOG_ADMIN_ACTIONS: true,
  LOG_SENSITIVE_OPERATIONS: true,
  RETENTION_DAYS: 90,
  COMPRESS_OLD_LOGS: true,
} as const;

/**
 * IP Security
 */
export const IP_SECURITY = {
  ENABLE_IP_REPUTATION: true,
  BLOCK_TOR_EXITS: false,
  BLOCK_VPN_PROXIES: false,
  ENABLE_GEO_BLOCKING: false,
  ALLOWED_COUNTRIES: [] as string[],
  BLOCKED_COUNTRIES: [] as string[],
  MAX_REQUESTS_PER_IP: 200,
  IP_BAN_DURATION: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * API Key Security
 */
export const API_KEY_CONFIG = {
  KEY_LENGTH: 32,
  PREFIX: 'lxf_',
  ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
  MAX_KEYS_PER_USER: 10,
  REQUIRE_IP_WHITELIST: false,
} as const;

/**
 * SQL Injection Prevention
 */
export const SQL_INJECTION_PATTERNS = [
  /(\s|^)(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)(\s|$)/gi,
  /--/g,
  /;(\s)*(DROP|DELETE|TRUNCATE)/gi,
  /\/\*.*\*\//g,
  /xp_/gi,
  /sp_/gi,
] as const;

/**
 * Path Traversal Prevention
 */
export const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /\.\./g,
] as const;

/**
 * Suspicious Request Patterns
 */
export const SUSPICIOUS_PATTERNS = {
  PATHS: [
    '/admin',
    '/wp-admin',
    '/phpmyadmin',
    '/.env',
    '/.git',
    '/config',
    '/backup',
    '/.aws',
    '/.ssh',
  ],
  USER_AGENTS: [
    'scanner',
    'nikto',
    'sqlmap',
    'nmap',
    'masscan',
    'metasploit',
    'burp',
    'acunetix',
  ],
  HEADERS: ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'],
} as const;

/**
 * WebSocket Security
 */
export const WEBSOCKET_CONFIG = {
  MAX_CONNECTIONS_PER_USER: 5,
  MAX_CONNECTIONS_PER_IP: 20,
  MAX_MESSAGE_SIZE: 1024 * 1024, // 1 MB
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 60000, // 1 minute
  RATE_LIMIT_MESSAGES: 60, // messages per minute
} as const;

/**
 * CORS Configuration
 */
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-CSRF-Token',
  ],
  EXPOSED_HEADERS: ['X-Total-Count', 'X-Page-Count'],
  MAX_AGE: 86400, // 24 hours
  CREDENTIALS: true,
} as const;

/**
 * Security Events for Monitoring
 */
export enum SecurityEvent {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUCCESSFUL_LOGIN = 'SUCCESSFUL_LOGIN',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  BULK_OPERATION = 'BULK_OPERATION',
}

/**
 * Security Risk Levels
 */
export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Sensitive Data Fields (for masking in logs)
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'apiKey',
  'secret',
  'privateKey',
  'creditCard',
  'ssn',
  'taxId',
  'bankAccount',
  'pin',
] as const;
