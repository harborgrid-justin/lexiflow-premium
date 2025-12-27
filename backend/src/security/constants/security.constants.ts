/**
 * Security Constants for LexiFlow Premium
 * Enterprise-grade security configuration values
 */

// =============================================================================
// ENCRYPTION CONFIGURATION
// =============================================================================

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
export const ENCRYPTION_IV_LENGTH = 16; // 128 bits
export const ENCRYPTION_AUTH_TAG_LENGTH = 16; // 128 bits
export const ENCRYPTION_SALT_LENGTH = 32; // 256 bits

// Key derivation settings
export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_KEY_LENGTH = 32;
export const PBKDF2_DIGEST = 'sha512';

// Argon2 settings (preferred for new implementations)
export const ARGON2_MEMORY_COST = 65536; // 64 MB
export const ARGON2_TIME_COST = 3;
export const ARGON2_PARALLELISM = 4;
export const ARGON2_HASH_LENGTH = 32;
export const ARGON2_TYPE = 2; // Argon2id

// =============================================================================
// CONTENT SECURITY POLICY
// =============================================================================

export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"], // Will be enhanced with nonce at runtime
  scriptSrcElem: ["'self'"],
  scriptSrcAttr: ["'none'"],
  styleSrc: ["'self'", "'unsafe-inline'"], // Consider moving to nonce-based
  styleSrcElem: ["'self'", "'unsafe-inline'"],
  styleSrcAttr: ["'none'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  manifestSrc: ["'self'"],
  workerSrc: ["'self'"],
  childSrc: ["'none'"],
  upgradeInsecureRequests: [],
  blockAllMixedContent: [],
};

// =============================================================================
// SECURITY HEADERS
// =============================================================================

export const HSTS_MAX_AGE = 31536000; // 1 year in seconds
export const HSTS_INCLUDE_SUBDOMAINS = true;
export const HSTS_PRELOAD = true;

export const REFERRER_POLICY = 'strict-origin-when-cross-origin';

export const PERMISSIONS_POLICY = {
  camera: [],
  microphone: [],
  geolocation: [],
  payment: [],
  usb: [],
  accelerometer: [],
  gyroscope: [],
  magnetometer: [],
  'display-capture': [],
  autoplay: ["'self'"],
  'encrypted-media': ["'self'"],
  fullscreen: ["'self'"],
  'picture-in-picture': ["'self'"],
};

// =============================================================================
// IP REPUTATION & BLOCKING
// =============================================================================

export const IP_REPUTATION_CACHE_TTL = 3600; // 1 hour in seconds
export const IP_REPUTATION_CHECK_INTERVAL = 300; // 5 minutes
export const IP_BLOCK_DURATION = 86400; // 24 hours
export const IP_TEMPORARY_BLOCK_DURATION = 3600; // 1 hour

// Suspicious activity thresholds
export const IP_MAX_FAILED_LOGINS = 5;
export const IP_MAX_REQUESTS_PER_MINUTE = 100;
export const IP_MAX_REQUESTS_PER_HOUR = 1000;
export const IP_FAILED_LOGIN_WINDOW = 900; // 15 minutes

// Rate limiting for suspicious IPs
export const SUSPICIOUS_IP_RATE_LIMIT = 10; // requests per minute
export const SUSPICIOUS_IP_BLOCK_THRESHOLD = 3; // violations before block

// =============================================================================
// REQUEST FINGERPRINTING
// =============================================================================

export const FINGERPRINT_SALT_LENGTH = 16;
export const FINGERPRINT_HASH_ALGORITHM = 'sha256';
export const FINGERPRINT_CACHE_TTL = 86400; // 24 hours
export const FINGERPRINT_MAX_AGE = 2592000; // 30 days

// Fingerprint components
export const FINGERPRINT_COMPONENTS = [
  'userAgent',
  'acceptLanguage',
  'acceptEncoding',
  'ip',
  'platform',
] as const;

// Session hijacking detection
export const SESSION_FINGERPRINT_MISMATCH_THRESHOLD = 2;
export const SESSION_FINGERPRINT_CHECK_INTERVAL = 300; // 5 minutes

// =============================================================================
// TRUSTED IP RANGES
// =============================================================================

// Private IP ranges (RFC 1918)
export const PRIVATE_IP_RANGES = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '127.0.0.0/8',
  '::1/128',
  'fc00::/7',
  'fe80::/10',
];

// Cloud provider IP ranges (example - should be updated with actual ranges)
export const CLOUD_PROVIDER_RANGES = [
  // AWS
  // GCP
  // Azure
  // Add actual ranges from cloud providers
];

// =============================================================================
// SECURITY MONITORING
// =============================================================================

export const SECURITY_EVENT_RETENTION_DAYS = 90;
export const SECURITY_ALERT_THRESHOLD = 10; // events per minute
export const SECURITY_LOG_MAX_SIZE = 100000; // entries

// Event types for monitoring
export const SECURITY_EVENT_TYPES = {
  FAILED_LOGIN: 'failed_login',
  SUCCESSFUL_LOGIN: 'successful_login',
  SUSPICIOUS_REQUEST: 'suspicious_request',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  IP_BLOCKED: 'ip_blocked',
  SESSION_HIJACK_ATTEMPT: 'session_hijack_attempt',
  INVALID_TOKEN: 'invalid_token',
  BRUTE_FORCE_ATTEMPT: 'brute_force_attempt',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_VIOLATION: 'csrf_violation',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
} as const;

