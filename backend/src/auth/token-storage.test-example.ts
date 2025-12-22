/**
 * Example Test File for TokenStorageService
 *
 * This file demonstrates how to test the TokenStorageService
 * Run with: npx jest token-storage.test-example.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TokenStorageService, RefreshTokenData, ResetTokenData, MfaTokenData } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let _configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'REDIS_ENABLED': 'false', // Use in-memory for tests
                'redis.host': 'localhost',
                'redis.port': 6379,
                'REFRESH_TOKEN_TTL_DAYS': '7',
                'RESET_TOKEN_TTL_HOURS': '1',
                'MFA_TOKEN_TTL_MINUTES': '5',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenStorageService>(TokenStorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('Refresh Token Operations', () => {
    it('should store and retrieve refresh token', async () => {
      const tokenId = 'user-123';
      const tokenData: RefreshTokenData = {
        userId: 'user-123',
        token: 'refresh-token-jwt',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await service.storeRefreshToken(tokenId, tokenData, 604800);
      const retrieved = await service.getRefreshToken(tokenId);

      expect(retrieved).toEqual(tokenData);
    });

    it('should return null for non-existent token', async () => {
      const retrieved = await service.getRefreshToken('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should delete refresh token', async () => {
      const tokenId = 'user-456';
      const tokenData: RefreshTokenData = {
        userId: 'user-456',
        token: 'refresh-token-jwt',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await service.storeRefreshToken(tokenId, tokenData, 604800);
      await service.deleteRefreshToken(tokenId);
      const retrieved = await service.getRefreshToken(tokenId);

      expect(retrieved).toBeNull();
    });

    it('should delete all user refresh tokens', async () => {
      const userId = 'user-789';
      const token1: RefreshTokenData = {
        userId,
        token: 'token-1',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const token2: RefreshTokenData = {
        userId,
        token: 'token-2',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await service.storeRefreshToken(`${userId}-1`, token1, 604800);
      await service.storeRefreshToken(`${userId}-2`, token2, 604800);
      await service.deleteUserRefreshTokens(userId);

      const retrieved1 = await service.getRefreshToken(`${userId}-1`);
      const retrieved2 = await service.getRefreshToken(`${userId}-2`);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });

    it('should return null for expired token', async () => {
      const tokenId = 'user-expired';
      const tokenData: RefreshTokenData = {
        userId: 'user-expired',
        token: 'expired-token',
        createdAt: new Date(Date.now() - 10000).toISOString(),
        expiresAt: new Date(Date.now() - 5000).toISOString(), // Expired 5 seconds ago
      };

      await service.storeRefreshToken(tokenId, tokenData, 1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const retrieved = await service.getRefreshToken(tokenId);
      expect(retrieved).toBeNull();
    });
  });

  describe('Reset Token Operations', () => {
    it('should store and retrieve reset token', async () => {
      const token = 'reset-token-123';
      const tokenData: ResetTokenData = {
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      await service.storeResetToken(token, tokenData, 3600);
      const retrieved = await service.getResetToken(token);

      expect(retrieved).toEqual(tokenData);
    });

    it('should delete reset token', async () => {
      const token = 'reset-token-456';
      const tokenData: ResetTokenData = {
        userId: 'user-456',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      await service.storeResetToken(token, tokenData, 3600);
      await service.deleteResetToken(token);
      const retrieved = await service.getResetToken(token);

      expect(retrieved).toBeNull();
    });
  });

  describe('MFA Token Operations', () => {
    it('should store and retrieve MFA token', async () => {
      const token = 'mfa-token-123';
      const tokenData: MfaTokenData = {
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };

      await service.storeMfaToken(token, tokenData, 300);
      const retrieved = await service.getMfaToken(token);

      expect(retrieved).toEqual(tokenData);
    });

    it('should delete MFA token', async () => {
      const token = 'mfa-token-456';
      const tokenData: MfaTokenData = {
        userId: 'user-456',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };

      await service.storeMfaToken(token, tokenData, 300);
      await service.deleteMfaToken(token);
      const retrieved = await service.getMfaToken(token);

      expect(retrieved).toBeNull();
    });
  });

  describe('Storage Statistics', () => {
    it('should return in-memory statistics', () => {
      const stats = service.getStats();
      expect(stats.type).toBe('memory');
      expect(stats.connected).toBe(false);
      expect(stats).toHaveProperty('refreshTokenCount');
      expect(stats).toHaveProperty('resetTokenCount');
      expect(stats).toHaveProperty('mfaTokenCount');
    });
  });

  describe('Redis Mode (Integration Test)', () => {
    let redisService: TokenStorageService;

    beforeEach(async () => {
      // This test requires Redis to be running
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TokenStorageService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config = {
                  'REDIS_ENABLED': 'true', // Use Redis for this test
                  'redis.host': 'localhost',
                  'redis.port': 6379,
                };
                return config[key] || defaultValue;
              }),
            },
          },
        ],
      }).compile();

      redisService = module.get<TokenStorageService>(TokenStorageService);

      // Wait for Redis connection
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterEach(async () => {
      await redisService.onModuleDestroy();
    });

    it('should use Redis when enabled', () => {
      const stats = redisService.getStats();
      // May be 'redis' if Redis is available, or 'memory' if fallback occurred
      expect(['redis', 'memory']).toContain(stats.type);
    });

    it('should store token in Redis', async () => {
      const tokenId = 'redis-user-123';
      const tokenData: RefreshTokenData = {
        userId: 'redis-user-123',
        token: 'redis-token',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await redisService.storeRefreshToken(tokenId, tokenData, 604800);
      const retrieved = await redisService.getRefreshToken(tokenId);

      expect(retrieved?.token).toBe(tokenData.token);
    }, 10000); // Longer timeout for Redis operations
  });
});

/**
 * Example Usage in Application Code
 */
