// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================
// Authentication, session management, encryption, and security policies

import { getAppEnv } from '../app.config';

// Session Management
export const SESSION_TIMEOUT_MS = 3600000; // 1 hour
export const SESSION_WARNING_MS = 300000; // 5 minutes before timeout
export const SESSION_STORAGE_KEY = 'lexiflow-session';

// Authentication
export const AUTH_TOKEN_STORAGE_KEY = 'lexiflow-auth-token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'lexiflow-refresh-token';
export const AUTH_TOKEN_REFRESH_THRESHOLD_MS = 300000; // Refresh 5 min before expiry
export const AUTH_ENABLE_BIOMETRIC = false;
export const AUTH_ENABLE_MFA = true;

// Encryption (Client-side)
export const CRYPTO_ALGORITHM = 'AES-GCM';
export const CRYPTO_KEY_LENGTH = 256;
export const CRYPTO_USE_WORKER = true;

// Audit Logging
export const AUDIT_ENABLED = true;
export const AUDIT_LOG_NAVIGATION = true;
export const AUDIT_LOG_INTERACTIONS = true;
export const AUDIT_LOG_DATA_CHANGES = true;
export const AUDIT_BATCH_SIZE = 50;
export const AUDIT_FLUSH_INTERVAL_MS = 10000; // 10 seconds

// Error Handling
export const ERROR_SHOW_STACK_TRACE = getAppEnv() === 'development';
export const ERROR_ENABLE_REPORTING = false; // Set to true with error service
export const ERROR_MAX_REPORT_SIZE = 10000; // Characters
export const ERROR_REPORT_SAMPLING_RATE = 1.0; // 100% in dev, lower in prod

// Export as object
