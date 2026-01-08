/**
 * Password Policy Enforcement Module
 *
 * Provides configurable password policy validation with enterprise-grade security features.
 * Supports minimum length requirements, character type enforcement, expiry policies,
 * and password reuse prevention.
 *
 * @module PasswordPolicy
 * @description Centralized password validation aligned with enterprise security standards.
 *
 * @example
 * ```typescript
 * import {
 *   DEFAULT_PASSWORD_POLICY,
 *   validatePasswordPolicy,
 *   checkPasswordExpiry,
 *   checkPasswordReuse
 * } from '@/lib/validation/password-policy';
 *
 * // Validate a password against policy
 * const result = validatePasswordPolicy('MySecurePass123!', DEFAULT_PASSWORD_POLICY);
 * if (!result.valid) {
 *   console.log(result.errors);
 * }
 *
 * // Check if password has expired
 * const lastChanged = new Date('2024-01-01');
 * const isExpired = checkPasswordExpiry(lastChanged, DEFAULT_PASSWORD_POLICY);
 *
 * // Check password reuse (requires hashing)
 * const isReused = await checkPasswordReuse(newPassword, previousHashes, DEFAULT_PASSWORD_POLICY);
 * ```
 */

import crypto from 'crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Password policy configuration interface.
 *
 * Defines the rules for password validation including length requirements,
 * character type requirements, expiration settings, and reuse prevention.
 *
 * @interface PasswordPolicy
 * @property {number} minLength - Minimum password length (required)
 * @property {boolean} requireUppercase - Require at least one uppercase letter
 * @property {boolean} requireLowercase - Require at least one lowercase letter
 * @property {boolean} requireNumbers - Require at least one numeric digit
 * @property {boolean} requireSpecialChars - Require at least one special character
 * @property {number} [maxLength] - Maximum password length (optional, defaults to 128)
 * @property {number} [expiryDays] - Days until password expires (optional)
 * @property {number} [preventReuse] - Number of previous passwords to check for reuse (optional)
 */
export interface PasswordPolicy {
  /** Minimum password length (required) */
  minLength: number;
  /** Require at least one uppercase letter */
  requireUppercase: boolean;
  /** Require at least one lowercase letter */
  requireLowercase: boolean;
  /** Require at least one numeric digit */
  requireNumbers: boolean;
  /** Require at least one special character (!@#$%^&*()_+-=[]{}|;:',.<>?/) */
  requireSpecialChars: boolean;
  /** Maximum password length (optional, defaults to 128) */
  maxLength?: number;
  /** Days until password expires (optional, undefined means no expiry) */
  expiryDays?: number;
  /** Number of previous passwords to check for reuse prevention (optional) */
  preventReuse?: number;
}

/**
 * Result of password policy validation.
 *
 * @interface PasswordValidationResult
 * @property {boolean} valid - Whether the password meets all policy requirements
 * @property {string[]} errors - Array of error messages for failed requirements
 * @property {string[]} warnings - Array of warning messages (suggestions)
 * @property {Object} details - Detailed breakdown of each requirement check
 */
export interface PasswordValidationResult {
  /** Whether the password meets all policy requirements */
  valid: boolean;
  /** Array of error messages for failed requirements */
  errors: string[];
  /** Array of warning messages (suggestions for improvement) */
  warnings: string[];
  /** Detailed breakdown of each requirement check */
  details: {
    meetsMinLength: boolean;
    meetsMaxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

/**
 * Result of password expiry check.
 *
 * @interface PasswordExpiryResult
 * @property {boolean} expired - Whether the password has expired
 * @property {number | null} daysRemaining - Days until expiry (null if no expiry policy)
 * @property {Date | null} expiresAt - Date when password expires (null if no expiry policy)
 * @property {boolean} warningPeriod - Whether within warning period (7 days before expiry)
 */
export interface PasswordExpiryResult {
  /** Whether the password has expired */
  expired: boolean;
  /** Days until expiry (null if no expiry policy or already expired) */
  daysRemaining: number | null;
  /** Date when password expires (null if no expiry policy) */
  expiresAt: Date | null;
  /** Whether within warning period (7 days before expiry) */
  warningPeriod: boolean;
}

/**
 * Result of password reuse check.
 *
 * @interface PasswordReuseResult
 * @property {boolean} isReused - Whether the password matches a previous password
 * @property {string | null} error - Error message if reused (null if not reused)
 */
export interface PasswordReuseResult {
  /** Whether the password matches a previous password */
  isReused: boolean;
  /** Error message if reused (null if not reused) */
  error: string | null;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default password policy with enterprise-grade security requirements.
 *
 * - Minimum length: 12 characters (NIST SP 800-63B recommends 8+, we use 12 for stronger security)
 * - Maximum length: 128 characters
 * - Requires uppercase, lowercase, numbers, and special characters
 * - Expires after 90 days
 * - Prevents reuse of last 5 passwords
 *
 * @constant
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90,
  preventReuse: 5,
} as const;

/**
 * Relaxed password policy for less sensitive applications.
 * Use DEFAULT_PASSWORD_POLICY for production environments.
 *
 * @constant
 */
export const RELAXED_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  expiryDays: undefined,
  preventReuse: undefined,
} as const;

/**
 * Strict password policy for high-security environments.
 *
 * @constant
 */
export const STRICT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 16,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 60,
  preventReuse: 10,
} as const;

