// =============================================================================
// LEXIFLOW MASTER CONFIGURATION
// =============================================================================
// Non-sensitive operational settings safe to commit to repository
// Sensitive values (credentials, secrets) should remain in .env

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

// Core Database Settings
export const DB_SYNCHRONIZE = false; // CRITICAL: Keep false to prevent data loss
export const DB_MIGRATIONS_RUN = false;
export const DB_LOGGING = process.env.NODE_ENV !== "production";
export const DB_SSL = true;
export const DB_SSL_REJECT_UNAUTHORIZED = true;

// Connection Pool Settings
export const DB_POOL_MAX = 20;
export const DB_POOL_MIN = 5;
export const DB_IDLE_TIMEOUT = 30000; // 30 seconds
export const DB_CONNECTION_TIMEOUT = 10000; // 10 seconds
export const DB_MAX_USES = 7500; // Rotate connections after this many uses
export const DB_STATEMENT_TIMEOUT = 60000; // 60 seconds
export const DB_QUERY_TIMEOUT = 60000; // 60 seconds
export const DB_ACQUIRE_TIMEOUT = 60000; // 60 seconds
export const DB_EVICTION_RUN_INTERVAL = 10000; // 10 seconds

// Cache Settings
export const DB_CACHE_ENABLED = true;
export const DB_CACHE_DURATION = 30000; // 30 seconds
export const DB_CACHE_TYPE = "redis";

// Transaction Settings
export const DB_MAX_QUERY_EXECUTION_TIME = 60000; // 60 seconds
export const DB_ENABLE_LISTENERS = true;
export const DB_AUTO_LOAD_ENTITIES = true;
export const DB_KEEP_CONNECTION_ALIVE = true;

// =============================================================================
// REDIS CONFIGURATION
// =============================================================================
export const REDIS_ENABLED = true;
export const REDIS_MAX_RETRIES_PER_REQUEST = 3;
export const REDIS_ENABLE_READY_CHECK = true;
export const REDIS_ENABLE_OFFLINE_QUEUE = true;
export const REDIS_CONNECT_TIMEOUT = 10000; // 10 seconds
export const REDIS_COMMAND_TIMEOUT = 5000; // 5 seconds
export const REDIS_KEEP_ALIVE = 30000; // 30 seconds
export const REDIS_KEY_PREFIX = "lexiflow:";

// Redis Cache TTL (in seconds)
export const REDIS_SESSION_TTL = 86400; // 24 hours
export const REDIS_CACHE_TTL = 3600; // 1 hour
export const REDIS_RATE_LIMIT_TTL = 60; // 1 minute

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================
export const PORT = 5000; // Updated to match configuration.ts default
export const API_PREFIX = "/api/v1";
export const API_VERSION = "1.0.0";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const ENABLE_GRACEFUL_SHUTDOWN = true;
export const SHUTDOWN_TIMEOUT_MS = 10000; // 10 seconds

// Helmet Security Headers
export const HELMET_HSTS_MAX_AGE = 31536000; // 1 year
export const HELMET_HSTS_INCLUDE_SUBDOMAINS = true;
export const HELMET_HSTS_PRELOAD = true;

// Request Settings
export const REQUEST_BODY_LIMIT = "50mb";
export const REQUEST_PARAMETER_LIMIT = 10000;
export const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

// =============================================================================
// AUTHENTICATION & SECURITY
// =============================================================================

// JWT Token Expiration (in seconds)
export const JWT_EXPIRES_IN = 900; // 15 minutes
export const JWT_REFRESH_EXPIRES_IN = 604800; // 7 days
export const JWT_ALGORITHM = "HS256";

// Token Storage TTL Configuration
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const RESET_TOKEN_TTL_HOURS = 1;
export const MFA_TOKEN_TTL_MINUTES = 5;
export const VERIFICATION_TOKEN_TTL_HOURS = 24;