// =============================================================================
// PASSWORD SECURITY
// =============================================================================

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;
export const PASSWORD_MIN_ENTROPY = 50; // bits

// Password history
export const PASSWORD_HISTORY_COUNT = 5;
export const PASSWORD_EXPIRY_DAYS = 90;
export const PASSWORD_EXPIRY_WARNING_DAYS = 14;

// =============================================================================
// SESSION SECURITY
// =============================================================================

export const SESSION_ABSOLUTE_TIMEOUT = 43200000; // 12 hours in ms
export const SESSION_IDLE_TIMEOUT = 3600000; // 1 hour in ms
export const SESSION_MAX_CONCURRENT = 3; // per user
export const SESSION_RENEWAL_THRESHOLD = 900000; // 15 minutes

// =============================================================================
// API KEY SECURITY
// =============================================================================

export const API_KEY_LENGTH = 32;
export const API_KEY_PREFIX = 'lxf_';
export const API_KEY_ROTATION_DAYS = 90;
export const API_KEY_MAX_PER_USER = 10;

// =============================================================================
// AUDIT & COMPLIANCE
// =============================================================================

export const AUDIT_LOG_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'privateKey',
  'creditCard',
  'ssn',
  'taxId',
];

export const AUDIT_LOG_PII_FIELDS = [
  'email',
  'phone',
  'address',
  'dateOfBirth',
  'socialSecurityNumber',
];

// =============================================================================
// DATA CLASSIFICATION
// =============================================================================

export const DATA_CLASSIFICATION_LEVELS = {
  PUBLIC: 0,
  INTERNAL: 1,
  CONFIDENTIAL: 2,
  RESTRICTED: 3,
  TOP_SECRET: 4,
} as const;

// Fields requiring encryption at rest
export const FIELDS_REQUIRING_ENCRYPTION = [
  'ssn',
  'taxId',
  'creditCardNumber',
  'bankAccountNumber',
  'driverLicenseNumber',
  'passportNumber',
  'medicalRecordNumber',
  'clientPrivilegedInfo',
];

// =============================================================================
// SECURITY RESPONSE HEADERS
// =============================================================================

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Strict-Transport-Security': `max-age=${HSTS_MAX_AGE}; includeSubDomains; preload`,
  'Referrer-Policy': REFERRER_POLICY,
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const;

// =============================================================================
// NONCE GENERATION
// =============================================================================

export const NONCE_LENGTH = 16;
export const NONCE_ENCODING = 'base64';

// =============================================================================
// TRUSTED DOMAINS
// =============================================================================

export const TRUSTED_DOMAINS = [
  // Add your trusted domains here
  'lexiflow.com',
  'api.lexiflow.com',
];

// =============================================================================
// SECURITY TIMEOUTS
// =============================================================================

export const SECURITY_OPERATION_TIMEOUT = 5000; // 5 seconds
export const SECURITY_CACHE_CLEANUP_INTERVAL = 3600000; // 1 hour
export const IP_REPUTATION_UPDATE_INTERVAL = 86400000; // 24 hours

// =============================================================================
// REDIS KEYS
// =============================================================================

export const REDIS_PREFIX = 'lexiflow:security:';
export const REDIS_BLOCKED_IP_PREFIX = `${REDIS_PREFIX}blocked:ip:`;
export const REDIS_FINGERPRINT_PREFIX = `${REDIS_PREFIX}fingerprint:`;
export const REDIS_SESSION_PREFIX = `${REDIS_PREFIX}session:`;
export const REDIS_SUSPICIOUS_IP_PREFIX = `${REDIS_PREFIX}suspicious:ip:`;
export const REDIS_SECURITY_EVENT_PREFIX = `${REDIS_PREFIX}event:`;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const SECURITY_ERROR_MESSAGES = {
  IP_BLOCKED: 'Access denied. Your IP address has been temporarily blocked due to suspicious activity.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  SESSION_HIJACK_DETECTED: 'Session security violation detected. Please log in again.',
  INVALID_FINGERPRINT: 'Request validation failed. Please clear cookies and try again.',
  ENCRYPTION_FAILED: 'Failed to encrypt sensitive data.',
  DECRYPTION_FAILED: 'Failed to decrypt data. Data may be corrupted.',
  INVALID_NONCE: 'Security token validation failed.',
  CSP_VIOLATION: 'Content Security Policy violation detected.',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const SECURITY_FEATURES = {
  IP_REPUTATION_ENABLED: true,
  REQUEST_FINGERPRINTING_ENABLED: true,
  SESSION_HIJACK_DETECTION_ENABLED: true,
  FIELD_LEVEL_ENCRYPTION_ENABLED: true,
  CSP_NONCE_ENABLED: true,
  SECURITY_HEADERS_ENABLED: true,
  AUDIT_LOGGING_ENABLED: true,
  IP_GEOLOCATION_ENABLED: false, // Requires external service
  THREAT_INTELLIGENCE_ENABLED: false, // Requires external service
} as const;
