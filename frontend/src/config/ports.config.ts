/**
 * Ports Configuration
 * 
 * Centralized port configuration for all services in the LexiFlow ecosystem.
 * This ensures consistency across development, testing, and deployment environments.
 */

/**
 * Core Application Ports
 */
export const PORTS = {
  /** Frontend Vite dev server port */
  FRONTEND: 3400,
  
  /** Backend NestJS API server port (primary) */
  BACKEND: 3000,

  /** Legacy backend port (deprecated) */
  BACKEND_LEGACY: 5000,

  /** Alternative backend port (for testing/development) */
  BACKEND_ALT: 3001,

  /** Storybook dev server port */
  STORYBOOK: 6006,

  /** Cypress E2E testing port (uses FRONTEND by default) */
  CYPRESS: 3400,
} as const;

/**
 * Common Network Timeouts (milliseconds)
 */
export const TIMEOUTS = {
  /** Default API request timeout */
  API_REQUEST: 30000, // 30 seconds
  
  /** Health check timeout */
  HEALTH_CHECK: 5000, // 5 seconds
  
  /** WebSocket connection timeout */
  WS_CONNECTION: 5000, // 5 seconds
  
  /** Backend discovery timeout */
  BACKEND_DISCOVERY: 3000, // 3 seconds
  
  /** Notification auto-dismiss duration */
  NOTIFICATION_DEFAULT: 4000, // 4 seconds
  NOTIFICATION_SUCCESS: 3000, // 3 seconds
  NOTIFICATION_ERROR: 5000, // 5 seconds
  
  /** Session timeouts */
  SESSION_TIMEOUT: 3600000, // 1 hour
  SESSION_WARNING: 300000, // 5 minutes before timeout
  
  /** UI Interactions */
  TYPING_INDICATOR: 3000, // 3 seconds
  TYPING_INDICATOR_EXPIRY: 5000, // 5 seconds
  AUTOSAVE_DEBOUNCE: 3000, // 3 seconds
} as const;

/**
 * URL Builder Functions
 */
export const URLS = {
  /** Build frontend URL */
  frontend: (host = 'localhost') => `http://${host}:${PORTS.FRONTEND}`,
  
  /** Build backend URL for given environment */
  backend: (host = 'localhost') => `http://${host}:${PORTS.BACKEND}`,
  
  /** Build WebSocket URL for backend */
  websocket: (host = 'localhost', secure = false) => 
    `${secure ? 'wss' : 'ws'}://${host}:${PORTS.BACKEND}`,
  
  /** Build Storybook URL */
  storybook: (host = 'localhost') => `http://${host}:${PORTS.STORYBOOK}`,
  
  /** Build API base URL with /api prefix */
  api: (host = 'localhost') => `http://${host}:${PORTS.BACKEND}/api`,
} as const;

/**
 * Default host configurations
 */
export const HOSTS = {
  LOCAL: 'localhost',
  LOCAL_IPV4: '127.0.0.1',
  ANY: '0.0.0.0',
} as const;

/**
 * Get backend URL from environment or default
 */
export function getBackendUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return URLS.backend(HOSTS.ANY);
}

/**
 * Get API URL with /api prefix from environment or default
 */
export function getApiUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return URLS.api(HOSTS.LOCAL);
}

/**
 * Get WebSocket URL from environment or default
 */
export function getWebSocketUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  return URLS.websocket(HOSTS.LOCAL, isSecure);
}

export default PORTS;
