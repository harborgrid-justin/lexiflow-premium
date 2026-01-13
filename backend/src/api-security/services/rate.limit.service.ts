import * as MasterConfig from "@config/master.config";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { createClient, RedisClientType } from "redis";

export enum UserRole {
  ADMIN = "admin",
  ENTERPRISE = "enterprise",
  PROFESSIONAL = "professional",
  BASIC = "basic",
  GUEST = "guest",
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  burstLimit?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * ╔=================================================================================================================╗
 * ║RATELIMIT                                                                                                        ║
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
export class RateLimitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private redisClient: RedisClientType | null = null;
  private fallbackStore = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Tiered rate limits by user role (requests per minute)
  private readonly roleLimits: Record<UserRole, RateLimitConfig> = {
    [UserRole.ADMIN]: { limit: 1000, windowMs: 60000, burstLimit: 150 },
    [UserRole.ENTERPRISE]: { limit: 500, windowMs: 60000, burstLimit: 75 },
    [UserRole.PROFESSIONAL]: { limit: 300, windowMs: 60000, burstLimit: 50 },
    [UserRole.BASIC]: { limit: 100, windowMs: 60000, burstLimit: 20 },
    [UserRole.GUEST]: { limit: 30, windowMs: 60000, burstLimit: 10 },
  };

