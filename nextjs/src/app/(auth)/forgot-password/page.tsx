/**
 * Forgot Password Page - Next.js 16 Server Component
 *
 * @module app/(auth)/forgot-password/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { forgotPassword } from '../actions';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | LexiFlow',
  description: 'Reset your LexiFlow password',
};

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

export default async function ForgotPasswordPage() {
  await checkAuth();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            LexiFlow
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Legal practice management platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 text-center text-xl font-semibold text-slate-900 dark:text-white">
            Forgot your password?
          </h2>
          <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <ForgotPasswordForm action={forgotPassword} />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