// Password & Hashing
export const BCRYPT_ROUNDS = 12;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;

// Account Security
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_DURATION_MS = 900000; // 15 minutes
export const SESSION_ABSOLUTE_TIMEOUT_MS = 43200000; // 12 hours
export const SESSION_IDLE_TIMEOUT_MS = 3600000; // 1 hour

// MFA Settings
export const MFA_TOTP_WINDOW = 1;
export const MFA_TOTP_STEP = 30;
export const MFA_BACKUP_CODES_COUNT = 10;

// =============================================================================
// CORS CONFIGURATION
// =============================================================================
// Allow all origins in development, customize for production via environment variables
export const CORS_ORIGIN = (
  _origin: string,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  // Allow all origins in development (for accessing from any IP)
  // In production, this should be overridden by the main configuration
  callback(null, true);
};
export const CORS_ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
];
export const CORS_ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "X-API-Key",
  "X-Correlation-ID",
];
export const CORS_EXPOSED_HEADERS = [
  "X-Total-Count",
  "X-Page-Count",
  "X-Correlation-ID",
];
export const CORS_CREDENTIALS = true;
export const CORS_MAX_AGE = 86400; // 24 hours

// =============================================================================
// FILE STORAGE CONFIGURATION
// Note: File paths are now in paths.config.ts
// =============================================================================
export const MAX_FILE_SIZE = 52428800; // 50MB in bytes
export const FILE_UPLOAD_TIMEOUT_MS = 300000; // 5 minutes
export const FILE_CHUNK_SIZE = 1048576; // 1MB chunks
export const FILE_ENABLE_VIRUS_SCAN = false;
export const FILE_AUTO_DELETE_TEMP = true;
export const FILE_TEMP_CLEANUP_INTERVAL_MS = 3600000; // 1 hour

// =============================================================================
// RATE LIMITING
// =============================================================================

// Global Rate Limits
export const RATE_LIMIT_TTL = 60; // Time window in seconds
export const RATE_LIMIT_LIMIT = 300; // Max requests per window
export const RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS = false;
export const RATE_LIMIT_SKIP_FAILED_REQUESTS = false;

// Per-Endpoint Rate Limits
export const RATE_LIMIT_AUTH_TTL = 300; // 5 minutes
export const RATE_LIMIT_AUTH_LIMIT = 10;
export const RATE_LIMIT_API_TTL = 60;
export const RATE_LIMIT_API_LIMIT = 100;
export const RATE_LIMIT_UPLOAD_TTL = 60;
export const RATE_LIMIT_UPLOAD_LIMIT = 10;

// IP Blocking
export const RATE_LIMIT_BLOCK_DURATION_MS = 900000; // 15 minutes
export const RATE_LIMIT_BLOCK_THRESHOLD = 1000;

// API Key Rate Limits
export const API_KEY_DEFAULT_RATE_LIMIT = 1000; // requests per hour

// =============================================================================
// WEBSOCKET CONFIGURATION
// =============================================================================
export const WS_MAX_CONNECTIONS_PER_USER = 5;
export const WS_MAX_GLOBAL_CONNECTIONS = 10000;
export const WS_MAX_ROOMS_PER_USER = 50;
export const WS_RATE_LIMIT_EVENTS_PER_MINUTE = 100;
export const WS_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
export const WS_PING_INTERVAL_MS = 25000; // 25 seconds
export const WS_PING_TIMEOUT_MS = 5000; // 5 seconds
export const WS_HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_RECONNECT_DELAY_MS = 1000;
export const WS_MESSAGE_MAX_SIZE = 1048576; // 1MB
export const WS_ENABLE_COMPRESSION = true;

// =============================================================================
// FILE STORAGE LIMITS
// =============================================================================
export const FILE_MAX_SIZE = 524288000; // 500MB
export const FILE_MIN_DISK_SPACE = 1073741824; // 1GB
export const FILE_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
];
export const FILE_PROHIBITED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".vbs",
  ".js",
  ".jar",
];
export const FILE_ENABLE_DEDUPLICATION = true;
export const FILE_ENABLE_VERSIONING = true;

