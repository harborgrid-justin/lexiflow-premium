/**
 * Login Page - Next.js 16 Server Component
 * Enterprise authentication with async params/searchParams
 *
 * @module app/(auth)/login/page
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCSRFToken } from '../../../lib/csrf';
import { loginAction } from '../actions';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | LexiFlow',
  description: 'Sign in to your LexiFlow account - Enterprise Legal OS',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

interface LoginPageProps {
  searchParams: Promise<{
    from?: string;
    error?: string;
    registered?: string;
    reset?: string;
    verified?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check auth first
  await checkAuth();

  // Await searchParams (Next.js 16 requirement)
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams.from || '/dashboard';
  const error = resolvedParams.error;
  const registered = resolvedParams.registered;
  const reset = resolvedParams.reset;
  const verified = resolvedParams.verified;

  // Get CSRF token for form protection (Server Action will generate if needed)
  const csrfToken = await getCSRFToken();

  // Get success message based on URL params
  const getSuccessMessage = () => {
    if (registered === 'true') {
      return 'Registration successful! Please check your email to verify your account.';
    }
    if (reset === 'success') {
      return 'Password reset successful! You can now sign in with your new password.';
    }
    if (verified === 'true') {
      return 'Email verified successfully! You can now sign in.';
    }
    return null;
  };

  const successMessage = getSuccessMessage();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            Sign In
          </h2>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-md border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error === 'credentials' && 'Invalid email or password'}
                {error === 'session' && 'Your session has expired. Please sign in again.'}
                {error === 'unauthorized' && 'You must be signed in to access this page.'}
                {!['credentials', 'session', 'unauthorized'].includes(error) && error}
              </div>
            </div>
          )}

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm action={loginAction} callbackUrl={callbackUrl} csrfToken={csrfToken} />
          </Suspense>

          {/* SSO Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800 px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <SSOButton provider="google" label="Google" />
            <SSOButton provider="microsoft" label="Microsoft" />
          </div>

          {/* Alternative Login Links */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login-enhanced"
              className="flex items-center justify-center rounded-md border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              MFA Login
            </Link>
            <Link
              href="/login-enterprise"
              className="flex items-center justify-center rounded-md border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Enterprise SSO
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Create an account
            </Link>
          </p>
          <p className="mt-2">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400 text-center mb-3">Demo Credentials</p>
          <div className="space-y-2 text-xs text-slate-400">
            <p>
              Email:{' '}
              <code className="bg-slate-700/50 px-2 py-1 rounded font-mono">
                admin@lexiflow.com
              </code>
            </p>
            <p>
              Password:{' '}
              <code className="bg-slate-700/50 px-2 py-1 rounded font-mono">
                Demo123!
              </code>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-slate-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} LexiFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
        <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
        <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      </div>
      <div className="h-10 animate-pulse rounded-md bg-slate-700" />
    </div>
  );
}

function SSOButton({ provider, label }: { provider: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
    microsoft: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF" />
        <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900" />
        <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022" />
        <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
    >
      {icons[provider]}
      {label}
    </button>
  );
}
