import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * AuthSecurityConfigService
 *
 * Provides globally injectable access to authentication and security configuration.
 * Consolidates password policy, brute force protection, session, and MFA settings.
 */
@Injectable()
export class AuthSecurityConfigService {
  // Password Policy
  get passwordMinLength(): number {
    return MasterConfig.PASSWORD_MIN_LENGTH;
  }

  get passwordMaxLength(): number {
    return MasterConfig.PASSWORD_MAX_LENGTH;
  }

  get passwordRequireUppercase(): boolean {
    return MasterConfig.PASSWORD_REQUIRE_UPPERCASE;
  }

  get passwordRequireLowercase(): boolean {
    return MasterConfig.PASSWORD_REQUIRE_LOWERCASE;
  }

  get passwordRequireNumber(): boolean {
    return MasterConfig.PASSWORD_REQUIRE_NUMBER;
  }

  get passwordRequireSpecial(): boolean {
    return MasterConfig.PASSWORD_REQUIRE_SPECIAL;
  }

  get bcryptRounds(): number {
    return MasterConfig.BCRYPT_ROUNDS;
  }

  // Brute Force Protection
  get maxLoginAttempts(): number {
    return MasterConfig.MAX_LOGIN_ATTEMPTS;
  }

  get accountLockoutDurationMs(): number {
    return MasterConfig.ACCOUNT_LOCKOUT_DURATION_MS;
  }

  // Session Configuration
  get sessionAbsoluteTimeoutMs(): number {
    return MasterConfig.SESSION_ABSOLUTE_TIMEOUT_MS;
  }

  get sessionIdleTimeoutMs(): number {
    return MasterConfig.SESSION_IDLE_TIMEOUT_MS;
  }

  // MFA Configuration
  get mfaTotpWindow(): number {
    return MasterConfig.MFA_TOTP_WINDOW;
  }

  get mfaTotpStep(): number {
    return MasterConfig.MFA_TOTP_STEP;
  }

  get mfaBackupCodesCount(): number {
    return MasterConfig.MFA_BACKUP_CODES_COUNT;
  }

  // Token TTL Configuration
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

  // Token Blacklist Configuration
  get tokenBlacklistPrefix(): string {
    return MasterConfig.TOKEN_BLACKLIST_PREFIX;
  }

  get tokenUserBlacklistPrefix(): string {
    return MasterConfig.TOKEN_USER_BLACKLIST_PREFIX;
  }

  get tokenBlacklistTtlDays(): number {
    return MasterConfig.TOKEN_BLACKLIST_TTL_DAYS;
  }

  get tokenBlacklistCleanupIntervalHours(): number {
    return MasterConfig.TOKEN_BLACKLIST_CLEANUP_INTERVAL_HOURS;
  }

  // Progressive delay multipliers for brute force protection (ms)
  get bruteForceDelays(): number[] {
    return [0, 1000, 2000, 5000, 10000, 30000];
  }

  /**
   * Get complete password policy
   */
  getPasswordPolicy(): Record<string, unknown> {
    return {
      minLength: this.passwordMinLength,
      maxLength: this.passwordMaxLength,
      requireUppercase: this.passwordRequireUppercase,
      requireLowercase: this.passwordRequireLowercase,
      requireNumber: this.passwordRequireNumber,
      requireSpecial: this.passwordRequireSpecial,
      bcryptRounds: this.bcryptRounds,
    };
  }

  /**
   * Get brute force protection settings
   */
  getBruteForceSettings(): Record<string, unknown> {
    return {
      maxAttempts: this.maxLoginAttempts,
      lockoutDurationMs: this.accountLockoutDurationMs,
      progressiveDelays: this.bruteForceDelays,
    };
  }

  /**
   * Get session configuration
   */
  getSessionConfig(): Record<string, unknown> {
    return {
      absoluteTimeoutMs: this.sessionAbsoluteTimeoutMs,
      idleTimeoutMs: this.sessionIdleTimeoutMs,
    };
  }

  /**
   * Get MFA configuration
   */
  getMfaConfig(): Record<string, unknown> {
    return {
      totpWindow: this.mfaTotpWindow,
      totpStep: this.mfaTotpStep,
      backupCodesCount: this.mfaBackupCodesCount,
      tokenTtlMinutes: this.mfaTokenTtlMinutes,
    };
  }
}
