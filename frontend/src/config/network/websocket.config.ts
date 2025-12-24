// =============================================================================
// WEBSOCKET CONFIGURATION
// =============================================================================
// Real-time communication settings for WebSocket connections

export const WS_ENABLED = false; // Set to true when backend WebSocket is ready
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_RECONNECT_DELAY_MS = 1000;
export const WS_RECONNECT_BACKOFF_MULTIPLIER = 1.5;
export const WS_PING_INTERVAL_MS = 25000;
export const WS_PING_TIMEOUT_MS = 5000;
export const WS_MAX_MESSAGE_SIZE = 1048576; // 1MB

// Export as object
export const WEBSOCKET_CONFIG = {
  enabled: WS_ENABLED,
  url: WS_URL,
  reconnect: {
    attempts: WS_RECONNECT_ATTEMPTS,
    delayMs: WS_RECONNECT_DELAY_MS,
    backoffMultiplier: WS_RECONNECT_BACKOFF_MULTIPLIER,
  },
  ping: {
    intervalMs: WS_PING_INTERVAL_MS,
    timeoutMs: WS_PING_TIMEOUT_MS,
  },
  maxMessageSize: WS_MAX_MESSAGE_SIZE,
} as const;
