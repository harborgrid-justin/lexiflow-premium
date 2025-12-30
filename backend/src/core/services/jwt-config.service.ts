import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from '@config/master.config';

/**
 * JwtConfigService
 *
 * Provides globally injectable access to JWT configuration.
 * Consolidates token expiry, algorithm, and refresh settings.
 */
@Injectable()
export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Access Token Settings
  get secret(): string {
    return this.configService.get<string>('app.jwt.secret') || 'change-me-in-production';
  }

  get expiresIn(): number {
    return MasterConfig.JWT_EXPIRES_IN;
  }

  get expiresInString(): string {
    return this.configService.get<string>('app.jwt.expiresIn') || '15m';
  }

  get algorithm(): string {
    return MasterConfig.JWT_ALGORITHM;
  }

  // Refresh Token Settings
  get refreshSecret(): string {
    return this.configService.get<string>('app.jwt.refreshSecret') || 'change-me-in-production-refresh';
  }

  get refreshExpiresIn(): number {
    return MasterConfig.JWT_REFRESH_EXPIRES_IN;
  }

  get refreshExpiresInString(): string {
    return this.configService.get<string>('app.jwt.refreshExpiresIn') || '7d';
  }

  // Token TTL (in days/hours/minutes)
  get refreshTokenTtlDays(): number {
    return MasterConfig.REFRESH_TOKEN_TTL_DAYS;
  }

  get resetTokenTtlHours(): number {
    return MasterConfig.RESET_TOKEN_TTL_HOURS;
  }

  get mfaTokenTtlMinutes(): number {
    return MasterConfig.MFA_TOKEN_TTL_MINUTES;
  }

  get verificationTokenTtlHours(): number {
    return MasterConfig.VERIFICATION_TOKEN_TTL_HOURS;
  }

  /**
   * Get access token options for JwtModule
   */
  getAccessTokenOptions(): Record<string, unknown> {
    return {
      secret: this.secret,
      signOptions: {
        expiresIn: this.expiresInString,
        algorithm: this.algorithm,
      },
    };
  }

  /**
   * Get refresh token options
   */
  getRefreshTokenOptions(): Record<string, unknown> {
    return {
      secret: this.refreshSecret,
      signOptions: {
        expiresIn: this.refreshExpiresInString,
        algorithm: this.algorithm,
      },
    };
  }

  /**
   * Get token expiry in seconds for a specific token type
   */
  getTokenExpirySeconds(tokenType: 'access' | 'refresh' | 'reset' | 'mfa' | 'verification'): number {
    const expiryMap: Record<string, number> = {
      access: this.expiresIn,
      refresh: this.refreshExpiresIn,
      reset: this.resetTokenTtlHours * 3600,
      mfa: this.mfaTokenTtlMinutes * 60,
      verification: this.verificationTokenTtlHours * 3600,
    };
    return expiryMap[tokenType] || this.expiresIn;
  }

  /**
   * Get summary of configuration (secrets masked)
   */
  getSummary(): Record<string, unknown> {
    return {
      accessToken: {
        expiresIn: this.expiresInString,
        algorithm: this.algorithm,
      },
      refreshToken: {
        expiresIn: this.refreshExpiresInString,
      },
      ttl: {
        refreshDays: this.refreshTokenTtlDays,
        resetHours: this.resetTokenTtlHours,
        mfaMinutes: this.mfaTokenTtlMinutes,
        verificationHours: this.verificationTokenTtlHours,
      },
    };
  }
}
