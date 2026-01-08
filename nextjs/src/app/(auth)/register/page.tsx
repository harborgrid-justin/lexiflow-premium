/**
 * Register Page - Next.js 16 Server Component
 * Enterprise registration with validation
 *
 * @module app/(auth)/register/page
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCSRFToken } from '../../../lib/csrf';
import { registerAction } from '../actions';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | LexiFlow',
  description: 'Create your LexiFlow account - Enterprise Legal OS',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

interface RegisterPageProps {
  searchParams: Promise<{
    plan?: string;
    from?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await checkAuth();

  // Await searchParams (Next.js 16 requirement)
  const resolvedParams = await searchParams;
  const plan = resolvedParams.plan;

  // Get CSRF token for form protection (Server Action will generate if needed)
  const csrfToken = await getCSRFToken();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Register Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">Create Account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start your free trial. No credit card required.
            </p>
          </div>

          {/* Plan Badge */}
          {plan && (
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md text-center">
              <p className="text-sm text-blue-400">
                Creating account for{' '}
                <span className="font-semibold capitalize">{plan}</span> plan
              </p>
            </div>
          )}

          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm action={registerAction} csrfToken={csrfToken} />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Already have an account?{' '}
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

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
          <div className="h-10 animate-pulse rounded-md bg-slate-700" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
          <div className="h-10 animate-pulse rounded-md bg-slate-700" />
        </div>
      </div>
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