// =============================================================================
// OCR PROCESSING CONFIGURATION
// =============================================================================
export const OCR_MAX_FILE_SIZE = 104857600; // 100MB
export const OCR_TIMEOUT_MS = 300000; // 5 minutes
export const OCR_CHUNK_SIZE = 10485760; // 10MB chunks
export const OCR_MAX_CONCURRENT_JOBS = 5;
export const OCR_SUPPORTED_LANGUAGES = ["eng", "spa", "fra", "deu"];
export const OCR_DEFAULT_LANGUAGE = "eng";
export const OCR_DPI = 300;
export const OCR_ENABLE_AUTO_ROTATE = true;
export const OCR_ENABLE_DESKEW = true;

// =============================================================================
// DOCUMENT VERSION CONFIGURATION
// =============================================================================
export const MAX_VERSIONS_PER_DOCUMENT = 100;
export const VERSION_AUTO_CLEANUP_ENABLED = false;
export const VERSION_RETENTION_DAYS = 365;
export const VERSION_COMPRESS_OLDER_THAN_DAYS = 90;
export const VERSION_ARCHIVE_OLDER_THAN_DAYS = 180;
export const VERSION_ENABLE_DIFF = true;
export const VERSION_ENABLE_COMPARISON = true;

// =============================================================================
// QUEUE CONFIGURATION
// =============================================================================
export const QUEUE_JOB_TIMEOUT_MS = 600000; // 10 minutes
export const QUEUE_MAX_ATTEMPTS = 3;
export const QUEUE_BACKOFF_DELAY_MS = 2000;
export const QUEUE_BACKOFF_TYPE = "exponential"; // 'fixed' | 'exponential'
export const QUEUE_REMOVE_ON_COMPLETE = 100;
export const QUEUE_REMOVE_ON_FAIL = 50;
export const QUEUE_MAX_STALLED_COUNT = 3;
export const QUEUE_STALLED_INTERVAL_MS = 30000; // 30 seconds
export const QUEUE_ENABLE_PRIORITY = true;
export const QUEUE_ENABLE_DELAY = true;

// Queue-specific settings
export const QUEUE_DOCUMENT_CONCURRENCY = 5;
export const QUEUE_EMAIL_CONCURRENCY = 10;
export const QUEUE_NOTIFICATION_CONCURRENCY = 20;
export const QUEUE_REPORT_CONCURRENCY = 2;
export const QUEUE_BACKUP_CONCURRENCY = 1;

// =============================================================================
// VALIDATION CONFIGURATION
// =============================================================================
export const VALIDATION_WHITELIST = true;
export const VALIDATION_FORBID_NON_WHITELISTED = true;
export const VALIDATION_TRANSFORM = true;
export const VALIDATION_ENABLE_IMPLICIT_CONVERSION = true;
export const VALIDATION_DISABLE_ERROR_MESSAGES = false;
export const VALIDATION_SKIP_MISSING_PROPERTIES = false;
export const VALIDATION_VALIDATION_ERROR_TARGET = false;
export const VALIDATION_STOP_AT_FIRST_ERROR = false;

// =============================================================================
// LOGGING CONFIGURATION
// =============================================================================
export const LOG_LEVEL =
  process.env.NODE_ENV === "production" ? "info" : "debug";
export const LOG_ENABLE_TIMESTAMPS = true;
export const LOG_ENABLE_COLORS = true;
export const LOG_MAX_FILES = 30;
export const LOG_MAX_FILE_SIZE = "20m";
export const LOG_ENABLE_FILE_LOGGING = true;
export const LOG_ENABLE_CONSOLE_LOGGING = true;
export const LOG_ENABLE_ERROR_STACK_TRACES = true;

