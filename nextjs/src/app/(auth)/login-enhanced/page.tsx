/**
 * Enhanced Login Page - Next.js 16 Server Component
 * Login with MFA support (TOTP/SMS/Email)
 *
 * @module app/(auth)/login-enhanced/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { EnhancedLoginForm } from './EnhancedLoginForm';

export const metadata: Metadata = {
  title: 'Enhanced Login | LexiFlow',
  description: 'Secure login with multi-factor authentication - LexiFlow Enterprise Legal OS',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

interface EnhancedLoginPageProps {
  searchParams: Promise<{
    mfa?: string;
    from?: string;
  }>;
}

export default async function EnhancedLoginPage({ searchParams }: EnhancedLoginPageProps) {
  await checkAuth();

  // Await searchParams (Next.js 16 requirement)
  const resolvedParams = await searchParams;
  const showMfaFirst = resolvedParams.mfa === 'true';
  const callbackUrl = resolvedParams.from || '/dashboard';

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Enhanced Login Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">
              {showMfaFirst ? 'Verify Your Identity' : 'Enhanced Sign In'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {showMfaFirst
                ? 'Enter your verification code to continue'
                : 'Secure login with two-factor authentication'}
            </p>
          </div>

          <Suspense fallback={<FormSkeleton />}>
            <EnhancedLoginForm
              callbackUrl={callbackUrl}
              showMfaFirst={showMfaFirst}
            />
          </Suspense>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
            <ShieldIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-400">
              Protected by enterprise-grade security
            </span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to standard login
            </Link>
          </p>
          <p className="mt-2">
            Need help?{' '}
            <Link
              href="/support"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact support
            </Link>
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center text-slate-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} LexiFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function FormSkeleton() {
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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
