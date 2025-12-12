import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minUppercase: number;
  minLowercase: number;
  minNumbers: number;
  minSpecialChars: number;
  preventCommonPasswords: boolean;
  preventUserInfo: boolean;
  preventReuse: boolean;
  passwordHistoryCount: number;
  maxAge: number; // in days
  minAge: number; // in days (prevent frequent changes)
  expiryWarningDays: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
  suggestions: string[];
}

export interface PasswordBreachCheck {
  isBreached: boolean;
  breachCount: number;
  source: string;
}

// Common passwords from OWASP and HaveIBeenPwned
const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  '111111',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'password1',
  'password123',
  'admin',
  'welcome',
  'login',
]);

@Injectable()
export class PasswordPolicyService {
  private readonly defaultPolicy: PasswordPolicy = {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSpecialChars: 1,
    preventCommonPasswords: true,
    preventUserInfo: true,
    preventReuse: true,
    passwordHistoryCount: 5,
    maxAge: 90, // 90 days
    minAge: 1, // 1 day
    expiryWarningDays: 14,
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get password policy (can be customized per organization)
   */
  getPolicy(): PasswordPolicy {
    return { ...this.defaultPolicy };
  }

  /**
   * Validate password against policy
   * OWASP ASVS V2.1 - Password Security Requirements
   */
  async validatePassword(
    password: string,
    userInfo?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
  ): Promise<PasswordValidationResult> {
    const policy = this.getPolicy();
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Length checks
    if (password.length < policy.minLength) {
      errors.push(
        `Password must be at least ${policy.minLength} characters long`,
      );
    }
    if (password.length > policy.maxLength) {
      errors.push(
        `Password must not exceed ${policy.maxLength} characters`,
      );
    }

    // Character type checks
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    const numberCount = (password.match(/[0-9]/g) || []).length;
    const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;

    if (policy.requireUppercase && uppercaseCount < policy.minUppercase) {
      errors.push(
        `Password must contain at least ${policy.minUppercase} uppercase letter(s)`,
      );
      suggestions.push('Add uppercase letters (A-Z)');
    }

    if (policy.requireLowercase && lowercaseCount < policy.minLowercase) {
      errors.push(
        `Password must contain at least ${policy.minLowercase} lowercase letter(s)`,
      );
      suggestions.push('Add lowercase letters (a-z)');
    }

    if (policy.requireNumbers && numberCount < policy.minNumbers) {
      errors.push(
        `Password must contain at least ${policy.minNumbers} number(s)`,
      );
      suggestions.push('Add numbers (0-9)');
    }

    if (
      policy.requireSpecialChars &&
      specialCharCount < policy.minSpecialChars
    ) {
      errors.push(
        `Password must contain at least ${policy.minSpecialChars} special character(s)`,
      );
      suggestions.push('Add special characters (!@#$%^&*)');
    }

    // Common password check
    if (policy.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (COMMON_PASSWORDS.has(lowerPassword)) {
        errors.push('Password is too common and easily guessable');
        suggestions.push('Use a unique password that is not commonly used');
      }

      // Check for sequential characters
      if (this.hasSequentialChars(password)) {
        errors.push('Password contains sequential characters');
        suggestions.push('Avoid sequential characters like "abc" or "123"');
      }

      // Check for repeated characters
      if (this.hasRepeatedChars(password)) {
        errors.push('Password contains too many repeated characters');
        suggestions.push('Avoid repeating the same character multiple times');
      }
    }

    // User info check
    if (policy.preventUserInfo && userInfo) {
      const userInfoValues = [
        userInfo.email?.split('@')[0].toLowerCase(),
        userInfo.firstName?.toLowerCase(),
        userInfo.lastName?.toLowerCase(),
        userInfo.username?.toLowerCase(),
      ].filter(Boolean);

      for (const info of userInfoValues) {
        if (info && password.toLowerCase().includes(info)) {
          errors.push('Password must not contain personal information');
          suggestions.push(
            'Avoid using your name, email, or other personal information',
          );
          break;
        }
      }
    }

    // Calculate password strength
    const strength = this.calculatePasswordStrength(password);

    return {
      isValid: errors.length === 0,
      errors,
      strength: strength.level,
      score: strength.score,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ['Your password meets all requirements'],
    };
  }

  /**
   * Check if password has been breached using k-anonymity
   * Implements HIBP (Have I Been Pwned) API best practices
   */
  async checkPasswordBreach(password: string): Promise<PasswordBreachCheck> {
    try {
      // Hash the password with SHA-1 (HIBP standard)
      const hash = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex')
        .toUpperCase();

      // Use k-anonymity: only send first 5 characters of hash
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // In production, call HIBP API: https://api.pwnedpasswords.com/range/${prefix}
      // For now, simulate the check
      const response = await this.queryHIBPAPI(prefix);

      // Parse response to find suffix
      const lines = response.split('\n');
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
          return {
            isBreached: true,
            breachCount: parseInt(count, 10),
            source: 'HaveIBeenPwned',
          };
        }
      }

      return {
        isBreached: false,
        breachCount: 0,
        source: 'HaveIBeenPwned',
      };
    } catch (error) {
      // Don't fail authentication if breach check fails
      console.error('Password breach check failed:', error);
      return {
        isBreached: false,
        breachCount: 0,
        source: 'error',
      };
    }
  }

  /**
   * Validate password change
   */
  async validatePasswordChange(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      errors.push('Current password is incorrect');
      return { isValid: false, errors };
    }

    // Check if new password is same as current
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      errors.push('New password must be different from current password');
    }

    // Validate new password against policy
    const validation = await this.validatePassword(newPassword, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    // Check password history (if metadata contains password history)
    const policy = this.getPolicy();
    if (policy.preventReuse && user.metadata?.passwordHistory) {
      const passwordHistory = user.metadata.passwordHistory as string[];
      const recentPasswords = passwordHistory.slice(
        0,
        policy.passwordHistoryCount,
      );

      for (const oldPasswordHash of recentPasswords) {
        const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
        if (isReused) {
          errors.push(
            `Password has been used recently. Please choose a different password (last ${policy.passwordHistoryCount} passwords are not allowed)`,
          );
          break;
        }
      }
    }

    // Check breach database
    const breachCheck = await this.checkPasswordBreach(newPassword);
    if (breachCheck.isBreached) {
      errors.push(
        `This password has been exposed in ${breachCheck.breachCount} data breach(es). Please choose a different password`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password has expired
   */
  async isPasswordExpired(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return false;
    }

    const policy = this.getPolicy();
    const passwordChangedAt =
      (user.metadata?.passwordChangedAt as Date) || user.createdAt;

    const daysSinceChange = Math.floor(
      (Date.now() - new Date(passwordChangedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return daysSinceChange > policy.maxAge;
  }

  /**
   * Get days until password expiry
   */
  async getDaysUntilExpiry(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return 0;
    }

    const policy = this.getPolicy();
    const passwordChangedAt =
      (user.metadata?.passwordChangedAt as Date) || user.createdAt;

    const daysSinceChange = Math.floor(
      (Date.now() - new Date(passwordChangedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return Math.max(0, policy.maxAge - daysSinceChange);
  }

  /**
   * Check if password expiry warning should be shown
   */
  async shouldShowExpiryWarning(userId: string): Promise<boolean> {
    const daysUntilExpiry = await this.getDaysUntilExpiry(userId);
    const policy = this.getPolicy();
    return daysUntilExpiry <= policy.expiryWarningDays && daysUntilExpiry > 0;
  }

  /**
   * Update password history
   */
  async updatePasswordHistory(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    const policy = this.getPolicy();
    const currentHistory =
      (user.metadata?.passwordHistory as string[]) || [];

    // Add current password to history
    const newHistory = [passwordHash, ...currentHistory].slice(
      0,
      policy.passwordHistoryCount,
    );

    await this.userRepository.update(userId, {
      metadata: {
        ...user.metadata,
        passwordHistory: newHistory,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * Calculate password strength
   */
  private calculatePasswordStrength(password: string): {
    level: 'weak' | 'medium' | 'strong' | 'very_strong';
    score: number;
  } {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 20;
    if (password.length >= 20) score += 25;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    // Multiple character types
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
      Boolean,
    ).length;

    if (varietyCount >= 3) score += 20;
    if (varietyCount === 4) score += 30;

    // Determine level
    let level: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (score < 40) level = 'weak';
    else if (score < 70) level = 'medium';
    else if (score < 90) level = 'strong';
    else level = 'very_strong';

    return { level, score: Math.min(100, score) };
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(password: string): boolean {
    const sequences = [
      'abc',
      'bcd',
      'cde',
      'def',
      'efg',
      'fgh',
      'ghi',
      'hij',
      'ijk',
      'jkl',
      'klm',
      'lmn',
      'mno',
      'nop',
      'opq',
      'pqr',
      'qrs',
      'rst',
      'stu',
      'tuv',
      'uvw',
      'vwx',
      'wxy',
      'xyz',
      '123',
      '234',
      '345',
      '456',
      '567',
      '678',
      '789',
    ];

    const lowerPassword = password.toLowerCase();
    return sequences.some((seq) => lowerPassword.includes(seq));
  }

  /**
   * Check for repeated characters
   */
  private hasRepeatedChars(password: string): boolean {
    // Check for 3 or more repeated characters
    return /(.)\1{2,}/.test(password);
  }

  /**
   * Query HIBP API (simulated for now)
   */
  private async queryHIBPAPI(prefix: string): Promise<string> {
    // In production, use: https://api.pwnedpasswords.com/range/${prefix}
    // For now, return empty response (no breaches found)
    // Example response format:
    // 00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2
    // 011053FD0102E94D6AE2F8B83D76FAF94F6:1
    return '';
  }

  /**
   * Generate a strong password suggestion
   */
  generateStrongPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
