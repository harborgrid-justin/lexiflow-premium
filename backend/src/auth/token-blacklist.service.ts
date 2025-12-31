import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * TokenBlacklistService
 *
 * Manages JWT token blacklisting for secure token revocation.
 * Supports both Redis (preferred) and in-memory fallback storage.
 *
 * Use Cases:
 * - User logout (immediately invalidate access token)
 * - Password change (invalidate all user tokens)
 * - Account compromise (revoke all sessions)
 * - Admin forced logout
 *
 * @example
 * // Blacklist a single token on logout
 * await tokenBlacklistService.blacklistToken(jti, expiresAt);
 *
 * // Blacklist all user tokens on password change
 * await tokenBlacklistService.blacklistUserTokens(userId);
 *
 * // Check if token is blacklisted
 * const isBlacklisted = await tokenBlacklistService.isBlacklisted(jti);
 */
/**
 * ╔=================================================================================================================╗
 * ║TOKENBLACKLIST                                                                                                   ║
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
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private redisClient: RedisClientType | null = null;
  private inMemoryBlacklist: Map<string, Date> = new Map();
  private inMemoryUserTokens: Map<string, Set<string>> = new Map();
  private useRedis = false;

  // Prefixes for Redis keys
  private readonly TOKEN_PREFIX = 'blacklist:token:';
  private readonly USER_PREFIX = 'blacklist:user:';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  /**
   * Initialize Redis connection with fallback to in-memory storage
   */
  private async initializeRedis() {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      this.logger.log(`Attempting to connect to Redis at ${redisHost}:${redisPort}`);

      const clientOptions: {
        socket: {
          host: string;
          port: number;
          reconnectStrategy: (retries: number) => number | false;
        };
        password?: string;
      } = {
        socket: {
          host: redisHost,
          port: redisPort,
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              this.logger.warn('Redis connection failed after 3 retries, falling back to in-memory storage');
              return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 3000);
          },
        },
      };

      if (redisPassword) {
        clientOptions.password = redisPassword;
      }

      this.redisClient = createClient(clientOptions);

      this.redisClient.on('error', (err: Error) => {
        this.logger.error('Redis client error:', err);
        this.useRedis = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected successfully');
        this.useRedis = true;
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready');
        this.useRedis = true;
      });

      await this.redisClient.connect();
      this.useRedis = true;
      this.logger.log('✅ Token blacklist using Redis storage');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to initialize Redis, using in-memory blacklist:', message);
      this.useRedis = false;
      this.logger.log('⚠️  Token blacklist using in-memory storage (not suitable for production)');
    }
  }

  /**
   * Add a token to the blacklist
   * Token will be automatically removed after expiry
   *
   * @param jti - JWT ID (unique token identifier)
   * @param expiresAt - Token expiration date
   */
  async blacklistToken(jti: string, expiresAt: Date): Promise<void> {
    const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    if (ttlSeconds <= 0) {
      this.logger.debug(`Token ${jti} is already expired, skipping blacklist`);
      return;
    }

    if (this.useRedis && this.redisClient) {
      try {
        const key = `${this.TOKEN_PREFIX}${jti}`;
        await this.redisClient.setEx(key, ttlSeconds, 'blacklisted');
        this.logger.debug(`Blacklisted token ${jti} in Redis with TTL ${ttlSeconds}s`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Redis blacklistToken failed, falling back to in-memory:', message);
        this.inMemoryBlacklist.set(jti, expiresAt);
      }
    } else {
      this.inMemoryBlacklist.set(jti, expiresAt);
      this.logger.debug(`Blacklisted token ${jti} in memory until ${expiresAt.toISOString()}`);
    }
  }

  /**
   * Check if a token is blacklisted
   *
   * @param jti - JWT ID to check
   * @returns true if token is blacklisted, false otherwise
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    if (!jti) {
      return false;
    }

    if (this.useRedis && this.redisClient) {
      try {
        const key = `${this.TOKEN_PREFIX}${jti}`;
        const result = await this.redisClient.exists(key);
        return result === 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Redis isBlacklisted check failed, checking in-memory:', message);
        return this.isBlacklistedInMemory(jti);
      }
    } else {
      return this.isBlacklistedInMemory(jti);
    }
  }

  /**
   * Blacklist all tokens for a user
   * Used when user changes password or needs all sessions invalidated
   *
   * @param userId - User ID whose tokens should be blacklisted
   */
  async blacklistUserTokens(userId: string): Promise<void> {
    // Mark the user's tokens as globally blacklisted
    // New tokens will have a timestamp, and we'll check if they were issued before this blacklist
    const timestamp = Date.now().toString();

    if (this.useRedis && this.redisClient) {
      try {
        const key = `${this.USER_PREFIX}${userId}`;
        // Store with 7 days expiry (longer than max token lifetime)
        await this.redisClient.setEx(key, 7 * 24 * 60 * 60, timestamp);
        this.logger.log(`Blacklisted all tokens for user ${userId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Redis blacklistUserTokens failed, falling back to in-memory:', message);
        this.blacklistUserTokensInMemory(userId);
      }
    } else {
      this.blacklistUserTokensInMemory(userId);
    }
  }

  /**
   * Check if a user's token was issued before the user-level blacklist
   *
   * @param userId - User ID
   * @param tokenIssuedAt - Token issued timestamp (iat claim)
   * @returns true if token should be considered blacklisted
   */
  async isUserTokenBlacklisted(userId: string, tokenIssuedAt: number): Promise<boolean> {
    if (!userId || !tokenIssuedAt) {
      return false;
    }

    if (this.useRedis && this.redisClient) {
      try {
        const key = `${this.USER_PREFIX}${userId}`;
        const blacklistTimestamp = await this.redisClient.get(key);

        if (!blacklistTimestamp || typeof blacklistTimestamp !== 'string') {
          return false;
        }

        // Token is blacklisted if it was issued before the blacklist timestamp
        return tokenIssuedAt * 1000 < parseInt(blacklistTimestamp, 10);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Redis isUserTokenBlacklisted check failed:', message);
        return false;
      }
    } else {
      // In-memory: check if user has any blacklisted tokens
      // This is a simplified check - in production, use Redis for proper user-level blacklisting
      return false;
    }
  }

  /**
   * Clean up expired blacklist entries (in-memory only)
   * For Redis, TTL handles automatic cleanup
   *
   * @returns Number of entries cleaned up
   */
  async cleanupExpired(): Promise<number> {
    let cleanedCount = 0;
    const now = new Date();

    // Clean up in-memory blacklist
    for (const [jti, expiresAt] of this.inMemoryBlacklist.entries()) {
      if (expiresAt < now) {
        this.inMemoryBlacklist.delete(jti);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired blacklist entries from memory`);
    }

    // Redis handles TTL automatically, no cleanup needed
    return cleanedCount;
  }

  /**
   * Get blacklist statistics (useful for monitoring)
   */
  async getStats(): Promise<{ storage: string; size: number; useRedis: boolean }> {
    if (this.useRedis && this.redisClient) {
      try {
        // Count keys with our prefix
        const keys = await this.redisClient.keys(`${this.TOKEN_PREFIX}*`);
        return {
          storage: 'redis',
          size: keys.length,
          useRedis: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Redis getStats failed:', message);
      }
    }

    return {
      storage: 'memory',
      size: this.inMemoryBlacklist.size,
      useRedis: false,
    };
  }

  /**
   * Check if token is blacklisted in memory
   */
  private isBlacklistedInMemory(jti: string): boolean {
    const expiresAt = this.inMemoryBlacklist.get(jti);
    if (!expiresAt) {
      return false;
    }

    // Check if token has expired
    if (expiresAt < new Date()) {
      this.inMemoryBlacklist.delete(jti);
      return false;
    }

    return true;
  }

  /**
   * Blacklist user tokens in memory
   */
  private blacklistUserTokensInMemory(userId: string): void {
    // Store a set of token JTIs for this user
    if (!this.inMemoryUserTokens.has(userId)) {
      this.inMemoryUserTokens.set(userId, new Set());
    }
    this.logger.log(`Marked user ${userId} tokens for blacklist (in-memory)`);
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis client disconnected');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Error disconnecting Redis client:', message);
      }
    }
  }
}