/**
 * Maximum password length allowed (prevents DoS attacks via bcrypt)
 * bcrypt has a max input of 72 bytes, but we allow up to 128 for flexibility
 * with other hashing algorithms.
 *
 * @constant
 */
export const ABSOLUTE_MAX_PASSWORD_LENGTH = 128;

/**
 * Regex patterns for character type validation.
 *
 * @constant
 */
export const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  numbers: /[0-9]/,
  specialChars: /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\"`~]/,
} as const;

/**
 * Warning period before password expiry (in days).
 *
 * @constant
 */
export const EXPIRY_WARNING_DAYS = 7;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a password against a given password policy.
 *
 * Checks all policy requirements and returns detailed validation results
 * including which specific requirements passed or failed.
 *
 * @param {string} password - The password to validate
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to validate against
 * @returns {PasswordValidationResult} Detailed validation result
 *
 * @example
 * ```typescript
 * const result = validatePasswordPolicy('MyPass123!');
 *
 * if (!result.valid) {
 *   // Handle validation errors
 *   result.errors.forEach(error => console.error(error));
 * }
 *
 * // Access detailed breakdown
 * if (!result.details.hasSpecialChars) {
 *   console.log('Missing special characters');
 * }
 * ```
 */
export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const maxLength = policy.maxLength ?? ABSOLUTE_MAX_PASSWORD_LENGTH;

  // Check for null/undefined password
  if (password === null || password === undefined) {
    return {
      valid: false,
      errors: ['Password is required'],
      warnings: [],
      details: {
        meetsMinLength: false,
        meetsMaxLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSpecialChars: false,
      },
    };
  }

  // Convert to string in case of unexpected type
  const passwordStr = String(password);

  // Check minimum length
  const meetsMinLength = passwordStr.length >= policy.minLength;
  if (!meetsMinLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  // Check maximum length
  const meetsMaxLength = passwordStr.length <= maxLength;
  if (!meetsMaxLength) {
    errors.push(`Password cannot exceed ${maxLength} characters`);
  }

  // Check uppercase requirement
  const hasUppercase = PASSWORD_PATTERNS.uppercase.test(passwordStr);
  if (policy.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check lowercase requirement
  const hasLowercase = PASSWORD_PATTERNS.lowercase.test(passwordStr);
  if (policy.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check numbers requirement
  const hasNumbers = PASSWORD_PATTERNS.numbers.test(passwordStr);
  if (policy.requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check special characters requirement
  const hasSpecialChars = PASSWORD_PATTERNS.specialChars.test(passwordStr);
  if (policy.requireSpecialChars && !hasSpecialChars) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:\',.<>?/)');
  }

  // Add warnings for password improvement suggestions
  if (passwordStr.length < 16 && meetsMinLength) {
    warnings.push('Consider using 16+ characters for stronger security');
  }

  // Check for common patterns (basic entropy check)
  if (/(.)\1{2,}/.test(passwordStr)) {
    warnings.push('Avoid repeating the same character multiple times');
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(passwordStr)) {
    warnings.push('Avoid sequential characters (abc, 123, etc.)');
  }

  // Determine overall validity
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    details: {
      meetsMinLength,
      meetsMaxLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
    },
  };
}

/**
 * Checks if a password has expired based on the policy.
 *
 * Returns detailed information about password expiry status including
 * days remaining, expiry date, and whether the user is in the warning period.
 *
 * @param {Date | string | number} lastChanged - When the password was last changed
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to check against
 * @returns {PasswordExpiryResult} Expiry check result with detailed information
 *
 * @example
 * ```typescript
 * const lastChanged = new Date('2024-01-15');
 * const result = checkPasswordExpiry(lastChanged);
 *
 * if (result.expired) {
 *   // Force password change
 *   redirect('/change-password?expired=true');
 * } else if (result.warningPeriod) {
 *   // Show warning to user
 *   showNotification(`Password expires in ${result.daysRemaining} days`);
 * }
 * ```
 */