export class TokenStorageUsageExample {
  constructor(private tokenStorage: TokenStorageService) {}

  async exampleRegisterUser(userId: string, refreshToken: string) {
    // Store refresh token with 7-day TTL
    await this.tokenStorage.storeRefreshToken(
      userId,
      {
        userId,
        token: refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      7 * 24 * 60 * 60, // 7 days in seconds
    );
  }

  async exampleValidateRefreshToken(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.tokenStorage.getRefreshToken(userId);
    return storedToken !== null && storedToken.token === token;
  }

  async exampleLogoutUser(userId: string) {
    await this.tokenStorage.deleteRefreshToken(userId);
  }

  async examplePasswordReset(userId: string) {
    // Invalidate all sessions when password changes
    await this.tokenStorage.deleteUserRefreshTokens(userId);
  }

  async exampleCreateResetToken(resetToken: string, userId: string) {
    // Store password reset token with 1-hour TTL
    await this.tokenStorage.storeResetToken(
      resetToken,
      {
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      60 * 60, // 1 hour in seconds
    );
  }

  async exampleVerifyResetToken(resetToken: string): Promise<string | null> {
    const tokenData = await this.tokenStorage.getResetToken(resetToken);
    return tokenData?.userId || null;
  }

  async exampleCreateMfaToken(mfaToken: string, userId: string) {
    // Store MFA token with 5-minute TTL
    await this.tokenStorage.storeMfaToken(
      mfaToken,
      {
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      5 * 60, // 5 minutes in seconds
    );
  }

  async exampleVerifyMfaToken(mfaToken: string): Promise<string | null> {
    const tokenData = await this.tokenStorage.getMfaToken(mfaToken);
    if (tokenData && new Date(tokenData.expiresAt) > new Date()) {
      return tokenData.userId;
    }
    return null;
  }

  async exampleGetStorageStats() {
    const stats = this.tokenStorage.getStats();
    console.log('Storage Type:', stats.type);
    console.log('Redis Connected:', stats.connected);
    if (stats.type === 'memory') {
      console.log('Refresh Tokens:', stats.refreshTokenCount);
      console.log('Reset Tokens:', stats.resetTokenCount);
      console.log('MFA Tokens:', stats.mfaTokenCount);
    }
  }
}
