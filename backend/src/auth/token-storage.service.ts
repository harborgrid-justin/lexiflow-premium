import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Refresh Token Data Interface
 */
export interface RefreshTokenData {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Reset Token Data Interface
 */
export interface ResetTokenData {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * MFA Token Data Interface
 */
export interface MfaTokenData {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Token Storage Service
 * Provides Redis-based token storage with automatic fallback to in-memory storage
 * when Redis is unavailable or disabled.
 *
 * Features:
 * - Automatic Redis connection with fallback
 * - TTL-based expiration for all token types
 * - User-level token management (delete all user tokens)
 * - Graceful degradation to in-memory storage
 *
 * @example
 * // Store refresh token
 * await tokenStorage.storeRefreshToken('token-id', {
 *   userId: 'user-123',
 *   token: 'jwt-token',
 *   createdAt: new Date().toISOString(),
 *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
 * }, 604800);
 */
/**
 * ╔=================================================================================================================╗
 * ║TOKENSTORAGE                                                                                                     ║
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
export class TokenStorageService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenStorageService.name);
  private redisClient: RedisClientType | null = null;
  private isRedisConnected = false;

  // In-memory fallback storage
  private refreshTokens: Map<string, RefreshTokenData> = new Map();
  private resetTokens: Map<string, ResetTokenData> = new Map();
  private mfaTokens: Map<string, MfaTokenData> = new Map();
  private userRefreshTokens: Map<string, Set<string>> = new Map();

  // Cleanup interval for in-memory storage
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {
    this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const redisEnabled = this.configService.get('REDIS_ENABLED', 'true') === 'true';

    if (!redisEnabled) {
      this.logger.log('Redis disabled - using in-memory token storage');
      return;
    }

    try {
      const redisUrl = this.configService.get<string>('redis.url');
      const redisHost = this.configService.get<string>('redis.host') ?? 'localhost';
      const redisPort = this.configService.get<number>('redis.port') ?? 6379;
      const redisPassword = this.configService.get<string>('redis.password');
      const redisUsername = this.configService.get<string>('redis.username') ?? 'default';

      // Use URL if provided (for cloud Redis), otherwise use host/port
      this.redisClient = redisUrl
        ? createClient({ url: redisUrl })
        : createClient({
            socket: {
              host: redisHost,
              port: redisPort,
            },
            username: redisUsername,
            password: redisPassword,
          }) as RedisClientType;

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis connection error:', err);
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected successfully');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.redisClient = null;
      this.isRedisConnected = false;
    }
  }

  /**
   * Start cleanup interval for in-memory storage
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60000); // Run every minute
  }

  /**
   * Cleanup expired tokens from in-memory storage
   */
  private cleanupExpiredTokens(): void {
    if (this.useRedis()) return;

    const now = new Date();
    let cleanedCount = 0;

    // Clean refresh tokens
    for (const [tokenId, data] of this.refreshTokens.entries()) {
      if (new Date(data.expiresAt) < now) {
        this.refreshTokens.delete(tokenId);
        cleanedCount++;
      }
    }

    // Clean reset tokens
    for (const [token, data] of this.resetTokens.entries()) {
      if (new Date(data.expiresAt) < now) {
        this.resetTokens.delete(token);
        cleanedCount++;
      }
    }

    // Clean MFA tokens
    for (const [token, data] of this.mfaTokens.entries()) {
      if (new Date(data.expiresAt) < now) {
        this.mfaTokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned ${cleanedCount} expired tokens from in-memory storage`);
    }
  }

  /**
   * Check if Redis should be used
   */
  private useRedis(): boolean {
    return this.isRedisConnected && this.redisClient !== null;
  }

  /**
   * Get Redis client with proper type narrowing
   * Returns the Redis client only if connected, otherwise null
   */
  private getRedisClient(): RedisClientType | null {
    if (this.isRedisConnected && this.redisClient !== null) {
      return this.redisClient;
    }
    return null;
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(
    tokenId: string,
    data: RefreshTokenData,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `auth:refresh:${tokenId}`;
    const userKey = `auth:refresh:user:${data.userId}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        await redisClient.sAdd(userKey, tokenId);
        await redisClient.expire(userKey, ttlSeconds);
        this.logger.debug(`Stored refresh token in Redis: ${tokenId}`);
      } catch (error) {
        this.logger.error('Failed to store refresh token in Redis:', error);
        this.fallbackStoreRefreshToken(tokenId, data);
      }
    } else {
      this.fallbackStoreRefreshToken(tokenId, data);
    }
  }