export function checkPasswordExpiry(
  lastChanged: Date | string | number,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordExpiryResult {
  // If no expiry policy, password never expires
  if (policy.expiryDays === undefined || policy.expiryDays === null || policy.expiryDays <= 0) {
    return {
      expired: false,
      daysRemaining: null,
      expiresAt: null,
      warningPeriod: false,
    };
  }

  // Parse lastChanged date
  let lastChangedDate: Date;
  if (lastChanged instanceof Date) {
    lastChangedDate = lastChanged;
  } else if (typeof lastChanged === 'string' || typeof lastChanged === 'number') {
    lastChangedDate = new Date(lastChanged);
  } else {
    // Invalid input - treat as expired to force password change
    return {
      expired: true,
      daysRemaining: 0,
      expiresAt: new Date(),
      warningPeriod: false,
    };
  }

  // Validate the parsed date
  if (isNaN(lastChangedDate.getTime())) {
    return {
      expired: true,
      daysRemaining: 0,
      expiresAt: new Date(),
      warningPeriod: false,
    };
  }

  // Calculate expiry date
  const expiresAt = new Date(lastChangedDate);
  expiresAt.setDate(expiresAt.getDate() + policy.expiryDays);

  // Calculate days remaining
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / msPerDay);

  // Determine expiry status
  const expired = daysRemaining <= 0;
  const warningPeriod = !expired && daysRemaining <= EXPIRY_WARNING_DAYS;

  return {
    expired,
    daysRemaining: expired ? 0 : daysRemaining,
    expiresAt,
    warningPeriod,
  };
}

/**
 * Checks if a new password matches any previously used passwords.
 *
 * Uses secure hash comparison to prevent password reuse. This function
 * assumes that previous passwords are stored as hashed values.
 *
 * @param {string} newPassword - The new password to check
 * @param {string[]} previousHashes - Array of hashed previous passwords
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to check against
 * @param {Function} [hashFunction] - Custom hash function (defaults to SHA-256)
 * @returns {Promise<PasswordReuseResult>} Reuse check result
 *
 * @example
 * ```typescript
 * // With stored password hashes from database
 * const previousHashes = user.passwordHistory.map(h => h.hash);
 * const result = await checkPasswordReuse(newPassword, previousHashes);
 *
 * if (result.isReused) {
 *   throw new Error(result.error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom hash function (e.g., bcrypt)
 * const result = await checkPasswordReuse(
 *   newPassword,
 *   previousHashes,
 *   DEFAULT_PASSWORD_POLICY,
 *   async (password) => bcrypt.hash(password, 10)
 * );
 * ```
 */
