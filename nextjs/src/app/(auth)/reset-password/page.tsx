/**
 * Reset Password Page - Next.js 16 Server Component
 * Set new password with token from email link
 *
 * @module app/(auth)/reset-password/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { resetPasswordAction } from '../actions';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | LexiFlow',
  description: 'Set a new password for your LexiFlow account',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  await checkAuth();

  // Await searchParams (Next.js 16 requirement)
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;
  const email = resolvedParams.email;

  // No token provided - show error
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto w-full max-w-md px-4">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
            <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
          </div>

          {/* Error Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
                <AlertIcon className="h-7 w-7 text-rose-400" />
              </div>

              <h2 className="mb-2 text-2xl font-semibold text-white">
                Invalid Reset Link
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                This password reset link is invalid or has expired.
                Please request a new one.
              </p>

              <Link
                href="/forgot-password"
                className="inline-flex justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
              >
                Request New Link
              </Link>
            </div>
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

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Reset Password Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30">
              <LockIcon className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Set New Password</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create a strong password for your account.
            </p>
          </div>

          {/* Email display */}
          {email && (
            <div className="mb-6 p-3 bg-slate-700/50 rounded-md border border-slate-600 text-center">
              <p className="text-sm text-slate-400">
                Resetting password for:{' '}
                <span className="font-medium text-white">{email}</span>
              </p>
            </div>
          )}

          <Suspense fallback={<FormSkeleton />}>
            <ResetPasswordForm action={resetPasswordAction} token={token} />
          </Suspense>
        </div>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Password Tips</h3>
          <ul className="space-y-1 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              Use at least 8 characters
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              Include uppercase and lowercase letters
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              Add numbers and special characters
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              Avoid common words or personal info
            </li>
          </ul>
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
        <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
        <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
        <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      </div>
      <div className="h-10 animate-pulse rounded-md bg-slate-700 mt-4" />
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
