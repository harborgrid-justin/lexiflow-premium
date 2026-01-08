/**
 * Register Page - Next.js 16 Server Component
 * Enterprise registration with validation
 *
 * @module app/(auth)/register/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { register } from '../actions';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | LexiFlow',
  description: 'Create your LexiFlow account to get started',
};

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

export default async function RegisterPage() {
  await checkAuth();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 dark:bg-slate-900">
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

        {/* Register Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-white">
            Create your account
          </h2>

          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm action={register} />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Already have an account?{' '}
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

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
