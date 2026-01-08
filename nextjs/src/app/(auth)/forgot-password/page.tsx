/**
 * Forgot Password Page - Next.js 16 Server Component
 * Request password reset with email
 *
 * @module app/(auth)/forgot-password/page
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCSRFToken } from '../../../lib/csrf';
import { forgotPasswordAction } from '../actions';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | LexiFlow',
  description: 'Reset your LexiFlow password - Enterprise Legal OS',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

export default async function ForgotPasswordPage() {
  await checkAuth();

  // Get CSRF token for form protection (Server Action will generate if needed)
  const csrfToken = await getCSRFToken();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Forgot Password Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30">
              <KeyIcon className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Forgot Password?</h2>
            <p className="mt-2 text-sm text-slate-400">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          <Suspense fallback={<FormSkeleton />}>
            <ForgotPasswordForm action={forgotPasswordAction} csrfToken={csrfToken} />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
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
      <div className="h-10 animate-pulse rounded-md bg-slate-700 mt-4" />
    </div>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}
