import { Injectable, NotFoundException, UnauthorizedException, OnModuleDestroy, Logger, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as MasterConfig from '../../config/master.config';
import { CreateApiKeyDto, UpdateApiKeyDto, ApiKeyScope, ApiKeyRotationPolicy } from '../../api-security/dto';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  keyPrefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  ipWhitelist?: string[];
  expiresAt?: Date;
  rateLimit: number;
  dailyQuota?: number;
  monthlyQuota?: number;
  lastUsedAt?: Date;
  requestCount: number;
  dailyRequestCount: number;
  monthlyRequestCount: number;
  active: boolean;
  rotationPolicy: ApiKeyRotationPolicy;
  rotationRemindersEnabled: boolean;
  rotationReminderDays: number;
  nextRotationReminderAt?: Date;
  lastRotatedAt?: Date;
  dailyQuotaResetAt: Date;
  monthlyQuotaResetAt: Date;
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
  lastUsedAt?: Date;
  currentHourRequests: number;
  todayRequests: number;
  monthRequests: number;
  rateLimit: number;
  dailyQuota?: number;
  monthlyQuota?: number;
  rateLimitResetAt?: Date;
  dailyQuotaResetAt?: Date;
  monthlyQuotaResetAt?: Date;
  rateLimitUsagePercentage: number;
  dailyQuotaUsagePercentage?: number;
  monthlyQuotaUsagePercentage?: number;
}

export interface ValidationOptions {
  requiredScopes?: ApiKeyScope[];
  clientIp?: string;
}