  private fallbackStoreRefreshToken(tokenId: string, data: RefreshTokenData): void {
    this.refreshTokens.set(tokenId, data);

    if (!this.userRefreshTokens.has(data.userId)) {
      this.userRefreshTokens.set(data.userId, new Set());
    }
    const userTokens = this.userRefreshTokens.get(data.userId);
    if (userTokens) {
      userTokens.add(tokenId);
    }

    this.logger.debug(`Stored refresh token in memory: ${tokenId}`);
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(tokenId: string): Promise<RefreshTokenData | null> {
    const key = `auth:refresh:${tokenId}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        const data = await redisClient.get(key);
        return data && typeof data === 'string' ? (JSON.parse(data) as RefreshTokenData) : null;
      } catch (error) {
        this.logger.error('Failed to get refresh token from Redis:', error);
        return this.fallbackGetRefreshToken(tokenId);
      }
    } else {
      return this.fallbackGetRefreshToken(tokenId);
    }
  }

  private fallbackGetRefreshToken(tokenId: string): RefreshTokenData | null {
    const data = this.refreshTokens.get(tokenId);

    if (!data) return null;

    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      this.refreshTokens.delete(tokenId);
      return null;
    }

    return data;
  }

  /**
   * Delete refresh token
   */
  async deleteRefreshToken(tokenId: string): Promise<void> {
    const key = `auth:refresh:${tokenId}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        // Get token data to find userId
        const data = await this.getRefreshToken(tokenId);
        if (data) {
          const userKey = `auth:refresh:user:${data.userId}`;
          await redisClient.sRem(userKey, tokenId);
        }
        await redisClient.del(key);
        this.logger.debug(`Deleted refresh token from Redis: ${tokenId}`);
      } catch (error) {
        this.logger.error('Failed to delete refresh token from Redis:', error);
        this.fallbackDeleteRefreshToken(tokenId);
      }
    } else {
      this.fallbackDeleteRefreshToken(tokenId);
    }
  }