export async function checkPasswordReuse(
  newPassword: string,
  previousHashes: string[],
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  hashFunction?: (password: string) => Promise<string> | string
): Promise<PasswordReuseResult> {
  // If no reuse prevention policy, always allow
  if (policy.preventReuse === undefined || policy.preventReuse === null || policy.preventReuse <= 0) {
    return {
      isReused: false,
      error: null,
    };
  }

  // If no previous hashes to check against
  if (!previousHashes || previousHashes.length === 0) {
    return {
      isReused: false,
      error: null,
    };
  }

  // Limit to policy.preventReuse most recent passwords
  const hashesToCheck = previousHashes.slice(0, policy.preventReuse);

  // Default hash function uses SHA-256 (for comparison with stored hashes)
  const defaultHashFunction = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  const hash = hashFunction || defaultHashFunction;

  // Hash the new password
  const newPasswordHash = await hash(newPassword);

  // Check against previous hashes using timing-safe comparison
  for (const previousHash of hashesToCheck) {
    try {
      // Use timing-safe comparison to prevent timing attacks
      const newHashBuffer = Buffer.from(newPasswordHash, 'utf8');
      const previousHashBuffer = Buffer.from(previousHash, 'utf8');

      // Ensure same length for timing-safe comparison
      if (newHashBuffer.length === previousHashBuffer.length) {
        if (crypto.timingSafeEqual(newHashBuffer, previousHashBuffer)) {
          return {
            isReused: true,
            error: `Password cannot be the same as your last ${policy.preventReuse} passwords`,
          };
        }
      } else if (newPasswordHash === previousHash) {
        // Fallback for different length hashes (shouldn't happen with same algorithm)
        return {
          isReused: true,
          error: `Password cannot be the same as your last ${policy.preventReuse} passwords`,
        };
      }
    } catch {
      // If timing-safe comparison fails, fall back to regular comparison
      if (newPasswordHash === previousHash) {
        return {
          isReused: true,
          error: `Password cannot be the same as your last ${policy.preventReuse} passwords`,
        };
      }
    }
  }

  return {
    isReused: false,
    error: null,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Hashes a password using SHA-256 for storage in password history.
 *
 * Note: For primary password storage, use a proper password hashing algorithm
 * like bcrypt or Argon2. This function is intended for password history
 * comparison only.
 *
 * @param {string} password - The password to hash
 * @returns {string} SHA-256 hash of the password
 *
 * @example
 * ```typescript
 * const hash = hashPasswordForHistory('myPassword123');
 * // Store hash in password history table
 * await db.passwordHistory.create({ userId: user.id, hash });
 * ```
 */
export function hashPasswordForHistory(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Creates a Zod-compatible validation function from a password policy.
 *
 * This allows integration with Zod schemas for form validation.
 *
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to validate against
 * @returns {Function} Zod refine-compatible validation function
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const passwordSchema = z.string()
 *   .refine(
 *     createZodPasswordValidator(DEFAULT_PASSWORD_POLICY),
 *     { message: 'Password does not meet policy requirements' }
 *   );
 * ```
 */
export function createZodPasswordValidator(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): (password: string) => boolean {
  return (password: string): boolean => {
    const result = validatePasswordPolicy(password, policy);
    return result.valid;
  };
}

/**
 * Creates a Zod superRefine-compatible validation function that provides
 * detailed error messages for each failed requirement.
 *
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to validate against
 * @returns {Function} Zod superRefine-compatible validation function
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const passwordSchema = z.string()
 *   .superRefine(createZodPasswordSuperRefine(DEFAULT_PASSWORD_POLICY));
 * ```
 */
export function createZodPasswordSuperRefine(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): (password: string, ctx: { addIssue: (issue: { code: 'custom'; message: string }) => void }) => void {
  return (password: string, ctx: { addIssue: (issue: { code: 'custom'; message: string }) => void }): void => {
    const result = validatePasswordPolicy(password, policy);
    if (!result.valid) {
      for (const error of result.errors) {
        ctx.addIssue({
          code: 'custom',
          message: error,
        });
      }
    }
  };
}

/**
 * Merges a partial policy with the default policy.
 *
 * Useful for creating custom policies that only override specific defaults.
 *
 * @param {Partial<PasswordPolicy>} partialPolicy - Partial policy to merge
 * @returns {PasswordPolicy} Complete merged policy
 *
 * @example
 * ```typescript
 * // Create a policy with custom min length but default everything else
 * const customPolicy = mergeWithDefaultPolicy({ minLength: 16 });
 * ```
 */
export function mergeWithDefaultPolicy(partialPolicy: Partial<PasswordPolicy>): PasswordPolicy {
  return {
    ...DEFAULT_PASSWORD_POLICY,
    ...partialPolicy,
  };
}

/**
 * Generates password requirements text for display to users.
 *
 * @param {PasswordPolicy} [policy=DEFAULT_PASSWORD_POLICY] - The policy to describe
 * @returns {string[]} Array of requirement strings
 *
 * @example
 * ```typescript
 * const requirements = getPasswordRequirementsText();
 * // [
 * //   'At least 12 characters',
 * //   'At least one uppercase letter (A-Z)',
 * //   'At least one lowercase letter (a-z)',
 * //   'At least one number (0-9)',
 * //   'At least one special character (!@#$%^&*...)'
 * // ]
 * ```
 */
export function getPasswordRequirementsText(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string[] {
  const requirements: string[] = [];

  requirements.push(`At least ${policy.minLength} characters`);

  if (policy.maxLength) {
    requirements.push(`No more than ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase) {
    requirements.push('At least one uppercase letter (A-Z)');
  }

  if (policy.requireLowercase) {
    requirements.push('At least one lowercase letter (a-z)');
  }

  if (policy.requireNumbers) {
    requirements.push('At least one number (0-9)');
  }

  if (policy.requireSpecialChars) {
    requirements.push('At least one special character (!@#$%^&*()_+-=[]{}|;:\',.<>?/)');
  }

  return requirements;
}

// ============================================================================
// Exports
// ============================================================================

export type {
  PasswordPolicy as IPasswordPolicy,
};
