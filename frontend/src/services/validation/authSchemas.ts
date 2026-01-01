/**
 * Authentication Validation Schemas
 * Zod schemas for all authentication-related forms and operations
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

/**
 * Password validation schema
 * Enterprise password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * Simple password schema (for login, less strict)
 */
export const simplePasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(128, 'Password must be less than 128 characters');

/**
 * MFA code validation schema
 */
export const mfaCodeSchema = z
  .string()
  .length(6, 'MFA code must be 6 digits')
  .regex(/^\d{6}$/, 'MFA code must contain only digits');

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  rememberMe: z.boolean().optional().default(false),
  mfaCode: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    phone: z
      .string()
      .regex(
        /^[\d\s()+-]+$/,
        'Phone number can only contain digits, spaces, and symbols'
      )
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number must be less than 20 characters')
      .optional()
      .or(z.literal('')),
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(200, 'Organization name must be less than 200 characters')
      .optional()
      .or(z.literal('')),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: simplePasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * MFA setup validation schema
 */
export const mfaSetupSchema = z.object({
  code: mfaCodeSchema,
});

export type MfaSetupFormData = z.infer<typeof mfaSetupSchema>;

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  phone: z
    .string()
    .regex(/^[\d\s()+-]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  mobilePhone: z
    .string()
    .regex(/^[\d\s()+-]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(200, 'Department must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  office: z
    .string()
    .max(100, 'Office must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

/**
 * Utility function to validate password strength
 */
export function validatePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  else if (score > 0) feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Include both uppercase and lowercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include at least one special character');

  // Cap score at 4
  const finalScore = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  return { score: finalScore, feedback };
}
