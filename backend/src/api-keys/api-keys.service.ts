import { Injectable, NotFoundException, UnauthorizedException, OnModuleDestroy, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as MasterConfig from '@config/master.config';
import { CreateApiKeyDto, UpdateApiKeyDto, ApiKeyScope } from './dto';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  keyPrefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date;
  rateLimit: number;
  lastUsedAt?: Date;
  requestCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  key: string;
}

export interface ApiKeyUsageStats {
  id: string;
  name: string;
  totalRequests: number;
  lastUsed?: Date;
  lastUsedAt?: Date;
  currentHourRequests: number;
  rateLimit: number;
  rateLimitResetAt?: Date;
}

@Injectable()
export class ApiKeysService implements OnModuleDestroy {
  private readonly logger = new Logger(ApiKeysService.name);
  private readonly apiKeys = new Map<string, ApiKey>();
  private readonly requestCounts = new Map<string, { count: number; resetAt: Date }>();
  private readonly defaultRateLimit = MasterConfig.API_KEY_DEFAULT_RATE_LIMIT;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired rate limit counters every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanup() {
    const now = new Date();
    let removedCount = 0;
    for (const [key, data] of this.requestCounts.entries()) {
      if (data.resetAt < now) {
        this.requestCounts.delete(key);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} expired rate limit counters`);
    }
  }

  /**
   * Create a new API key
   */
  async create(createApiKeyDto: CreateApiKeyDto, userId: string): Promise<ApiKeyWithSecret> {
    // Generate API key
    const apiKey = 'sk_' + this.generateApiKey();
    const keyHash = await bcrypt.hash(apiKey, MasterConfig.BCRYPT_ROUNDS);
    const keyPrefix = apiKey.substring(0, 8);

    const apiKeyEntity: ApiKey = {
      id: this.generateId(),
      name: createApiKeyDto.name,
      description: createApiKeyDto.description,
      keyPrefix,
      keyHash,
      scopes: createApiKeyDto.scopes,
      expiresAt: createApiKeyDto.expiresAt,
      rateLimit: createApiKeyDto.rateLimit || this.defaultRateLimit,
      requestCount: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    };

    this.apiKeys.set(apiKeyEntity.id, apiKeyEntity);

    // Return with plain API key (only shown once)
    return {
      ...apiKeyEntity,
      key: apiKey,
    };
  }

  /**
   * Find all API keys for a user
   */
  async findAll(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(k => k.userId === userId);
  }

  /**
   * Find one API key by ID
   */
  async findOne(id: string, userId: string): Promise<ApiKey> {
    const apiKey = this.apiKeys.get(id);

    if (!apiKey) {
      throw new NotFoundException(`API Key with ID ${id} not found`);
    }

    if (apiKey.userId !== userId) {
      throw new NotFoundException(`API Key with ID ${id} not found`);
    }

    return apiKey;
  }

  /**
   * Update an API key
   */
  async update(id: string, updateApiKeyDto: UpdateApiKeyDto, userId: string): Promise<ApiKey> {
    const apiKey = await this.findOne(id, userId);

    const updated: ApiKey = {
      ...apiKey,
      name: updateApiKeyDto.name ?? apiKey.name,
      scopes: updateApiKeyDto.scopes ?? apiKey.scopes,
      expiresAt: updateApiKeyDto.expiresAt ?? apiKey.expiresAt,
      updatedAt: new Date(),
    };

    this.apiKeys.set(id, updated);

    return updated;
  }

  /**
   * Revoke (delete) an API key
   */
  async revoke(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    this.apiKeys.delete(id);
  }

  /**
   * Validate an API key
   */
  async validate(apiKey: string): Promise<ApiKey> {
    // Find API key by comparing hashes
    for (const key of this.apiKeys.values()) {
      if (!key.active) continue;

      try {
        const isMatch = await bcrypt.compare(apiKey, key.keyHash);
        if (isMatch) {
          // Check expiration
          if (key.expiresAt && key.expiresAt < new Date()) {
            throw new UnauthorizedException('API key has expired');
          }

          // Check rate limit
          await this.checkRateLimit(key);

          // Update last used timestamp
          key.lastUsedAt = new Date();
          key.requestCount = (key.requestCount || 0) + 1;
          this.apiKeys.set(key.id, key);

          return key;
        }
      } catch (error) {
        // Continue to next key if bcrypt comparison fails
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        continue;
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }

  /**
   * Check if API key has exceeded rate limit
   */
  private async checkRateLimit(apiKey: ApiKey): Promise<void> {
    const now = new Date();
    const hourFromNow = new Date(now.getTime() + 3600000);

    let rateData = this.requestCounts.get(apiKey.id);

    if (!rateData || rateData.resetAt < now) {
      // Reset rate limit counter
      rateData = {
        count: 0,
        resetAt: hourFromNow,
      };
    }

    if (rateData.count >= apiKey.rateLimit) {
      throw new UnauthorizedException(
        `Rate limit exceeded. Try again after ${rateData.resetAt.toISOString()}`,
      );
    }

    rateData.count += 1;
    this.requestCounts.set(apiKey.id, rateData);
  }

  /**
   * Get API key usage statistics
   */
  async getUsageStats(id: string, userId: string): Promise<ApiKeyUsageStats> {
    const apiKey = await this.findOne(id, userId);
    const rateData = this.requestCounts.get(id);

    return {
      id: apiKey.id,
      name: apiKey.name,
      totalRequests: apiKey.requestCount,
      lastUsed: apiKey.lastUsedAt,
      lastUsedAt: apiKey.lastUsedAt,
      currentHourRequests: rateData?.count || 0,
      rateLimit: apiKey.rateLimit,
      rateLimitResetAt: rateData?.resetAt,
    };
  }

  /**
   * Generate a random API key
   */
  private generateApiKey(): string {
    return `lx_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Get available API key scopes
   */
  async getAvailableScopes(): Promise<{ id: string; label: string; description: string }[]> {
    return [
      {
        id: ApiKeyScope.READ,
        label: 'Read',
        description: 'Read-only access to resources',
      },
      {
        id: ApiKeyScope.WRITE,
        label: 'Write',
        description: 'Create and update resources',
      },
      {
        id: ApiKeyScope.DELETE,
        label: 'Delete',
        description: 'Delete resources',
      },
      {
        id: ApiKeyScope.ADMIN,
        label: 'Admin',
        description: 'Full administrative access',
      },
    ];
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
