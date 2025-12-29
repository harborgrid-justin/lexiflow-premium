/**
 * Enhanced Security Constants
 * OWASP-compliant security configurations for LexiFlow Premium
 *
 * These constants follow security best practices from:
 * - OWASP Application Security Verification Standard (ASVS)
 * - OWASP Top 10
 * - NIST Cybersecurity Framework
 * - CIS Controls
 */

/**
 * Rate Limiting Configuration
 * Prevents brute force, DoS, and API abuse
 */
export const RATE_LIMIT_CONFIG = {
  // Global rate limits
  GLOBAL_WINDOW_MS: 60000, // 1 minute
  GLOBAL_MAX_REQUESTS: 300,

  // Per-IP rate limits
  IP_WINDOW_MS: 60000,
  IP_MAX_REQUESTS: 100,

  // Per-User rate limits (by role)
  USER_LIMITS: {
    guest: { windowMs: 60000, maxRequests: 50 },
    user: { windowMs: 60000, maxRequests: 200 },
    admin: { windowMs: 60000, maxRequests: 500 },
    superadmin: { windowMs: 60000, maxRequests: 1000 },
  },

  // Authentication endpoint limits
  AUTH_WINDOW_MS: 900000, // 15 minutes
  AUTH_MAX_ATTEMPTS: 5,
  AUTH_LOCKOUT_DURATION_MS: 900000, // 15 minutes

  // Sensitive operations
  SENSITIVE_WINDOW_MS: 3600000, // 1 hour
  SENSITIVE_MAX_REQUESTS: 10,

  // Burst protection
  BURST_WINDOW_MS: 1000, // 1 second
  BURST_MAX_REQUESTS: 10,
};

/**
 * Input Validation Limits
 * Prevents injection attacks and DoS
 */
export const INPUT_VALIDATION_LIMITS = {
  // String lengths
  MAX_STRING_LENGTH: 10000,
  MAX_TEXT_LENGTH: 100000,
  MAX_URL_LENGTH: 2048,
  MAX_EMAIL_LENGTH: 254,

  // Collection sizes
  MAX_ARRAY_LENGTH: 1000,
  MAX_OBJECT_KEYS: 100,
  MAX_OBJECT_DEPTH: 10,

  // File uploads
  MAX_FILE_SIZE: 52428800, // 50MB
  MAX_UPLOAD_FILES: 10,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
  ],
};

/**
 * CORS Configuration
 * Prevents unauthorized cross-origin access
 */
export const CORS_CONFIG = {
  // Allowed methods
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-CSRF-Token',
    'X-Correlation-ID',
    'X-Request-ID',
  ],

  // Exposed headers
  EXPOSED_HEADERS: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Correlation-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  // Preflight cache
  MAX_AGE: 86400, // 24 hours

  // Credentials
  CREDENTIALS: true,
};

/**
 * Content Security Policy (CSP)
 * Prevents XSS, clickjacking, and code injection
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
  'font-src': ["'self'", 'fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
  'block-all-mixed-content': [],
};

/**
 * Enhanced Security Headers
 * Additional HTTP security headers for enhanced security mode
 */
export const ENHANCED_SECURITY_HEADERS = {
  // HSTS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS Protection (legacy)
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',

  // Cache Control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Session Configuration
 * Secure session management
 */
export const SESSION_CONFIG = {
  // Timeouts
  ABSOLUTE_TIMEOUT_MS: 43200000, // 12 hours
  IDLE_TIMEOUT_MS: 3600000, // 1 hour

  // Security
  HTTP_ONLY: true,
  SECURE: true, // HTTPS only
  SAME_SITE: 'strict' as const,

  // Rotation
  ROTATE_ON_LOGIN: true,
  ROTATE_INTERVAL_MS: 3600000, // 1 hour
};

/**
 * Password Policy
 * NIST 800-63B compliant
 */
export const PASSWORD_POLICY = {
  MIN_LENGTH: 12,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_DIGIT: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARACTERS: '!@#$%^&*()_+-=[]{}|;:,.<>?',

  // Password history
  PREVENT_REUSE: true,
  HISTORY_COUNT: 5,

  // Expiration
  EXPIRE_DAYS: 90,
  WARN_BEFORE_EXPIRE_DAYS: 7,

  // Breach detection
  CHECK_PWNED_PASSWORDS: true,
};

/**
 * Account Lockout Policy
 * Prevents brute force attacks
 */
export const ACCOUNT_LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 900000, // 15 minutes
  RESET_AFTER_MS: 3600000, // 1 hour

  // Progressive delays
  DELAYS: [
    0,      // 1st attempt: no delay
    1000,   // 2nd attempt: 1 second
    2000,   // 3rd attempt: 2 seconds
    5000,   // 4th attempt: 5 seconds
    10000,  // 5th attempt: 10 seconds
  ],
};

/**
 * Audit Logging Configuration
 * Comprehensive security event logging
 */
