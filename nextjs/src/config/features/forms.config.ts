// =============================================================================
// FORM & VALIDATION CONFIGURATION
// =============================================================================
// Form behavior, validation rules, and constraints
//
// NOTE: Password configuration is now centralized in @/lib/validation/password-policy.ts
// Use DEFAULT_PASSWORD_POLICY from that module for password validation.

import {
  DEFAULT_PASSWORD_POLICY,
  ABSOLUTE_MAX_PASSWORD_LENGTH,
} from '@/lib/validation/password-policy';

// Form Behavior
export const FORM_AUTO_SAVE_ENABLED = true;
export const FORM_AUTO_SAVE_DELAY_MS = 2000;
export const FORM_VALIDATE_ON_CHANGE = false;
export const FORM_VALIDATE_ON_BLUR = true;
export const FORM_VALIDATE_ON_SUBMIT = true;
export const FORM_SHOW_ERROR_SUMMARY = true;

// Password Requirements - derived from centralized policy
export const PASSWORD_MIN_LENGTH = DEFAULT_PASSWORD_POLICY.minLength;
export const PASSWORD_MAX_LENGTH = DEFAULT_PASSWORD_POLICY.maxLength ?? ABSOLUTE_MAX_PASSWORD_LENGTH;
export const PASSWORD_REQUIRE_UPPERCASE = DEFAULT_PASSWORD_POLICY.requireUppercase;
export const PASSWORD_REQUIRE_LOWERCASE = DEFAULT_PASSWORD_POLICY.requireLowercase;
export const PASSWORD_REQUIRE_NUMBER = DEFAULT_PASSWORD_POLICY.requireNumbers;
export const PASSWORD_REQUIRE_SPECIAL = DEFAULT_PASSWORD_POLICY.requireSpecialChars;

// Email Validation
export const EMAIL_MAX_LENGTH = 254;

// Phone Validation
export const PHONE_FORMATS = ['US', 'INTERNATIONAL'];

// Text Limits
export const TEXT_SHORT_MAX_LENGTH = 255;
export const TEXT_MEDIUM_MAX_LENGTH = 1000;
export const TEXT_LONG_MAX_LENGTH = 10000;

// Export as object
export const FORMS_CONFIG = {
  autoSave: {
    enabled: FORM_AUTO_SAVE_ENABLED,
    delayMs: FORM_AUTO_SAVE_DELAY_MS,
  },
  validation: {
    onChange: FORM_VALIDATE_ON_CHANGE,
    onBlur: FORM_VALIDATE_ON_BLUR,
    onSubmit: FORM_VALIDATE_ON_SUBMIT,
    showErrorSummary: FORM_SHOW_ERROR_SUMMARY,
  },
  password: {
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
    requireUppercase: PASSWORD_REQUIRE_UPPERCASE,
    requireLowercase: PASSWORD_REQUIRE_LOWERCASE,
    requireNumber: PASSWORD_REQUIRE_NUMBER,
    requireSpecial: PASSWORD_REQUIRE_SPECIAL,
  },
  email: {
    maxLength: EMAIL_MAX_LENGTH,
  },
  phone: {
    formats: PHONE_FORMATS,
  },
  textLimits: {
    short: TEXT_SHORT_MAX_LENGTH,
    medium: TEXT_MEDIUM_MAX_LENGTH,
    long: TEXT_LONG_MAX_LENGTH,
  },
} as const;
