import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoginAttempt } from '@auth/entities/login-attempt.entity';

export interface BruteForceConfig {
  maxAttempts: number;
  windowMinutes: number;
  lockoutMinutes: number;
  progressiveDelayEnabled: boolean;
  ipBasedProtection: boolean;
  accountBasedProtection: boolean;
}

export interface AttemptResult {
  allowed: boolean;
  attemptsRemaining: number;
  lockedUntil?: Date;
  delayMs?: number;
  requiresCaptcha: boolean;
  message?: string;
}

export interface AccountLockStatus {
  isLocked: boolean;
  lockedUntil?: Date;
  attemptCount: number;
  remainingAttempts: number;
}

/**
 * Brute Force Protection Service
 *
 * Enterprise-grade protection against brute force attacks for LexiFlow Premium.
 * Implements multiple layers of defense including progressive delays,
 * account lockout, IP-based blocking, and CAPTCHA integration.
 *
 * Features:
 * - Progressive delays after failed attempts
 * - Account lockout with configurable thresholds
 * - IP-based and account-based protection
 * - CAPTCHA integration hooks
 * - Automatic unlock after cooldown
 * - Comprehensive logging for security audits
 */
@Injectable()
export class BruteForceProtectionService {
  private readonly logger = new Logger(BruteForceProtectionService.name);
  private readonly config: BruteForceConfig;

  // In-memory cache for lockouts (faster than DB queries)
  private readonly accountLockouts = new Map<string, Date>();
  private readonly ipLockouts = new Map<string, Date>();

  // Progressive delay multipliers
  private readonly delayMultipliers = [0, 1000, 2000, 5000, 10000, 30000];

  constructor(
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      maxAttempts: parseInt(
        this.configService.get('BRUTE_FORCE_MAX_ATTEMPTS', '5'),
        10,
      ),
      windowMinutes: parseInt(
        this.configService.get('BRUTE_FORCE_WINDOW_MINUTES', '15'),
        10,
      ),
      lockoutMinutes: parseInt(
        this.configService.get('BRUTE_FORCE_LOCKOUT_MINUTES', '30'),
        10,
      ),
      progressiveDelayEnabled:
        this.configService.get('BRUTE_FORCE_PROGRESSIVE_DELAY', 'true') === 'true',
      ipBasedProtection:
        this.configService.get('BRUTE_FORCE_IP_PROTECTION', 'true') === 'true',
      accountBasedProtection:
        this.configService.get('BRUTE_FORCE_ACCOUNT_PROTECTION', 'true') === 'true',
    };