// =============================================================================
// MONITORING & METRICS
// =============================================================================
export const METRICS_ENABLED = true;
export const METRICS_PORT = 9090;
export const METRICS_PATH = "/metrics";
export const HEALTH_CHECK_ENABLED = true;
export const HEALTH_CHECK_PATH = "/health";
export const HEALTH_CHECK_TIMEOUT_MS = 5000;

// =============================================================================
// PERFORMANCE TUNING
// =============================================================================
export const ENABLE_COMPRESSION = true;
export const COMPRESSION_LEVEL = 6;
export const COMPRESSION_THRESHOLD = 1024; // 1KB
export const ENABLE_ETAG = true;
export const ENABLE_CACHE_CONTROL = true;
export const CACHE_CONTROL_MAX_AGE = 3600; // 1 hour

// =============================================================================
// NOTIFICATION CONFIGURATION
// =============================================================================
export const NOTIFICATION_MAX_RETRIES = 3;
export const NOTIFICATION_RETRY_DELAY_MS = 5000;
export const NOTIFICATION_BATCH_SIZE = 100;
export const NOTIFICATION_QUEUE_ENABLED = true;

// Email Settings
export const EMAIL_ENABLED = false;
export const EMAIL_RATE_LIMIT_PER_HOUR = 100;
export const EMAIL_MAX_RECIPIENTS = 50;
export const EMAIL_TIMEOUT_MS = 10000;

// SMS Settings
export const SMS_ENABLED = false;
export const SMS_RATE_LIMIT_PER_HOUR = 50;
export const SMS_MAX_LENGTH = 160;

// =============================================================================
// AUDIT & COMPLIANCE
// =============================================================================
export const AUDIT_ENABLED = true;
export const AUDIT_LOG_RETENTION_DAYS = 2555; // 7 years
export const AUDIT_LOG_SENSITIVE_DATA = false;
export const AUDIT_LOG_REQUEST_BODY = true;
export const AUDIT_LOG_RESPONSE_BODY = false;
export const AUDIT_LOG_QUERY_PARAMS = true;

// =============================================================================
// BACKUP CONFIGURATION
// =============================================================================
export const BACKUP_ENABLED = true;
export const BACKUP_SCHEDULE_CRON = "0 2 * * *"; // 2 AM daily
export const BACKUP_RETENTION_DAYS = 30;
export const BACKUP_COMPRESSION_ENABLED = true;
export const BACKUP_ENCRYPTION_ENABLED = true;
export const BACKUP_VERIFY_AFTER_COMPLETION = true;

// =============================================================================
// WEBHOOK CONFIGURATION
// =============================================================================
export const WEBHOOK_MAX_RETRIES = 3;
export const WEBHOOK_RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min
export const WEBHOOK_TIMEOUT_MS = 10000; // 10 seconds
export const WEBHOOK_BATCH_SIZE = 50;
export const WEBHOOK_SIGNATURE_ALGORITHM = "sha256";
export const WEBHOOK_VERIFY_SSL = true;

// =============================================================================
// BULK OPERATIONS CONFIGURATION
// =============================================================================
export const BULK_OPERATION_BATCH_SIZE = 1000;
export const BULK_OPERATION_USE_TRANSACTION = true;
export const BULK_OPERATION_CONTINUE_ON_ERROR = false;
export const BULK_OPERATION_TIMEOUT_MS = 300000; // 5 minutes

// =============================================================================
// PAGINATION DEFAULTS
// =============================================================================
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_PAGE_NUMBER = 1;

// =============================================================================
// SEARCH CONFIGURATION
// =============================================================================
export const SEARCH_MAX_RESULTS = 100;
export const SEARCH_PREVIEW_LIMIT = 10; // Results per entity type in global search
export const SEARCH_TIMEOUT_MS = 5000;
export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_ENABLE_FUZZY = true;
export const SEARCH_FUZZY_THRESHOLD = 0.7;
export const SEARCH_INDEX_BATCH_SIZE = 500;

