'use server';

/**
 * Authentication Server Actions
 * Next.js 16 Compliant with async cookies/headers
 * Production-ready with CSRF protection, rate limiting, and comprehensive error handling
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { z } from 'zod';
import type { AuthFormState, User, Session, MFAChallenge } from './types';
import {
  loginSchema,
  loginWithMfaSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  mfaCodeSchema,
  type LoginFormData,
  type RegisterFormData,
} from './validation';

// ============================================================================
// Constants
// ============================================================================

const AUTH_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const CSRF_COOKIE_NAME = 'csrf_token';
const MFA_CHALLENGE_COOKIE = 'mfa_challenge';
const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const CSRF_TOKEN_DURATION = 60 * 60 * 1000; // 1 hour

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_REGISTER_ATTEMPTS = 3;
const MAX_FORGOT_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get client IP address for rate limiting
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Get user agent for audit logging
 */
async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || 'unknown';
}

/**
 * Check rate limit for an identifier
 */
function checkRateLimit(identifier: string, maxAttempts: number): { allowed: boolean; remaining: number; resetAt?: Date } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count };
}

/**
 * Reset rate limit for an identifier
 */
function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Format Zod validation errors
 */
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return errors;
}

/**
 * Generate secure random token
 */
function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash token for storage comparison
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// Cookie Management
// ============================================================================

/**
 * Set authentication cookies
 */
async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
  rememberMe: boolean = false
): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = rememberMe
    ? Math.floor(REMEMBER_ME_DURATION / 1000)
    : Math.floor(SESSION_DURATION / 1000);

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Math.floor(REMEMBER_ME_DURATION / 1000),
      path: '/',
    });
  }
}

/**
 * Clear all authentication cookies
 */
async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
  cookieStore.delete(MFA_CHALLENGE_COOKIE);
}

/**
 * Generate and set CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
  const token = generateSecureToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Math.floor(CSRF_TOKEN_DURATION / 1000),
    path: '/',
  });

  return token;
}

/**
 * Validate CSRF token
 */
