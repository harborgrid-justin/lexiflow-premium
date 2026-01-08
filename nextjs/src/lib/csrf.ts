'use server';

/**
 * CSRF Protection Utilities
 *
 * Provides secure CSRF token generation, validation, and management
 * for protecting state-changing operations from cross-site request forgery attacks.
 *
 * Security Features:
 * - HttpOnly cookies to prevent XSS token theft
 * - SameSite=Strict to prevent cross-origin requests
 * - 1-hour token expiration
 * - Cryptographically secure random token generation
 * - Timing-safe comparison to prevent timing attacks
 */

import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

// ============================================================================
// Constants
// ============================================================================

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32; // 256 bits
const CSRF_TOKEN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a cryptographically secure random token
 */
function generateSecureToken(length: number = CSRF_TOKEN_LENGTH): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate and store a new CSRF token in an HttpOnly cookie
 *
 * @returns The generated CSRF token for use in forms
 */
export async function generateCSRFToken(): Promise<string> {
  const token = generateSecureToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Math.floor(CSRF_TOKEN_DURATION / 1000), // Convert to seconds
    path: '/',
  });

  return token;
}

/**
 * Get the current CSRF token from cookies
 * If no token exists, generates a new one
 *
 * @returns The current or newly generated CSRF token
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken) {
    return existingToken;
  }

  // Generate new token if none exists
  return generateCSRFToken();
}

// ============================================================================
// Token Validation
// ============================================================================

/**
 * Timing-safe comparison of two tokens
 * Prevents timing attacks by ensuring comparison takes constant time
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Still do a comparison to maintain constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validate a CSRF token against the stored cookie value
 *
 * @param token - The token to validate (from form or header)
 * @returns Boolean indicating if the token is valid
 */
export async function validateCSRFToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!storedToken) {
    return false;
  }

  return timingSafeCompare(token, storedToken);
}

/**
 * Check if a CSRF token is valid (synchronous validation helper)
 * This is used for quick checks where the token is already known
 */
export function isValidCSRFToken(submittedToken: string, storedToken: string): boolean {
  if (!submittedToken || !storedToken) {
    return false;
  }

  return timingSafeCompare(submittedToken, storedToken);
}

// ============================================================================
// Form Data Extraction
// ============================================================================

/**
 * Extract CSRF token from FormData
 */
export function extractCSRFFromFormData(formData: FormData): string | null {
  const token = formData.get('_csrf');
  return typeof token === 'string' ? token : null;
}

/**
 * Extract CSRF token from request headers
 */
export async function extractCSRFFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get(CSRF_HEADER_NAME);
}

// ============================================================================
// Combined Validation
// ============================================================================

/**
 * Validate CSRF token from either FormData or headers
 * Checks FormData first, then falls back to header
 *
 * @param formData - Optional FormData containing _csrf field
 * @returns Object with validation result and error message if invalid
 */
export async function validateCSRFFromRequest(
  formData?: FormData
): Promise<{ valid: boolean; error?: string }> {
  // Try to get token from FormData first
  let token: string | null = null;

  if (formData) {
    token = extractCSRFFromFormData(formData);
  }

  // Fall back to header if no token in form
  if (!token) {
    token = await extractCSRFFromHeaders();
  }

  if (!token) {
    return {
      valid: false,
      error: 'CSRF token is missing. Please refresh the page and try again.',
    };
  }

  const isValid = await validateCSRFToken(token);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or expired CSRF token. Please refresh the page and try again.',
    };
  }

  return { valid: true };
}

// ============================================================================
// Token Rotation
// ============================================================================

/**
 * Rotate the CSRF token (generate new token and invalidate old one)
 * Should be called after sensitive operations like login
 *
 * @returns The new CSRF token
 */
export async function rotateCSRFToken(): Promise<string> {
  // Generate a completely new token
  return generateCSRFToken();
}

/**
 * Clear the CSRF token cookie
 * Should be called on logout
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

// ============================================================================
// Middleware Helper
// ============================================================================

/**
 * CSRF validation wrapper for server actions
 * Validates token and returns early with error if invalid
 *
 * @param formData - FormData from the form submission
 * @returns null if valid, AuthFormState error object if invalid
 */
export async function requireCSRFToken(
  formData: FormData
): Promise<{ success: false; error: string } | null> {
  const validation = await validateCSRFFromRequest(formData);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error || 'CSRF validation failed.',
    };
  }

  return null;
}