// =============================================================================
// HEALTH CHECK CONFIGURATION
// =============================================================================
export const HEALTH_DB_TIMEOUT_MS = 3000;
export const HEALTH_MEMORY_HEAP_MAX_MB = 300;
export const HEALTH_MEMORY_RSS_MAX_MB = 500;
export const HEALTH_DISK_THRESHOLD_PERCENT = 90;

// =============================================================================
// PACER INTEGRATION CONFIGURATION
// =============================================================================
export const PACER_API_DELAY_MS = 1000; // Rate limiting delay between requests
export const PACER_MAX_RETRIES = 3;
export const PACER_TIMEOUT_MS = 15000;
export const PACER_CACHE_TTL = 3600; // 1 hour

// =============================================================================
// CALENDAR INTEGRATION CONFIGURATION
// =============================================================================
export const CALENDAR_SYNC_INTERVAL_MINUTES = 15;
export const CALENDAR_UPCOMING_DAYS_DEFAULT = 7;
export const CALENDAR_PAST_DAYS_RETENTION = 90;
export const CALENDAR_MAX_ATTENDEES = 100;

// =============================================================================
// LEGAL DOCUMENT DEFAULTS
// =============================================================================
export const PLEADING_UPCOMING_DAYS_DEFAULT = 30;
export const PLEADING_DUE_SOON_DAYS_DEFAULT = 7;
export const WORKFLOW_STAGE_DURATION_DAYS_DEFAULT = 14;

// =============================================================================
// JOB CLEANUP CONFIGURATION
// =============================================================================
export const CLEANUP_OLD_JOBS_DAYS = 90;
export const CLEANUP_TEMP_FILES_HOURS = 24;
export const CLEANUP_FAILED_JOBS_DAYS = 30;
export const CLEANUP_COMPLETED_JOBS_DAYS = 60;

// =============================================================================
// TOKEN BLACKLIST CONFIGURATION
// =============================================================================
export const TOKEN_BLACKLIST_PREFIX = "blacklist:token:";
export const TOKEN_USER_BLACKLIST_PREFIX = "blacklist:user:";
export const TOKEN_BLACKLIST_TTL_DAYS = 7; // Match refresh token lifetime
export const TOKEN_BLACKLIST_CLEANUP_INTERVAL_HOURS = 6;

// =============================================================================
// CLIENT PORTAL CONFIGURATION
// =============================================================================
export const CLIENT_PORTAL_TOKEN_EXPIRY_DAYS = 30;
export const CLIENT_PORTAL_MAX_SESSIONS = 3;
export const CLIENT_PORTAL_SESSION_TIMEOUT_MINUTES = 30;

// =============================================================================
// REALTIME GATEWAY CONFIGURATION
// =============================================================================
export const REALTIME_NAMESPACE = "/events";
export const REALTIME_MAX_HTTP_BUFFER_SIZE = 1e6; // 1MB
export const REALTIME_PING_TIMEOUT_MS = 60000; // 60 seconds
export const REALTIME_PING_INTERVAL_MS = 25000; // 25 seconds
export const REALTIME_CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  (process.env.NODE_ENV === "production" ? false : true);

// =============================================================================
// TIMEOUT INTERCEPTOR CONFIGURATION
// =============================================================================
export const HTTP_REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const GRAPHQL_QUERY_TIMEOUT_MS = 60000; // 60 seconds

// =============================================================================
// DEFAULT GLOBAL ADMIN PROFILE CONFIGURATION
// =============================================================================
// Controls the automatic creation of a default global admin user on startup
// All settings can be overridden via environment variables

export const DEFAULT_ADMIN_ENABLED =
  process.env.DEFAULT_ADMIN_ENABLED !== "false";
export const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@lexiflow.com";
export const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";
export const DEFAULT_ADMIN_FIRST_NAME =
  process.env.DEFAULT_ADMIN_FIRST_NAME || "Super";