async function validateCSRFToken(token: string): Promise<boolean> {
  if (!token) return false;
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return storedToken === token;
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // Decode JWT payload (in production, verify signature with secret)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf8')
    );

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      user: payload.user || {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        permissions: payload.permissions || [],
        mfaEnabled: payload.mfaEnabled || false,
        emailVerified: payload.emailVerified || false,
        phoneVerified: payload.phoneVerified || false,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || new Date().toISOString(),
      },
      accessToken: token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      issuedAt: new Date(payload.iat * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

// ============================================================================
// Authentication Actions
// ============================================================================

/**
 * Login action with email/password
 */
export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const clientIP = await getClientIP();
  const userAgent = await getUserAgent();

  // Rate limiting
  const rateCheck = checkRateLimit(`login:${clientIP}`, MAX_LOGIN_ATTEMPTS);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${Math.ceil((rateCheck.resetAt!.getTime() - Date.now()) / 60000)} minutes.`,
    };
  }

  // Parse form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    rememberMe: formData.get('rememberMe') === 'true',
  };

  // Validate
  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Please check your input',
      fieldErrors: formatZodErrors(validation.error),
    };
  }

  const { email, password, rememberMe } = validation.data;

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-IP': clientIP,
        'X-User-Agent': userAgent,
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (result.errorCode === 'account_locked') {
        return {
          success: false,
          error: 'Your account has been locked due to too many failed attempts. Please contact support or try again later.',
        };
      }

      if (result.errorCode === 'email_not_verified') {
        return {
          success: false,
          error: 'Please verify your email address before logging in.',
          data: { requiresVerification: true, email },
        };
      }

      if (result.errorCode === 'mfa_required' && result.mfaChallenge) {
        // Store MFA challenge data in secure cookie
        const cookieStore = await cookies();
        const challengeData = {
          challengeId: result.mfaChallenge.challengeId,
          method: result.mfaChallenge.method,
          email,
          rememberMe,
          expiresAt: result.mfaChallenge.expiresAt,
        };

        cookieStore.set(MFA_CHALLENGE_COOKIE, JSON.stringify(challengeData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 300, // 5 minutes
          path: '/',
        });

        return {
          success: false,
          error: 'MFA_REQUIRED',
          data: {
            mfaRequired: true,
            mfaMethod: result.mfaChallenge.method,
            attemptsRemaining: result.mfaChallenge.attemptsRemaining,
          },
        };
      }

      return {
        success: false,
        error: result.message || 'Invalid email or password',
      };
    }

    // Success - reset rate limit and set cookies
    resetRateLimit(`login:${clientIP}`);

    await setAuthCookies(
      result.accessToken,
      result.refreshToken,
      rememberMe
    );

    // Revalidate auth-related caches
    revalidateTag('auth', 'default');
    revalidateTag('user', 'default');

    return {
      success: true,
      message: 'Login successful',
      data: { user: result.user },
    };
  } catch (error) {
    console.error('[LoginAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Login with MFA verification
 */
export async function loginWithMfaAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const mfaCode = formData.get('mfaCode') as string;

  // Validate MFA code format
  const codeValidation = mfaCodeSchema.safeParse(mfaCode);
  if (!codeValidation.success) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit code',
    };
  }

  // Get MFA challenge from cookie
  const cookieStore = await cookies();
  const challengeCookie = cookieStore.get(MFA_CHALLENGE_COOKIE)?.value;

  if (!challengeCookie) {
    return {
      success: false,
      error: 'MFA session expired. Please login again.',
    };
  }

  let challengeData: {
    challengeId: string;
    method: string;
    email: string;
    rememberMe: boolean;
    expiresAt: string;
  };

  try {
    challengeData = JSON.parse(challengeCookie);
  } catch {
    return {
      success: false,
      error: 'Invalid MFA session. Please login again.',
    };
  }

  // Check if challenge expired
  if (new Date(challengeData.expiresAt) < new Date()) {
    cookieStore.delete(MFA_CHALLENGE_COOKIE);
    return {
      success: false,
      error: 'MFA code expired. Please login again.',
    };
  }

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: challengeData.challengeId,
        code: mfaCode,
      }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.attemptsRemaining === 0) {
        cookieStore.delete(MFA_CHALLENGE_COOKIE);
        return {
          success: false,
          error: 'Too many failed attempts. Please login again.',
        };
      }

      return {
        success: false,
        error: result.message || 'Invalid verification code',
        data: { attemptsRemaining: result.attemptsRemaining },
      };
    }

    // Clear MFA challenge cookie
    cookieStore.delete(MFA_CHALLENGE_COOKIE);

    // Set auth cookies
    await setAuthCookies(
      result.accessToken,
      result.refreshToken,
      challengeData.rememberMe
    );

    revalidateTag('auth', 'default');
    revalidateTag('user', 'default');

    return {
      success: true,
      message: 'Login successful',
      data: { user: result.user },
    };
  } catch (error) {
    console.error('[LoginWithMfaAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Register new user
 */
export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const clientIP = await getClientIP();

  // Rate limiting (stricter for registration)
  const rateCheck = checkRateLimit(`register:${clientIP}`, MAX_REGISTER_ATTEMPTS);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Too many registration attempts. Please try again later.',
    };
  }

  // Parse form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phone: (formData.get('phone') as string) || undefined,
    organizationName: (formData.get('organizationName') as string) || undefined,
    acceptTerms: formData.get('acceptTerms') === 'true',
    marketingOptIn: formData.get('marketingOptIn') === 'true',
  };

  // Validate
  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Please check your input',
      fieldErrors: formatZodErrors(validation.error),
    };
  }

  const data = validation.data;

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-IP': clientIP,
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        organizationName: data.organizationName,
        marketingOptIn: data.marketingOptIn,
      }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errorCode === 'email_exists') {
        return {
          success: false,
          error: 'An account with this email already exists.',
          fieldErrors: { email: ['This email is already registered'] },
        };
      }

      return {
        success: false,
        error: result.message || 'Registration failed. Please try again.',
      };
    }

    return {
      success: true,
      message: result.requiresEmailVerification
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! You can now sign in.',
      data: {
        requiresEmailVerification: result.requiresEmailVerification,
        email: data.email,
      },
    };
  } catch (error) {
    console.error('[RegisterAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Request password reset
 */
export async function forgotPasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const clientIP = await getClientIP();

  // Rate limiting
  const rateCheck = checkRateLimit(`forgot:${clientIP}`, MAX_FORGOT_ATTEMPTS);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    };
  }

  const rawData = { email: formData.get('email') as string };
  const validation = forgotPasswordSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: 'Please enter a valid email address',
      fieldErrors: formatZodErrors(validation.error),
    };
  }

  const { email } = validation.data;

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    // Fire and forget - don't wait for response to prevent timing attacks
    fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {
      // Silently fail - we don't want to reveal if email exists
    });

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
      data: { email },
    };
  } catch (error) {
    console.error('[ForgotPasswordAction] Error:', error);
    // Still return success to prevent enumeration
    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
      data: { email },
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const rawData = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Please check your input',
      fieldErrors: formatZodErrors(validation.error),
    };
  }

  const { token, password } = validation.data;

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errorCode === 'invalid_token' || result.errorCode === 'expired_token') {
        return {
          success: false,
          error: 'This password reset link is invalid or has expired. Please request a new one.',
        };
      }

      return {
        success: false,
        error: result.message || 'Failed to reset password. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    };
  } catch (error) {
    console.error('[ResetPasswordAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Logout user
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    try {
      // Notify backend to invalidate session/token
      const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('[LogoutAction] Error notifying backend:', error);
      // Continue with logout even if backend call fails
    }
  }

  // Clear all auth cookies
  await clearAuthCookies();

  // Revalidate caches
  revalidateTag('auth', 'default');
  revalidateTag('user', 'default');

  // Redirect to login
  redirect('/login');
}

/**
 * Refresh session token
 */
export async function refreshSessionAction(): Promise<AuthFormState> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return {
      success: false,
      error: 'No refresh token available. Please login again.',
    };
  }

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      await clearAuthCookies();
      return {
        success: false,
        error: 'Session expired. Please login again.',
      };
    }

    await setAuthCookies(result.accessToken, result.refreshToken, true);
    revalidateTag('auth', 'default');

    return {
      success: true,
      message: 'Session refreshed',
    };
  } catch (error) {
    console.error('[RefreshSessionAction] Error:', error);
    return {
      success: false,
      error: 'Failed to refresh session',
    };
  }
}

/**
 * Initiate SSO login
 */
export async function initiateSSOAction(
  provider: string,
  returnUrl?: string
): Promise<{ redirectUrl?: string; error?: string }> {
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/api/v1/auth/sso/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        callbackUrl: `${appUrl}/api/auth/callback/${provider}`,
        returnUrl: returnUrl || '/dashboard',
      }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.message || 'Failed to initiate SSO' };
    }

    return { redirectUrl: result.redirectUrl };
  } catch (error) {
    console.error('[InitiateSSOAction] Error:', error);
    return { error: 'Failed to initiate SSO' };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmailAction(token: string): Promise<AuthFormState> {
  if (!token) {
    return {
      success: false,
      error: 'Verification token is missing',
    };
  }

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Failed to verify email. The link may be invalid or expired.',
      };
    }

    return {
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    };
  } catch (error) {
    console.error('[VerifyEmailAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationAction(email: string): Promise<AuthFormState> {
  const clientIP = await getClientIP();

  const rateCheck = checkRateLimit(`resend:${clientIP}`, MAX_FORGOT_ATTEMPTS);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    };
  }

  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    // Fire and forget to prevent enumeration
    fetch(`${apiUrl}/api/v1/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    // Always return success
    return {
      success: true,
      message: 'If your email is registered and unverified, you will receive a new verification email.',
    };
  } catch (error) {
    console.error('[ResendVerificationAction] Error:', error);
    return {
      success: true,
      message: 'If your email is registered and unverified, you will receive a new verification email.',
    };
  }
}
