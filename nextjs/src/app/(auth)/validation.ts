/**
 * Authentication Validation Schemas
 * Zod schemas for form validation
 *
 * Uses centralized password policy for consistent password validation
 * across the application.
 */

import { z } from 'zod';
import type { PasswordStrength } from './types';
import {
  DEFAULT_PASSWORD_POLICY,
  validatePasswordPolicy,
  createZodPasswordSuperRefine,
  ABSOLUTE_MAX_PASSWORD_LENGTH,
  type PasswordPolicy,
} from '@/lib/validation/password-policy';

// Re-export password policy for convenience
export { DEFAULT_PASSWORD_POLICY, validatePasswordPolicy };
export type { PasswordPolicy };

// Password requirements from centralized policy
const PASSWORD_MIN_LENGTH = DEFAULT_PASSWORD_POLICY.minLength;
const PASSWORD_MAX_LENGTH = DEFAULT_PASSWORD_POLICY.maxLength ?? ABSOLUTE_MAX_PASSWORD_LENGTH;

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login with MFA Schema
 */
export const loginWithMfaSchema = loginSchema.extend({
  mfaCode: z
    .string()
    .length(6, 'MFA code must be 6 digits')
    .regex(/^\d{6}$/, 'MFA code must be 6 digits')
    .optional(),
});

export type LoginWithMfaFormData = z.infer<typeof loginWithMfaSchema>;

/**
 * MFA Code Schema
 */
export const mfaCodeSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Code must contain only digits');

/**
 * Password schema using centralized policy validation.
 * Enforces all requirements from DEFAULT_PASSWORD_POLICY.
 */
const policyPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`)
  .superRefine(createZodPasswordSuperRefine(DEFAULT_PASSWORD_POLICY));

/**
 * Registration Schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .regex(EMAIL_REGEX, 'Please enter a valid email address'),
    password: policyPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || PHONE_REGEX.test(val.replace(/[\s()-]/g, '')),
        'Please enter a valid phone number'
      ),
    organizationName: z.string().max(100, 'Organization name cannot exceed 100 characters').optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
    marketingOptIn: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .regex(EMAIL_REGEX, 'Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: policyPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change Password Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: policyPasswordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Enterprise SSO Login Schema
 */
export const ssoLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  organizationDomain: z.string().optional(),
});

export type SSOLoginFormData = z.infer<typeof ssoLoginSchema>;

/**
 * Calculate password strength based on policy requirements.
 *
 * Uses the centralized password policy for validation and provides
 * detailed feedback for password improvement.
 *
 * @param password - The password to evaluate
 * @param policy - Optional custom policy (defaults to DEFAULT_PASSWORD_POLICY)
 */
export function validatePasswordStrength(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordStrength {
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-rose-500',
      percentage: 0,
      feedback: ['Enter a password'],
    };
  }

  // Use policy validation for detailed checks
  const policyResult = validatePasswordPolicy(password, policy);

  // Length checks - use policy minLength
  if (password.length >= policy.minLength) score++;
  else feedback.push(`Use at least ${policy.minLength} characters`);

  // Bonus for longer passwords
  if (password.length >= 16) score++;
  else if (password.length >= policy.minLength) {
    feedback.push('Consider using 16+ characters for stronger security');
  }

  // Character variety checks from policy validation
  if (policyResult.details.hasLowercase) score += 0.25;
  else if (policy.requireLowercase) feedback.push('Add lowercase letters');

  if (policyResult.details.hasUppercase) score += 0.25;
  else if (policy.requireUppercase) feedback.push('Add uppercase letters');

  if (policyResult.details.hasNumbers) score += 0.25;
  else if (policy.requireNumbers) feedback.push('Add numbers');

  if (policyResult.details.hasSpecialChars) score += 0.25;
  else if (policy.requireSpecialChars) feedback.push('Add special characters (!@#$%^&*)');

  // Additional entropy checks
  if (/(.)\1{2,}/.test(password)) {
    score -= 0.5;
    feedback.push('Avoid repeating characters');
  }

  if (/^[a-zA-Z]+$/.test(password) || /^\d+$/.test(password)) {
    score -= 0.5;
    feedback.push('Mix different character types');
  }

  // Common patterns check
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome'];
  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    score -= 1;
    feedback.push('Avoid common passwords');
  }

  // Add policy validation warnings
  feedback.push(...policyResult.warnings);

  // Normalize score
  const normalizedScore = Math.max(0, Math.min(4, Math.round(score))) as 0 | 1 | 2 | 3 | 4;

  const labels: Record<number, PasswordStrength['label']> = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  };

  const colors: Record<number, string> = {
    0: 'bg-rose-500',
    1: 'bg-orange-500',
    2: 'bg-amber-500',
    3: 'bg-yellow-500',
    4: 'bg-emerald-500',
  };

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
    percentage: (normalizedScore / 4) * 100,
    feedback: [...new Set(feedback)].slice(0, 3), // Dedupe and limit to top 3 suggestions
  };
}

/**
 * Validate CSRF token format
 */
export function isValidCSRFToken(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Sanitize email for display (mask part of it)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visibleChars = Math.min(3, Math.floor(localPart.length / 2));
  const maskedLocal = localPart.slice(0, visibleChars) + '*'.repeat(Math.max(3, localPart.length - visibleChars));

  return `${maskedLocal}@${domain}`;
}