export const DEFAULT_ADMIN_LAST_NAME =
  process.env.DEFAULT_ADMIN_LAST_NAME || "Admin";
export const DEFAULT_ADMIN_TITLE =
  process.env.DEFAULT_ADMIN_TITLE || "System Administrator";
export const DEFAULT_ADMIN_DEPARTMENT =
  process.env.DEFAULT_ADMIN_DEPARTMENT || "Administration";

// Default Admin Profile Settings (for linked UserProfile)
export const DEFAULT_ADMIN_PROFILE_ENABLED =
  process.env.DEFAULT_ADMIN_PROFILE_ENABLED !== "false";
export const DEFAULT_ADMIN_BAR_NUMBER =
  process.env.DEFAULT_ADMIN_BAR_NUMBER || null;
export const DEFAULT_ADMIN_JURISDICTIONS = process.env
  .DEFAULT_ADMIN_JURISDICTIONS
  ? (JSON.parse(process.env.DEFAULT_ADMIN_JURISDICTIONS) as string[])
  : ["Global"];
export const DEFAULT_ADMIN_PRACTICE_AREAS = process.env
  .DEFAULT_ADMIN_PRACTICE_AREAS
  ? (JSON.parse(process.env.DEFAULT_ADMIN_PRACTICE_AREAS) as string[])
  : ["System Administration", "Platform Management"];
export const DEFAULT_ADMIN_BIO =
  process.env.DEFAULT_ADMIN_BIO ||
  "Global system administrator with full platform access and management capabilities.";
export const DEFAULT_ADMIN_YEARS_OF_EXPERIENCE = parseInt(
  process.env.DEFAULT_ADMIN_YEARS_OF_EXPERIENCE || "0",
  10
);
export const DEFAULT_ADMIN_DEFAULT_HOURLY_RATE = parseFloat(
  process.env.DEFAULT_ADMIN_DEFAULT_HOURLY_RATE || "0"
);

// Consolidated Default Admin Configuration Object
export const DEFAULT_ADMIN_CONFIG = {
  enabled: DEFAULT_ADMIN_ENABLED,
  user: {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    firstName: DEFAULT_ADMIN_FIRST_NAME,
    lastName: DEFAULT_ADMIN_LAST_NAME,
    title: DEFAULT_ADMIN_TITLE,
    department: DEFAULT_ADMIN_DEPARTMENT,
  },
  profile: {
    enabled: DEFAULT_ADMIN_PROFILE_ENABLED,
    barNumber: DEFAULT_ADMIN_BAR_NUMBER,
    jurisdictions: DEFAULT_ADMIN_JURISDICTIONS,
    practiceAreas: DEFAULT_ADMIN_PRACTICE_AREAS,
    bio: DEFAULT_ADMIN_BIO,
    yearsOfExperience: DEFAULT_ADMIN_YEARS_OF_EXPERIENCE,
    defaultHourlyRate: DEFAULT_ADMIN_DEFAULT_HOURLY_RATE,
  },
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const FEATURE_GRAPHQL_ENABLED = true;
export const FEATURE_SWAGGER_ENABLED = true;
export const FEATURE_WEBSOCKETS_ENABLED = true;
export const FEATURE_FILE_UPLOAD_ENABLED = true;
export const FEATURE_OCR_ENABLED = true;
export const FEATURE_EMAIL_ENABLED = false;
export const FEATURE_SMS_ENABLED = false;
export const FEATURE_MFA_ENABLED = true;
export const FEATURE_API_VERSIONING_ENABLED = true;
export const FEATURE_PACER_INTEGRATION_ENABLED = false;
export const FEATURE_CALENDAR_INTEGRATION_ENABLED = false;
export const FEATURE_BULK_OPERATIONS_ENABLED = true;
export const FEATURE_ADVANCED_SEARCH_ENABLED = true;
export const FEATURE_REALTIME_ENABLED = true;