  private fallbackDeleteRefreshToken(tokenId: string): void {
    const data = this.refreshTokens.get(tokenId);
    if (data) {
      const userTokens = this.userRefreshTokens.get(data.userId);
      if (userTokens) {
        userTokens.delete(tokenId);
      }
    }
    this.refreshTokens.delete(tokenId);
    this.logger.debug(`Deleted refresh token from memory: ${tokenId}`);
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const userKey = `auth:refresh:user:${userId}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        const tokenIds = await redisClient.sMembers(userKey);

        if (tokenIds.length > 0) {
          const keys = tokenIds.map((id: string) => `auth:refresh:${id}`);
          await redisClient.del(keys);
          await redisClient.del(userKey);
          this.logger.debug(`Deleted ${tokenIds.length} refresh tokens for user ${userId} from Redis`);
        }
      } catch (error) {
        this.logger.error('Failed to delete user refresh tokens from Redis:', error);
        this.fallbackDeleteUserRefreshTokens(userId);
      }
    } else {
      this.fallbackDeleteUserRefreshTokens(userId);
    }
  }

  private fallbackDeleteUserRefreshTokens(userId: string): void {
    const tokenIds = this.userRefreshTokens.get(userId);

    if (tokenIds) {
      for (const tokenId of tokenIds) {
        this.refreshTokens.delete(tokenId);
      }
      this.userRefreshTokens.delete(userId);
      this.logger.debug(`Deleted ${tokenIds.size} refresh tokens for user ${userId} from memory`);
    }
  }

  /**
   * Store reset token
   */
  async storeResetToken(
    token: string,
    data: ResetTokenData,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `auth:reset:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        this.logger.debug(`Stored reset token in Redis: ${token.substring(0, 10)}...`);
      } catch (error) {
        this.logger.error('Failed to store reset token in Redis:', error);
        this.fallbackStoreResetToken(token, data);
      }
    } else {
      this.fallbackStoreResetToken(token, data);
    }
  }

  private fallbackStoreResetToken(token: string, data: ResetTokenData): void {
    this.resetTokens.set(token, data);
    this.logger.debug(`Stored reset token in memory: ${token.substring(0, 10)}...`);
  }

  /**
   * Get reset token
   */
  async getResetToken(token: string): Promise<ResetTokenData | null> {
    const key = `auth:reset:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        const data = await redisClient.get(key);
        return data && typeof data === 'string' ? (JSON.parse(data) as ResetTokenData) : null;
      } catch (error) {
        this.logger.error('Failed to get reset token from Redis:', error);
        return this.fallbackGetResetToken(token);
      }
    } else {
      return this.fallbackGetResetToken(token);
    }
  }

  private fallbackGetResetToken(token: string): ResetTokenData | null {
    const data = this.resetTokens.get(token);

    if (!data) return null;

    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      this.resetTokens.delete(token);
      return null;
    }

    return data;
  }

  /**
   * Delete reset token
   */
  async deleteResetToken(token: string): Promise<void> {
    const key = `auth:reset:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.del(key);
        this.logger.debug(`Deleted reset token from Redis: ${token.substring(0, 10)}...`);
      } catch (error) {
        this.logger.error('Failed to delete reset token from Redis:', error);
        this.fallbackDeleteResetToken(token);
      }
    } else {
      this.fallbackDeleteResetToken(token);
    }
  }

  private fallbackDeleteResetToken(token: string): void {
    this.resetTokens.delete(token);
    this.logger.debug(`Deleted reset token from memory: ${token.substring(0, 10)}...`);
  }

  /**
   * Store MFA token
   */
  async storeMfaToken(
    token: string,
    data: MfaTokenData,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `auth:mfa:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        this.logger.debug(`Stored MFA token in Redis: ${token.substring(0, 10)}...`);
      } catch (error) {
        this.logger.error('Failed to store MFA token in Redis:', error);
        this.fallbackStoreMfaToken(token, data);
      }
    } else {
      this.fallbackStoreMfaToken(token, data);
    }
  }

  private fallbackStoreMfaToken(token: string, data: MfaTokenData): void {
    this.mfaTokens.set(token, data);
    this.logger.debug(`Stored MFA token in memory: ${token.substring(0, 10)}...`);
  }

  /**
   * Get MFA token
   */
  async getMfaToken(token: string): Promise<MfaTokenData | null> {
    const key = `auth:mfa:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        const data = await redisClient.get(key);
        return data && typeof data === 'string' ? (JSON.parse(data) as MfaTokenData) : null;
      } catch (error) {
        this.logger.error('Failed to get MFA token from Redis:', error);
        return this.fallbackGetMfaToken(token);
      }
    } else {
      return this.fallbackGetMfaToken(token);
    }
  }

  private fallbackGetMfaToken(token: string): MfaTokenData | null {
    const data = this.mfaTokens.get(token);

    if (!data) return null;

    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      this.mfaTokens.delete(token);
      return null;
    }

    return data;
  }

  /**
   * Delete MFA token
   */
  async deleteMfaToken(token: string): Promise<void> {
    const key = `auth:mfa:${token}`;

    const redisClient = this.getRedisClient();
    if (redisClient) {
      try {
        await redisClient.del(key);
        this.logger.debug(`Deleted MFA token from Redis: ${token.substring(0, 10)}...`);
      } catch (error) {
        this.logger.error('Failed to delete MFA token from Redis:', error);
        this.fallbackDeleteMfaToken(token);
      }
    } else {
      this.fallbackDeleteMfaToken(token);
    }
  }

  private fallbackDeleteMfaToken(token: string): void {
    this.mfaTokens.delete(token);
    this.logger.debug(`Deleted MFA token from memory: ${token.substring(0, 10)}...`);
  }

  /**
   * Get storage statistics
   */
  getStats(): TokenStorageStats {
    if (this.useRedis()) {
      return {
        type: 'redis',
        connected: this.isRedisConnected,
      };
    } else {
      return {
        type: 'memory',
        connected: false,
        refreshTokenCount: this.refreshTokens.size,
        resetTokenCount: this.resetTokens.size,
        mfaTokenCount: this.mfaTokens.size,
      };
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }
}

export interface TokenStorageStats {
  type: 'redis' | 'memory';
  connected: boolean;
  refreshTokenCount?: number;
  resetTokenCount?: number;
  mfaTokenCount?: number;
}