    this.logger.log('Brute Force Protection initialized with config:', this.config);
  }

  /**
   * Check if login attempt is allowed
   * Enforces rate limiting, progressive delays, and account/IP lockouts
   */
  async checkLoginAttempt(
    email: string,
    ipAddress: string,
  ): Promise<AttemptResult> {
    // Check account-based lockout
    if (this.config.accountBasedProtection) {
      const accountLock = await this.checkAccountLockout(email);
      if (!accountLock.allowed) {
        return accountLock;
      }
    }

    // Check IP-based lockout
    if (this.config.ipBasedProtection) {
      const ipLock = await this.checkIpLockout(ipAddress);
      if (!ipLock.allowed) {
        return ipLock;
      }
    }

    // Get recent failed attempts
    const recentAttempts = await this.getRecentFailedAttempts(
      email,
      ipAddress,
    );

    const attemptsRemaining = Math.max(
      0,
      this.config.maxAttempts - recentAttempts.length,
    );

    // Calculate progressive delay
    const delayMs = this.calculateProgressiveDelay(recentAttempts.length);

    // Determine if CAPTCHA should be required
    const requiresCaptcha = recentAttempts.length >= Math.floor(this.config.maxAttempts / 2);

    return {
      allowed: true,
      attemptsRemaining,
      delayMs,
      requiresCaptcha,
    };
  }

  /**
   * Record a failed login attempt
   * Automatically triggers lockout if threshold is exceeded
   */
  async recordFailedAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    failureReason: string,
  ): Promise<void> {
    // Create login attempt record
    const attempt = this.loginAttemptRepository.create({
      email,
      ipAddress,
      userAgent,
      success: false,
      failureReason,
      createdAt: new Date(),
    });

    await this.loginAttemptRepository.save(attempt);

    // Check if lockout should be triggered
    const recentAttempts = await this.getRecentFailedAttempts(email, ipAddress);

    if (recentAttempts.length >= this.config.maxAttempts) {
      await this.lockAccount(email);
      await this.lockIp(ipAddress);

      this.logger.warn(
        `Brute force protection triggered for ${email} from ${ipAddress} after ${recentAttempts.length} failed attempts`,
      );
    }
  }

  /**
   * Record a successful login attempt
   * Clears failed attempt history for the account
   */
  async recordSuccessfulAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    // Create successful login attempt record
    const attempt = this.loginAttemptRepository.create({
      email,
      ipAddress,
      userAgent,
      success: true,
      failureReason: null,
      createdAt: new Date(),
    });

    await this.loginAttemptRepository.save(attempt);

    // Clear lockouts for this account and IP
    this.accountLockouts.delete(email.toLowerCase());
    this.ipLockouts.delete(ipAddress);

    this.logger.log(
      `Successful login for ${email} from ${ipAddress}, cleared lockouts`,
    );
  }

  /**
   * Get account lock status
   */
  async getAccountLockStatus(email: string): Promise<AccountLockStatus> {
    const normalizedEmail = email.toLowerCase();
    const lockedUntil = this.accountLockouts.get(normalizedEmail);

    if (lockedUntil && lockedUntil > new Date()) {
      const recentAttempts = await this.getRecentFailedAttempts(email, null);

      return {
        isLocked: true,
        lockedUntil,
        attemptCount: recentAttempts.length,
        remainingAttempts: 0,
      };
    }

    // Not locked or lock expired
    if (lockedUntil) {
      this.accountLockouts.delete(normalizedEmail);
    }

    const recentAttempts = await this.getRecentFailedAttempts(email, null);
    const remainingAttempts = Math.max(
      0,
      this.config.maxAttempts - recentAttempts.length,
    );

    return {
      isLocked: false,
      attemptCount: recentAttempts.length,
      remainingAttempts,
    };
  }

  /**
   * Manually unlock an account (admin action)
   */
  async unlockAccount(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    this.accountLockouts.delete(normalizedEmail);

    this.logger.log(`Manually unlocked account: ${email}`);
  }

  /**
   * Manually unlock an IP address (admin action)
   */
  async unlockIp(ipAddress: string): Promise<void> {
    this.ipLockouts.delete(ipAddress);

    this.logger.log(`Manually unlocked IP: ${ipAddress}`);
  }

  /**
   * Get recent failed login attempts
   */
  async getRecentAttempts(
    email?: string,
    ipAddress?: string,
    limit = 100,
  ): Promise<LoginAttempt[]> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.config.windowMinutes);

    const queryBuilder = this.loginAttemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.createdAt > :windowStart', { windowStart })
      .orderBy('attempt.createdAt', 'DESC')
      .limit(limit);

    if (email) {
      queryBuilder.andWhere('LOWER(attempt.email) = LOWER(:email)', { email });
    }

    if (ipAddress) {
      queryBuilder.andWhere('attempt.ipAddress = :ipAddress', { ipAddress });
    }

    return queryBuilder.getMany();
  }

  /**
   * Cleanup old login attempts
   * Should be called periodically via cron job
   */
  async cleanupOldAttempts(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days of history

    const result = await this.loginAttemptRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(
        `Cleaned up ${deletedCount} login attempts older than 30 days`,
      );
    }

    return deletedCount;
  }

  /**
   * Get protection statistics
   */
  async getProtectionStats(): Promise<{
    accountsLocked: number;
    ipsLocked: number;
    recentFailedAttempts: number;
    recentSuccessfulAttempts: number;
  }> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.config.windowMinutes);

    const [failedCount, successCount] = await Promise.all([
      this.loginAttemptRepository.count({
        where: {
          success: false,
          createdAt: MoreThan(windowStart),
        },
      }),
      this.loginAttemptRepository.count({
        where: {
          success: true,
          createdAt: MoreThan(windowStart),
        },
      }),
    ]);

    // Clean expired lockouts
    const now = new Date();
    let accountsLocked = 0;
    let ipsLocked = 0;

    for (const [email, lockedUntil] of this.accountLockouts.entries()) {
      if (lockedUntil > now) {
        accountsLocked++;
      } else {
        this.accountLockouts.delete(email);
      }
    }

    for (const [ip, lockedUntil] of this.ipLockouts.entries()) {
      if (lockedUntil > now) {
        ipsLocked++;
      } else {
        this.ipLockouts.delete(ip);
      }
    }

    return {
      accountsLocked,
      ipsLocked,
      recentFailedAttempts: failedCount,
      recentSuccessfulAttempts: successCount,
    };
  }

  /**
   * Check if account is locked
   */
  private async checkAccountLockout(email: string): Promise<AttemptResult> {
    const normalizedEmail = email.toLowerCase();
    const lockedUntil = this.accountLockouts.get(normalizedEmail);

    if (!lockedUntil) {
      return { allowed: true, attemptsRemaining: this.config.maxAttempts, requiresCaptcha: false };
    }

    if (lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );

      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil,
        requiresCaptcha: true,
        message: `Account locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
      };
    }

    // Lock expired, remove it
    this.accountLockouts.delete(normalizedEmail);
    return { allowed: true, attemptsRemaining: this.config.maxAttempts, requiresCaptcha: false };
  }

  /**
   * Check if IP is locked
   */
  private async checkIpLockout(ipAddress: string): Promise<AttemptResult> {
    const lockedUntil = this.ipLockouts.get(ipAddress);

    if (!lockedUntil) {
      return { allowed: true, attemptsRemaining: this.config.maxAttempts, requiresCaptcha: false };
    }

    if (lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );

      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil,
        requiresCaptcha: true,
        message: `This IP address has been temporarily blocked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
      };
    }

    // Lock expired, remove it
    this.ipLockouts.delete(ipAddress);
    return { allowed: true, attemptsRemaining: this.config.maxAttempts, requiresCaptcha: false };
  }

  /**
   * Get recent failed attempts
   */
  private async getRecentFailedAttempts(
    email: string,
    ipAddress: string | null,
  ): Promise<LoginAttempt[]> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.config.windowMinutes);

    const queryBuilder = this.loginAttemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.success = false')
      .andWhere('attempt.createdAt > :windowStart', { windowStart });

    if (this.config.accountBasedProtection) {
      queryBuilder.andWhere('LOWER(attempt.email) = LOWER(:email)', { email });
    }

    if (this.config.ipBasedProtection && ipAddress) {
      queryBuilder.andWhere('attempt.ipAddress = :ipAddress', { ipAddress });
    }

    return queryBuilder.getMany();
  }

  /**
   * Lock an account
   */
  private async lockAccount(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + this.config.lockoutMinutes);

    this.accountLockouts.set(normalizedEmail, lockedUntil);

    this.logger.warn(
      `Locked account ${email} until ${lockedUntil.toISOString()}`,
    );
  }

  /**
   * Lock an IP address
   */
  private async lockIp(ipAddress: string): Promise<void> {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + this.config.lockoutMinutes);

    this.ipLockouts.set(ipAddress, lockedUntil);

    this.logger.warn(
      `Locked IP ${ipAddress} until ${lockedUntil.toISOString()}`,
    );
  }

  /**
   * Calculate progressive delay based on attempt count
   */
  private calculateProgressiveDelay(attemptCount: number): number {
    if (!this.config.progressiveDelayEnabled) {
      return 0;
    }

    const index = Math.min(attemptCount, this.delayMultipliers.length - 1);
    return this.delayMultipliers[index];
  }

  /**
   * Validate CAPTCHA token (integration hook)
   * This should be implemented based on your CAPTCHA provider (e.g., reCAPTCHA, hCaptcha)
   */
  async validateCaptcha(token: string): Promise<boolean> {
    // Production implementation would validate against CAPTCHA provider API
    // For now, this is a hook for integration

    const captchaEnabled = this.configService.get('CAPTCHA_ENABLED', 'false') === 'true';

    if (!captchaEnabled) {
      return true;
    }

    // TODO: Implement actual CAPTCHA validation
    // Example for Google reCAPTCHA:
    // const secretKey = this.configService.get('RECAPTCHA_SECRET_KEY');
    // const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    //   method: 'POST',
    //   body: `secret=${secretKey}&response=${token}`,
    // });
    // const data = await response.json();
    // return data.success;

    this.logger.warn(`CAPTCHA validation not implemented - accepting token: ${token.substring(0, 10)}...`);
    return true;
  }

  /**
   * Apply progressive delay
   * Sleeps for the calculated delay time
   */
  async applyProgressiveDelay(delayMs: number): Promise<void> {
    if (delayMs > 0) {
      this.logger.debug(`Applying progressive delay: ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
