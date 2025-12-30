import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * WebSocketConfigService
 *
 * Provides globally injectable access to WebSocket configuration.
 * Consolidates max connections, rooms, rate limits, and ping settings.
 */
@Injectable()
export class WebSocketConfigService {
  // Connection Limits
  get maxConnectionsPerUser(): number {
    return MasterConfig.WS_MAX_CONNECTIONS_PER_USER;
  }

  get maxGlobalConnections(): number {
    return MasterConfig.WS_MAX_GLOBAL_CONNECTIONS;
  }

  get maxRoomsPerUser(): number {
    return MasterConfig.WS_MAX_ROOMS_PER_USER;
  }

  // Rate Limiting
  get rateLimitEventsPerMinute(): number {
    return MasterConfig.WS_RATE_LIMIT_EVENTS_PER_MINUTE;
  }

  get rateLimitWindowMs(): number {
    return MasterConfig.WS_RATE_LIMIT_WINDOW_MS;
  }

  // Ping/Pong
  get pingIntervalMs(): number {
    return MasterConfig.WS_PING_INTERVAL_MS;
  }

  get pingTimeoutMs(): number {
    return MasterConfig.WS_PING_TIMEOUT_MS;
  }

  get heartbeatIntervalMs(): number {
    return MasterConfig.WS_HEARTBEAT_INTERVAL_MS;
  }

  // Reconnection
  get reconnectAttempts(): number {
    return MasterConfig.WS_RECONNECT_ATTEMPTS;
  }

  get reconnectDelayMs(): number {
    return MasterConfig.WS_RECONNECT_DELAY_MS;
  }

  // Message Limits
  get messageMaxSize(): number {
    return MasterConfig.WS_MESSAGE_MAX_SIZE;
  }

  get enableCompression(): boolean {
    return MasterConfig.WS_ENABLE_COMPRESSION;
  }

  // Realtime Gateway
  get namespace(): string {
    return MasterConfig.REALTIME_NAMESPACE;
  }

  get maxHttpBufferSize(): number {
    return MasterConfig.REALTIME_MAX_HTTP_BUFFER_SIZE;
  }

  get realtimePingTimeoutMs(): number {
    return MasterConfig.REALTIME_PING_TIMEOUT_MS;
  }

  get realtimePingIntervalMs(): number {
    return MasterConfig.REALTIME_PING_INTERVAL_MS;
  }

  /**
   * Get Socket.IO server options
   */
  getSocketIoOptions(): Record<string, unknown> {
    return {
      maxHttpBufferSize: this.maxHttpBufferSize,
      pingTimeout: this.realtimePingTimeoutMs,
      pingInterval: this.realtimePingIntervalMs,
      cors: MasterConfig.REALTIME_CORS_ORIGIN,
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
    };
  }

  /**
   * Get connection limits
   */
  getConnectionLimits(): Record<string, number> {
    return {
      perUser: this.maxConnectionsPerUser,
      global: this.maxGlobalConnections,
      roomsPerUser: this.maxRoomsPerUser,
    };
  }

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig(): Record<string, number> {
    return {
      eventsPerMinute: this.rateLimitEventsPerMinute,
      windowMs: this.rateLimitWindowMs,
    };
  }

  /**
   * Get reconnection configuration
   */
  getReconnectConfig(): Record<string, number> {
    return {
      attempts: this.reconnectAttempts,
      delayMs: this.reconnectDelayMs,
    };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      connections: this.getConnectionLimits(),
      rateLimit: this.getRateLimitConfig(),
      ping: {
        intervalMs: this.pingIntervalMs,
        timeoutMs: this.pingTimeoutMs,
        heartbeatMs: this.heartbeatIntervalMs,
      },
      reconnect: this.getReconnectConfig(),
      message: {
        maxSize: this.messageMaxSize,
        compression: this.enableCompression,
      },
      namespace: this.namespace,
    };
  }
}