@Injectable()
export class ApiKeyService implements OnModuleDestroy {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly apiKeys = new Map<string, ApiKey>();
  private readonly requestCounts = new Map<string, { count: number; resetAt: Date }>();
  private readonly defaultRateLimit = MasterConfig.API_KEY_DEFAULT_RATE_LIMIT;
  private cleanupInterval: NodeJS.Timeout;
  private rotationCheckInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired rate limit counters every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000);

    // Check for rotation reminders every day
    this.rotationCheckInterval = setInterval(() => this.checkRotationReminders(), 86400000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.rotationCheckInterval) {
      clearInterval(this.rotationCheckInterval);
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

    // Reset daily and monthly quotas as needed
    for (const [id, apiKey] of this.apiKeys.entries()) {
      let updated = false;

      if (apiKey.dailyQuotaResetAt && apiKey.dailyQuotaResetAt < now) {
        apiKey.dailyRequestCount = 0;
        apiKey.dailyQuotaResetAt = this.getNextDayMidnight();
        updated = true;
      }

      if (apiKey.monthlyQuotaResetAt && apiKey.monthlyQuotaResetAt < now) {
        apiKey.monthlyRequestCount = 0;
        apiKey.monthlyQuotaResetAt = this.getNextMonthStart();
        updated = true;
      }

      if (updated) {
        this.apiKeys.set(id, apiKey);
      }
    }
  }

  private checkRotationReminders() {
    const now = new Date();

    for (const apiKey of this.apiKeys.values()) {
      if (!apiKey.rotationRemindersEnabled || !apiKey.expiresAt) {
        continue;
      }

      const reminderDate = new Date(apiKey.expiresAt);
      reminderDate.setDate(reminderDate.getDate() - apiKey.rotationReminderDays);

      if (now >= reminderDate && (!apiKey.nextRotationReminderAt || now >= apiKey.nextRotationReminderAt)) {
        this.logger.warn(
          `API Key rotation reminder: "${apiKey.name}" (${apiKey.keyPrefix}) expires on ${apiKey.expiresAt.toISOString()}. ` +
          `Please rotate this key. User: ${apiKey.userId}`
        );

        // Set next reminder for tomorrow to avoid spam
        apiKey.nextRotationReminderAt = new Date(now.getTime() + 86400000);
        this.apiKeys.set(apiKey.id, apiKey);
      }
    }
  }

  async create(createApiKeyDto: CreateApiKeyDto, userId: string): Promise<ApiKeyWithSecret> {
    // Generate API key
    const apiKey = 'sk_' + this.generateApiKey();
    const keyHash = await bcrypt.hash(apiKey, MasterConfig.BCRYPT_ROUNDS);
    const keyPrefix = apiKey.substring(0, 8);

    const now = new Date();
    const rotationPolicy = createApiKeyDto.rotationPolicy || ApiKeyRotationPolicy.MANUAL;
    const rotationRemindersEnabled = createApiKeyDto.rotationRemindersEnabled !== false;
    const rotationReminderDays = createApiKeyDto.rotationReminderDays || 30;

    // Calculate expiration based on rotation policy if not provided
    let expiresAt = createApiKeyDto.expiresAt;
    if (!expiresAt && rotationPolicy !== ApiKeyRotationPolicy.MANUAL) {
      expiresAt = this.calculateExpirationFromPolicy(rotationPolicy);
    }

    const apiKeyEntity: ApiKey = {
      id: this.generateId(),
      name: createApiKeyDto.name,
      description: createApiKeyDto.description,
      keyPrefix,
      keyHash,
      scopes: createApiKeyDto.scopes,
      ipWhitelist: createApiKeyDto.ipWhitelist,
      expiresAt,
      rateLimit: createApiKeyDto.rateLimit || this.defaultRateLimit,
      dailyQuota: createApiKeyDto.dailyQuota,
      monthlyQuota: createApiKeyDto.monthlyQuota,
      requestCount: 0,
      dailyRequestCount: 0,
      monthlyRequestCount: 0,
      active: true,
      rotationPolicy,
      rotationRemindersEnabled,
      rotationReminderDays,
      lastRotatedAt: now,
      nextRotationReminderAt: undefined,
      dailyQuotaResetAt: this.getNextDayMidnight(),
      monthlyQuotaResetAt: this.getNextMonthStart(),
      createdAt: now,
      updatedAt: now,
      userId,
    };

    this.apiKeys.set(apiKeyEntity.id, apiKeyEntity);

    this.logger.log(`Created API key "${apiKeyEntity.name}" for user ${userId} with scopes: ${apiKeyEntity.scopes.join(', ')}`);

    // Return with plain API key (only shown once)
    return {
      ...apiKeyEntity,
      key: apiKey,
    };
  }

  async findAll(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(k => k.userId === userId);
  }

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

  async update(id: string, updateApiKeyDto: UpdateApiKeyDto, userId: string): Promise<ApiKey> {
    const apiKey = await this.findOne(id, userId);

    const updated: ApiKey = {
      ...apiKey,
      name: updateApiKeyDto.name ?? apiKey.name,
      description: updateApiKeyDto.description ?? apiKey.description,
      scopes: updateApiKeyDto.scopes ?? apiKey.scopes,
      ipWhitelist: updateApiKeyDto.ipWhitelist ?? apiKey.ipWhitelist,
      expiresAt: updateApiKeyDto.expiresAt ?? apiKey.expiresAt,
      rateLimit: updateApiKeyDto.rateLimit ?? apiKey.rateLimit,
      dailyQuota: updateApiKeyDto.dailyQuota ?? apiKey.dailyQuota,
      monthlyQuota: updateApiKeyDto.monthlyQuota ?? apiKey.monthlyQuota,
      active: updateApiKeyDto.active ?? apiKey.active,
      rotationPolicy: updateApiKeyDto.rotationPolicy ?? apiKey.rotationPolicy,
      rotationRemindersEnabled: updateApiKeyDto.rotationRemindersEnabled ?? apiKey.rotationRemindersEnabled,
      rotationReminderDays: updateApiKeyDto.rotationReminderDays ?? apiKey.rotationReminderDays,
      updatedAt: new Date(),
    };

    this.apiKeys.set(id, updated);

    this.logger.log(`Updated API key "${updated.name}" (ID: ${id})`);

    return updated;
  }

  async revoke(id: string, userId: string): Promise<void> {
    const apiKey = await this.findOne(id, userId);
    this.apiKeys.delete(id);
    this.logger.log(`Revoked API key "${apiKey.name}" (ID: ${id})`);
  }

  async rotate(id: string, userId: string): Promise<ApiKeyWithSecret> {
    const oldApiKey = await this.findOne(id, userId);

    // Generate new API key
    const newKey = 'sk_' + this.generateApiKey();
    const keyHash = await bcrypt.hash(newKey, MasterConfig.BCRYPT_ROUNDS);
    const keyPrefix = newKey.substring(0, 8);

    const now = new Date();
    let expiresAt = oldApiKey.expiresAt;

    // Update expiration based on rotation policy
    if (oldApiKey.rotationPolicy !== ApiKeyRotationPolicy.MANUAL) {
      expiresAt = this.calculateExpirationFromPolicy(oldApiKey.rotationPolicy);
    }

    const rotatedApiKey: ApiKey = {
      ...oldApiKey,
      keyPrefix,
      keyHash,
      expiresAt,
      lastRotatedAt: now,
      nextRotationReminderAt: undefined,
      updatedAt: now,
    };

    this.apiKeys.set(id, rotatedApiKey);

    this.logger.log(`Rotated API key "${rotatedApiKey.name}" (ID: ${id})`);

    return {
      ...rotatedApiKey,
      key: newKey,
    };
  }

  async validate(apiKey: string, options?: ValidationOptions): Promise<ApiKey> {
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

          // Check IP whitelist
          if (options?.clientIp && key.ipWhitelist && key.ipWhitelist.length > 0) {
            if (!this.isIpAllowed(options.clientIp, key.ipWhitelist)) {
              this.logger.warn(`API key "${key.name}" used from unauthorized IP: ${options.clientIp}`);
              throw new ForbiddenException('API key not authorized for this IP address');
            }
          }

          // Check scopes
          if (options?.requiredScopes && options.requiredScopes.length > 0) {
            if (!this.hasRequiredScopes(key.scopes, options.requiredScopes)) {
              this.logger.warn(
                `API key "${key.name}" missing required scopes. ` +
                `Has: [${key.scopes.join(', ')}], Needs: [${options.requiredScopes.join(', ')}]`
              );
              throw new ForbiddenException('API key does not have required permissions');
            }
          }

          // Check quotas
          await this.checkQuotas(key);

          // Check rate limit
          await this.checkRateLimit(key);

          // Update usage statistics
          key.lastUsedAt = new Date();
          key.requestCount = (key.requestCount || 0) + 1;
          key.dailyRequestCount = (key.dailyRequestCount || 0) + 1;
          key.monthlyRequestCount = (key.monthlyRequestCount || 0) + 1;
          this.apiKeys.set(key.id, key);

          return key;
        }
      } catch (error) {
        // Continue to next key if bcrypt comparison fails
        if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
          throw error;
        }
        continue;
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }

  private isIpAllowed(clientIp: string, ipWhitelist: string[]): boolean {
    // Normalize IPv6 localhost to IPv4
    const normalizedIp = clientIp === '::1' ? '127.0.0.1' : clientIp;

    return ipWhitelist.some(allowedIp => {
      // Support CIDR notation in the future if needed
      // For now, exact match
      const normalizedAllowedIp = allowedIp === '::1' ? '127.0.0.1' : allowedIp;
      return normalizedAllowedIp === normalizedIp;
    });
  }

  private hasRequiredScopes(keyScopes: ApiKeyScope[], requiredScopes: ApiKeyScope[]): boolean {
    // Admin scope grants all permissions
    if (keyScopes.includes(ApiKeyScope.ADMIN)) {
      return true;
    }

    // Check if all required scopes are present
    return requiredScopes.every(required => keyScopes.includes(required));
  }

  private async checkQuotas(apiKey: ApiKey): Promise<void> {
    const now = new Date();

    // Reset daily quota if needed
    if (apiKey.dailyQuotaResetAt && apiKey.dailyQuotaResetAt < now) {
      apiKey.dailyRequestCount = 0;
      apiKey.dailyQuotaResetAt = this.getNextDayMidnight();
    }

    // Reset monthly quota if needed
    if (apiKey.monthlyQuotaResetAt && apiKey.monthlyQuotaResetAt < now) {
      apiKey.monthlyRequestCount = 0;
      apiKey.monthlyQuotaResetAt = this.getNextMonthStart();
    }

    // Check daily quota
    if (apiKey.dailyQuota && apiKey.dailyRequestCount >= apiKey.dailyQuota) {
      throw new UnauthorizedException(
        `Daily quota exceeded. Resets at ${apiKey.dailyQuotaResetAt.toISOString()}`
      );
    }

    // Check monthly quota
    if (apiKey.monthlyQuota && apiKey.monthlyRequestCount >= apiKey.monthlyQuota) {
      throw new UnauthorizedException(
        `Monthly quota exceeded. Resets at ${apiKey.monthlyQuotaResetAt.toISOString()}`
      );
    }
  }

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

  async getUsageStats(id: string, userId: string): Promise<ApiKeyUsageStats> {
    const apiKey = await this.findOne(id, userId);
    const rateData = this.requestCounts.get(id);

    const rateLimitUsagePercentage = rateData ? (rateData.count / apiKey.rateLimit) * 100 : 0;
    const dailyQuotaUsagePercentage = apiKey.dailyQuota
      ? (apiKey.dailyRequestCount / apiKey.dailyQuota) * 100
      : undefined;
    const monthlyQuotaUsagePercentage = apiKey.monthlyQuota
      ? (apiKey.monthlyRequestCount / apiKey.monthlyQuota) * 100
      : undefined;

    return {
      id: apiKey.id,
      name: apiKey.name,
      totalRequests: apiKey.requestCount,
      lastUsedAt: apiKey.lastUsedAt,
      currentHourRequests: rateData?.count || 0,
      todayRequests: apiKey.dailyRequestCount,
      monthRequests: apiKey.monthlyRequestCount,
      rateLimit: apiKey.rateLimit,
      dailyQuota: apiKey.dailyQuota,
      monthlyQuota: apiKey.monthlyQuota,
      rateLimitResetAt: rateData?.resetAt,
      dailyQuotaResetAt: apiKey.dailyQuotaResetAt,
      monthlyQuotaResetAt: apiKey.monthlyQuotaResetAt,
      rateLimitUsagePercentage: Math.round(rateLimitUsagePercentage * 100) / 100,
      dailyQuotaUsagePercentage: dailyQuotaUsagePercentage
        ? Math.round(dailyQuotaUsagePercentage * 100) / 100
        : undefined,
      monthlyQuotaUsagePercentage: monthlyQuotaUsagePercentage
        ? Math.round(monthlyQuotaUsagePercentage * 100) / 100
        : undefined,
    };
  }

  async getAvailableScopes(): Promise<{ id: string; label: string; description: string }[]> {
    return [
      { id: ApiKeyScope.READ, label: 'Read', description: 'Read-only access to resources' },
      { id: ApiKeyScope.WRITE, label: 'Write', description: 'Create and update resources' },
      { id: ApiKeyScope.DELETE, label: 'Delete', description: 'Delete resources' },
      { id: ApiKeyScope.ADMIN, label: 'Admin', description: 'Full administrative access' },
      { id: ApiKeyScope.DOCUMENTS_READ, label: 'Documents Read', description: 'Read documents' },
      { id: ApiKeyScope.DOCUMENTS_WRITE, label: 'Documents Write', description: 'Create and update documents' },
      { id: ApiKeyScope.DOCUMENTS_DELETE, label: 'Documents Delete', description: 'Delete documents' },
      { id: ApiKeyScope.USERS_READ, label: 'Users Read', description: 'Read user information' },
      { id: ApiKeyScope.USERS_WRITE, label: 'Users Write', description: 'Create and update users' },
      { id: ApiKeyScope.USERS_DELETE, label: 'Users Delete', description: 'Delete users' },
      { id: ApiKeyScope.CASES_READ, label: 'Cases Read', description: 'Read case information' },
      { id: ApiKeyScope.CASES_WRITE, label: 'Cases Write', description: 'Create and update cases' },
      { id: ApiKeyScope.CASES_DELETE, label: 'Cases Delete', description: 'Delete cases' },
      { id: ApiKeyScope.WEBHOOKS_MANAGE, label: 'Webhooks Manage', description: 'Manage webhook configurations' },
      { id: ApiKeyScope.API_KEYS_MANAGE, label: 'API Keys Manage', description: 'Manage API keys' },
    ];
  }

  async getKeysNeedingRotation(userId: string): Promise<ApiKey[]> {
    const now = new Date();
    const userKeys = await this.findAll(userId);

    return userKeys.filter(key => {
      if (!key.expiresAt || !key.rotationRemindersEnabled) {
        return false;
      }

      const reminderDate = new Date(key.expiresAt);
      reminderDate.setDate(reminderDate.getDate() - key.rotationReminderDays);

      return now >= reminderDate;
    });
  }

  private generateApiKey(): string {
    return `lx_${crypto.randomBytes(32).toString('hex')}`;
  }

  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextDayMidnight(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private getNextMonthStart(): Date {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }

  private calculateExpirationFromPolicy(policy: ApiKeyRotationPolicy): Date {
    const now = new Date();
    const expiration = new Date(now);

    switch (policy) {
      case ApiKeyRotationPolicy.QUARTERLY:
        expiration.setMonth(expiration.getMonth() + 3);
        break;
      case ApiKeyRotationPolicy.BIANNUALLY:
        expiration.setMonth(expiration.getMonth() + 6);
        break;
      case ApiKeyRotationPolicy.ANNUALLY:
        expiration.setFullYear(expiration.getFullYear() + 1);
        break;
      default:
        // Manual - no automatic expiration
        return new Date(now.getTime() + 31536000000); // 1 year default
    }

    return expiration;
  }
}
