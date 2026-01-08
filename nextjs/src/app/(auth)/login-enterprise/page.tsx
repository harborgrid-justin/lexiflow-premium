/**
 * Enterprise SSO Login Page - Next.js 16 Server Component
 * Supports SAML, OAuth (Google, Microsoft, Okta, Auth0)
 *
 * @module app/(auth)/login-enterprise/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { EnterpriseSSOForm } from './EnterpriseSSOForm';

export const metadata: Metadata = {
  title: 'Enterprise Login | LexiFlow',
  description: 'Enterprise Single Sign-On for LexiFlow - Connect with your organization identity provider',
};

// Check if already authenticated (Next.js 16 async cookies)
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
}

// Mock function to get SSO providers for an organization
// In production, this would fetch from database based on organization domain
async function getSSOProviders(domain?: string) {
  // Default providers available to all
  const defaultProviders = [
    {
      id: 'google',
      name: 'Google Workspace',
      icon: 'google',
      description: 'Sign in with your Google account',
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      icon: 'microsoft',
      description: 'Sign in with your Microsoft account',
    },
  ];

  // Enterprise providers (would be fetched based on org domain)
  const enterpriseProviders = domain ? [
    {
      id: 'okta',
      name: 'Okta',
      icon: 'okta',
      description: 'Sign in with your Okta account',
    },
    {
      id: 'azure-ad',
      name: 'Azure AD',
      icon: 'azure',
      description: 'Sign in with your Azure Active Directory',
    },
    {
      id: 'saml',
      name: 'SAML SSO',
      icon: 'key',
      description: 'Sign in with your organization SSO',
    },
  ] : [];

  return { defaultProviders, enterpriseProviders };
}

interface EnterpriseLoginPageProps {
  searchParams: Promise<{
    from?: string;
    domain?: string;
    error?: string;
  }>;
}

export default async function EnterpriseLoginPage({ searchParams }: EnterpriseLoginPageProps) {
  await checkAuth();

  // Await searchParams (Next.js 16 requirement)
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams.from || '/dashboard';
  const domain = resolvedParams.domain;
  const error = resolvedParams.error;

  const { defaultProviders, enterpriseProviders } = await getSSOProviders(domain);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">LexiFlow</h1>
          <p className="mt-2 text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Enterprise Login Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">Enterprise Sign In</h2>
            <p className="mt-2 text-sm text-slate-400">
              Connect with your organization&apos;s identity provider
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
              <div className="flex items-center gap-2">
                <AlertIcon className="h-4 w-4 flex-shrink-0" />
                {error === 'access_denied' && 'Access was denied. Please try again.'}
                {error === 'provider_error' && 'There was an error with the identity provider.'}
                {!['access_denied', 'provider_error'].includes(error) && error}
              </div>
            </div>
          )}

          <Suspense fallback={<FormSkeleton />}>
            <EnterpriseSSOForm
              callbackUrl={callbackUrl}
              defaultProviders={defaultProviders}
              enterpriseProviders={enterpriseProviders}
              initialDomain={domain}
            />
          </Suspense>
        </div>

        {/* Security Badges */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full">
            <ShieldIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-400">SOC 2 Compliant</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full">
            <LockIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-400">256-bit SSL</span>
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
            Not an enterprise user?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Create an account
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
      <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      <div className="h-10 animate-pulse rounded-md bg-slate-700" />
      <div className="h-10 animate-pulse rounded-md bg-slate-700" />
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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}