export const AUDIT_CONFIG = {
  // Retention
  RETENTION_DAYS: 2555, // 7 years (legal requirement)

  // Sensitive operations to log
  SENSITIVE_OPERATIONS: [
    'PII_ACCESS',
    'PHI_ACCESS',
    'FINANCIAL_DATA_ACCESS',
    'BULK_EXPORT',
    'PERMISSION_CHANGE',
    'SECURITY_SETTING_CHANGE',
    'PASSWORD_RESET',
    'MFA_DISABLE',
  ],

  // Log levels
  LOG_REQUEST_BODY: true,
  LOG_RESPONSE_BODY: false, // Don't log sensitive response data
  LOG_HEADERS: true,
  LOG_QUERY_PARAMS: true,

  // Integrity
  ENABLE_SIGNATURES: true,
  ENABLE_CHAIN_OF_CUSTODY: true,
};

/**
 * Encryption Configuration
 * Data protection at rest and in transit
 */
export const ENCRYPTION_CONFIG = {
  // Algorithms
  SYMMETRIC_ALGORITHM: 'aes-256-gcm',
  HASH_ALGORITHM: 'sha512',
  KDF_ALGORITHM: 'pbkdf2',

  // Key derivation
  KDF_ITERATIONS: 100000,
  SALT_LENGTH: 32,

  // Token generation
  TOKEN_LENGTH: 32,
  SESSION_TOKEN_LENGTH: 64,
};

/**
 * IP Reputation Configuration
 * Block malicious IPs automatically
 */
export const IP_REPUTATION_CONFIG = {
  // Blocking thresholds
  FAILED_LOGIN_THRESHOLD: 5,
  VIOLATION_THRESHOLD: 10,
  SCANNER_THRESHOLD: 20,

  // Block durations
  TEMPORARY_BLOCK_DURATION_MS: 3600000, // 1 hour
  PERMANENT_BLOCK_DURATION_MS: 0, // Permanent

  // Allowlist/Blocklist
  ENABLE_ALLOWLIST: true,
  ENABLE_BLOCKLIST: true,
};

/**
 * File Upload Security
 * Prevent malicious file uploads
 */
export const FILE_UPLOAD_SECURITY = {
  // Size limits
  MAX_FILE_SIZE: 52428800, // 50MB
  MAX_TOTAL_SIZE: 524288000, // 500MB

  // Validation
  VALIDATE_MIME_TYPE: true,
  VALIDATE_FILE_EXTENSION: true,
  SCAN_FOR_MALWARE: false, // Enable if antivirus available

  // Prohibited extensions
  PROHIBITED_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar', '.msi',
    '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.ps1', '.psm1',
  ],

  // Storage
  RANDOMIZE_FILENAME: true,
  STORE_OUTSIDE_WEBROOT: true,
};

/**
 * API Security
 * API-specific security controls
 */
export const API_SECURITY_CONFIG = {
  // API Keys
  API_KEY_LENGTH: 32,
  API_KEY_PREFIX: 'lxf_',

  // Rate limiting
  API_KEY_DEFAULT_LIMIT: 1000, // requests per hour

  // Scopes
  ENABLE_SCOPES: true,
  REQUIRE_SCOPE_FOR_SENSITIVE: true,

  // Versioning
  DEPRECATION_WARNING_DAYS: 90,
  SUNSET_NOTICE_DAYS: 30,
};

/**
 * ABAC Policy Configuration
 * Attribute-Based Access Control
 */
export const ABAC_CONFIG = {
  // Enable ABAC
  ENABLED: true,

  // Business hours
  BUSINESS_HOURS_START: 9,
  BUSINESS_HOURS_END: 17,
  BUSINESS_DAYS: [1, 2, 3, 4, 5], // Monday-Friday

  // Location restrictions
  ENABLE_LOCATION_CHECKS: false,
  ALLOWED_COUNTRIES: ['US', 'CA', 'GB'],

  // Time-based access
  ENABLE_TIME_RESTRICTIONS: false,
  REQUIRE_BUSINESS_HOURS_FOR_SENSITIVE: true,
};

/**
 * Security Monitoring
 * Real-time threat detection and alerting
 */
export const MONITORING_CONFIG = {
  // Event buffer
  MAX_BUFFER_SIZE: 1000,
  FLUSH_INTERVAL_MS: 10000, // 10 seconds

  // Pattern detection
  ENABLE_PATTERN_DETECTION: true,
  BRUTE_FORCE_THRESHOLD: 5,
  INJECTION_THRESHOLD: 3,
  SCANNING_THRESHOLD: 20,

  // Alerting
  ENABLE_ALERTS: true,
  ALERT_SEVERITY_LEVELS: ['critical', 'high'] as const,

  // Metrics
  METRICS_INTERVAL_MS: 60000, // 1 minute
  METRICS_RETENTION_HOURS: 24,
};

/**
 * Compliance Frameworks
 * Supported compliance standards
 */
export const COMPLIANCE_FRAMEWORKS = {
  GDPR: {
    enabled: true,
    retentionDays: 2555, // 7 years
    requireConsent: true,
    rightToErasure: true,
  },
  HIPAA: {
    enabled: true,
    retentionDays: 2555, // 7 years
    requireAuditTrail: true,
    encryptPHI: true,
  },
  SOC2: {
    enabled: true,
    requireAccessLogs: true,
    requireChangeTracking: true,
    requireIncidentResponse: true,
  },
  CCPA: {
    enabled: true,
    requireDataInventory: true,
    rightToKnow: true,
    rightToDelete: true,
  },
};