  // Endpoint-specific rate limits (requests per minute)
  private readonly endpointLimits: Record<string, RateLimitConfig> = {
    "/api/v1/auth/login": { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
    "/api/v1/auth/register": { limit: 3, windowMs: 3600000 }, // 3 per hour
    "/api/v1/auth/forgot-password": { limit: 3, windowMs: 3600000 }, // 3 per hour
    "/api/v1/auth/reset-password": { limit: 5, windowMs: 3600000 }, // 5 per hour
    "/api/v1/documents/upload": { limit: 20, windowMs: 60000 }, // 20 per minute
    "/api/v1/documents/*/download": { limit: 50, windowMs: 60000 }, // 50 per minute
    "/api/v1/search": { limit: 60, windowMs: 60000 }, // 60 per minute
    "/api/v1/webhooks/trigger": { limit: 100, windowMs: 60000 }, // 100 per minute
    "/api/v1/api-keys": { limit: 10, windowMs: 60000 }, // 10 per minute
    "/api/v1/users/*/delete": { limit: 5, windowMs: 60000 }, // 5 per minute
    "/api/v1/documents/*/delete": { limit: 10, windowMs: 60000 }, // 10 per minute
    "/api/v1/bulk/*": { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
  };

  // IP-based rate limits (requests per minute)
  private readonly ipLimits: RateLimitConfig = {
    limit: 200,
    windowMs: 60000,
    burstLimit: 50,
  };

  async onModuleInit() {
    if (MasterConfig.REDIS_ENABLED) {
      try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        this.redisClient = createClient({
          url: redisUrl,
          socket: {
            connectTimeout: MasterConfig.REDIS_CONNECT_TIMEOUT,
            reconnectStrategy: (retries: number) => {
              if (retries > MasterConfig.REDIS_MAX_RETRIES_PER_REQUEST) {
                this.logger.error("Max Redis reconnection attempts reached");
                return new Error("Max retries reached");
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        this.redisClient.on("error", (err: any) => {
          this.logger.error("Redis Client Error", err);
        });

        this.redisClient.on("connect", () => {
          this.logger.log("Redis client connected successfully");
        });

        await this.redisClient.connect();
      } catch (error) {
        this.logger.error(
          "Failed to connect to Redis, falling back to in-memory store",
          error
        );
        this.redisClient = null;
      }
    } else {
      this.logger.warn("Redis is disabled, using in-memory rate limiting");
    }

    // Cleanup fallback store every 5 minutes
    this.cleanupInterval = setInterval(
      () => this.cleanupFallbackStore(),
      300000
    );
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupFallbackStore() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, data] of this.fallbackStore.entries()) {
      if (data.resetAt < now) {
        this.fallbackStore.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(
        `Cleaned up ${removedCount} expired rate limit entries from fallback store`
      );
    }
  }

  async checkRateLimit(
    identifier: string,
    type: "user" | "ip" | "endpoint" | "role",
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `${MasterConfig.REDIS_KEY_PREFIX}ratelimit:${type}:${identifier}`;
    const limitConfig = config || this.getDefaultConfig(type);
    const now = Date.now();
    const windowStart = now - limitConfig.windowMs;

    if (this.redisClient) {
      return this.checkRateLimitRedis(key, limitConfig, now, windowStart);
    } else {
      return this.checkRateLimitFallback(key, limitConfig, now);
    }
  }

  async checkRoleBased(
    userId: string,
    role: UserRole
  ): Promise<RateLimitResult> {
    const config = this.roleLimits[role] || this.roleLimits[UserRole.BASIC];
    return this.checkRateLimit(userId, "role", config);
  }

  async checkEndpointLimit(
    endpoint: string,
    userId: string
  ): Promise<RateLimitResult> {
    const config = this.getEndpointConfig(endpoint);
    const identifier = `${endpoint}:${userId}`;
    return this.checkRateLimit(identifier, "endpoint", config);
  }

  async checkIpLimit(ip: string): Promise<RateLimitResult> {
    return this.checkRateLimit(ip, "ip", this.ipLimits);
  }

  async checkBurst(
    identifier: string,
    role: UserRole
  ): Promise<RateLimitResult> {
    const config = this.roleLimits[role];
    const burstLimit = config.burstLimit || config.limit;

    const burstConfig: RateLimitConfig = {
      limit: burstLimit,
      windowMs: 10000, // 10 second window for burst
    };

    const key = `${identifier}:burst`;
    return this.checkRateLimit(key, "user", burstConfig);
  }

  private async checkRateLimitRedis(
    key: string,
    config: RateLimitConfig,
    now: number,
    windowStart: number
  ): Promise<RateLimitResult> {
    try {
      if (!this.redisClient) {
        return this.checkRateLimitFallback(key, config, now);
      }

      const multi = this.redisClient.multi();

      // Remove old entries (sliding window)
      multi.zRemRangeByScore(key, 0, windowStart);

      // Count requests in current window
      multi.zCard(key);

      // Add current request
      multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

      // Set expiration
      multi.expire(key, Math.ceil(config.windowMs / 1000));

      const results = await multi.exec();
      const count = (results[1] as unknown as number) || 0;

      const allowed = count < config.limit;
      const remaining = Math.max(0, config.limit - count - 1);
      const resetAt = new Date(now + config.windowMs);
      const retryAfter = allowed
        ? undefined
        : Math.ceil(config.windowMs / 1000);

      return {
        allowed,
        limit: config.limit,
        remaining,
        resetAt,
        retryAfter,
      };
    } catch (error) {
      this.logger.error(
        "Redis rate limit check failed, falling back to in-memory",
        error
      );
      return this.checkRateLimitFallback(key, config, now);
    }
  }

  private checkRateLimitFallback(
    key: string,
    config: RateLimitConfig,
    now: number
  ): RateLimitResult {
    const data = this.fallbackStore.get(key);
    const resetAt = now + config.windowMs;

    if (!data || data.resetAt < now) {
      // New window
      this.fallbackStore.set(key, { count: 1, resetAt });

      return {
        allowed: true,
        limit: config.limit,
        remaining: config.limit - 1,
        resetAt: new Date(resetAt),
      };
    }

    const allowed = data.count < config.limit;

    if (allowed) {
      data.count++;
      this.fallbackStore.set(key, data);
    }

    return {
      allowed,
      limit: config.limit,
      remaining: Math.max(0, config.limit - data.count),
      resetAt: new Date(data.resetAt),
      retryAfter: allowed ? undefined : Math.ceil((data.resetAt - now) / 1000),
    };
  }

  private getDefaultConfig(type: string): RateLimitConfig {
    switch (type) {
      case "ip":
        return this.ipLimits;
      case "role":
      case "user":
        return this.roleLimits[UserRole.BASIC];
      default:
        return { limit: 100, windowMs: 60000 };
    }
  }

  private getEndpointConfig(endpoint: string): RateLimitConfig {
    // Try exact match first
    if (this.endpointLimits[endpoint]) {
      return this.endpointLimits[endpoint];
    }

    // Try pattern matching
    for (const [pattern, config] of Object.entries(this.endpointLimits)) {
      if (pattern.includes("*")) {
        const regex = new RegExp("^" + pattern.replace(/\*/g, "[^/]+") + "$");
        if (regex.test(endpoint)) {
          return config;
        }
      }
    }

    // Default endpoint limit
    return { limit: 100, windowMs: 60000 };
  }

  async resetRateLimit(
    identifier: string,
    type: "user" | "ip" | "endpoint" | "role"
  ): Promise<void> {
    const key = `${MasterConfig.REDIS_KEY_PREFIX}ratelimit:${type}:${identifier}`;

    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
        this.logger.log(`Reset rate limit for ${type}:${identifier}`);
      } catch (error) {
        this.logger.error(
          `Failed to reset rate limit in Redis for ${type}:${identifier}`,
          error
        );
      }
    } else {
      this.fallbackStore.delete(key);
      this.logger.log(
        `Reset rate limit for ${type}:${identifier} in fallback store`
      );
    }
  }

  async getRateLimitInfo(
    identifier: string,
    type: "user" | "ip" | "endpoint" | "role"
  ): Promise<{ count: number; limit: number; resetAt: Date }> {
    const key = `${MasterConfig.REDIS_KEY_PREFIX}ratelimit:${type}:${identifier}`;
    const config = this.getDefaultConfig(type);
    const now = Date.now();

    if (this.redisClient) {
      try {
        const windowStart = now - config.windowMs;
        await this.redisClient.zRemRangeByScore(key, 0, windowStart);
        const count = await this.redisClient.zCard(key);

        return {
          count,
          limit: config.limit,
          resetAt: new Date(now + config.windowMs),
        };
      } catch (error) {
        this.logger.error("Failed to get rate limit info from Redis", error);
      }
    }

    const data = this.fallbackStore.get(key);
    if (!data || data.resetAt < now) {
      return {
        count: 0,
        limit: config.limit,
        resetAt: new Date(now + config.windowMs),
      };
    }

    return {
      count: data.count,
      limit: config.limit,
      resetAt: new Date(data.resetAt),
    };
  }

  setEndpointLimit(endpoint: string, config: RateLimitConfig): void {
    this.endpointLimits[endpoint] = config;
    this.logger.log(
      `Set custom rate limit for endpoint ${endpoint}: ${config.limit} requests per ${config.windowMs}ms`
    );
  }

  setRoleLimit(role: UserRole, config: RateLimitConfig): void {
    this.roleLimits[role] = config;
    this.logger.log(
      `Set custom rate limit for role ${role}: ${config.limit} requests per ${config.windowMs}ms`
    );
  }
}
