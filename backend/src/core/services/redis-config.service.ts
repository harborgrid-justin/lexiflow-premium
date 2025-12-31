import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from '@config/master.config';

/**
 * RedisConfigService
 *
 * Provides globally injectable access to Redis configuration.
 * Consolidates connection settings, TTL values, and key prefixes.
 */
/**
 * ╔=================================================================================================================╗
 * ║REDISCONFIG                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class RedisConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Connection Settings
  get enabled(): boolean {
    return MasterConfig.REDIS_ENABLED;
  }

  get host(): string {
    return this.configService.get<string>('app.redis.host') || 'localhost';
  }

  get port(): number {
    return this.configService.get<number>('app.redis.port') || 6379;
  }

  get password(): string | undefined {
    return this.configService.get<string>('app.redis.password');
  }

  get username(): string | undefined {
    return this.configService.get<string>('app.redis.username');
  }

  get url(): string | undefined {
    return this.configService.get<string>('app.redis.url');
  }

  // Connection Options
  get maxRetriesPerRequest(): number {
    return MasterConfig.REDIS_MAX_RETRIES_PER_REQUEST;
  }

  get enableReadyCheck(): boolean {
    return MasterConfig.REDIS_ENABLE_READY_CHECK;
  }

  get enableOfflineQueue(): boolean {
    return MasterConfig.REDIS_ENABLE_OFFLINE_QUEUE;
  }

  get connectTimeout(): number {
    return MasterConfig.REDIS_CONNECT_TIMEOUT;
  }

  get commandTimeout(): number {
    return MasterConfig.REDIS_COMMAND_TIMEOUT;
  }

  get keepAlive(): number {
    return MasterConfig.REDIS_KEEP_ALIVE;
  }

  // Key Prefix
  get keyPrefix(): string {
    return MasterConfig.REDIS_KEY_PREFIX;
  }

  // TTL Values
  get sessionTtl(): number {
    return MasterConfig.REDIS_SESSION_TTL;
  }

  get cacheTtl(): number {
    return MasterConfig.REDIS_CACHE_TTL;
  }

  get rateLimitTtl(): number {
    return MasterConfig.REDIS_RATE_LIMIT_TTL;
  }

  /**
   * Get connection options for ioredis
   */
  getConnectionOptions(): Record<string, unknown> {
    if (this.url) {
      return { url: this.url };
    }

    return {
      host: this.host,
      port: this.port,
      password: this.password,
      username: this.username,
      maxRetriesPerRequest: this.maxRetriesPerRequest,
      enableReadyCheck: this.enableReadyCheck,
      enableOfflineQueue: this.enableOfflineQueue,
      connectTimeout: this.connectTimeout,
      commandTimeout: this.commandTimeout,
      keepAlive: this.keepAlive,
      keyPrefix: this.keyPrefix,
    };
  }

  /**
   * Build a namespaced key
   */
  buildKey(...parts: string[]): string {
    return `${this.keyPrefix}${parts.join(':')}`;
  }

  /**
   * Get TTL for a specific namespace
   */
  getTtl(namespace: string): number {
    const ttlMap: Record<string, number> = {
      session: this.sessionTtl,
      cache: this.cacheTtl,
      rateLimit: this.rateLimitTtl,
    };
    return ttlMap[namespace] || this.cacheTtl;
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      enabled: this.enabled,
      connection: this.url ? { url: '***' } : { host: this.host, port: this.port },
      options: {
        maxRetries: this.maxRetriesPerRequest,
        connectTimeout: this.connectTimeout,
        commandTimeout: this.commandTimeout,
      },
      ttl: {
        session: this.sessionTtl,
        cache: this.cacheTtl,
        rateLimit: this.rateLimitTtl,
      },
      keyPrefix: this.keyPrefix,
    };
  }
}
