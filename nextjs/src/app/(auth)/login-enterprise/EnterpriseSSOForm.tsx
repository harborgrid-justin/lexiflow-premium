'use client';

/**
 * Enterprise SSO Form Component
 * Handles organization domain lookup and SSO provider selection
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { initiateSSOAction } from '../actions';

interface SSOProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface EnterpriseSSOFormProps {
  callbackUrl: string;
  defaultProviders: SSOProvider[];
  enterpriseProviders: SSOProvider[];
  initialDomain?: string;
}

export function EnterpriseSSOForm({
  callbackUrl,
  defaultProviders,
  enterpriseProviders,
  initialDomain,
}: EnterpriseSSOFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [showProviders, setShowProviders] = useState(!!initialDomain);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain || '');

  // Extract domain from email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const domain = email.split('@')[1];
    setSelectedDomain(domain);
    setShowProviders(true);
  };

  // Handle SSO provider selection
  const handleProviderSelect = async (providerId: string) => {
    setError(null);

    startTransition(async () => {
      const result = await initiateSSOAction(providerId, callbackUrl);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.redirectUrl) {
        // Redirect to SSO provider
        window.location.href = result.redirectUrl;
      }
    });
  };

  // Back to email entry
  const handleBack = () => {
    setShowProviders(false);
    setSelectedDomain('');
    setError(null);
  };

  const allProviders = [...enterpriseProviders, ...defaultProviders];

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {!showProviders ? (
        // Step 1: Email Entry
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              Work Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="you@company.com"
            />
            <p className="mt-2 text-xs text-slate-500">
              Enter your work email to find your organization&apos;s SSO provider
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
          >
            Continue
          </button>
        </form>
      ) : (
        // Step 2: Provider Selection
        <div className="space-y-4">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Use a different email
          </button>

          {/* Domain Display */}
          {selectedDomain && (
            <div className="p-3 bg-slate-700/50 rounded-md border border-slate-600">
              <p className="text-sm text-slate-300">
                Signing in with: <span className="font-medium text-white">{email || `user@${selectedDomain}`}</span>
              </p>
            </div>
          )}

          {/* Provider Buttons */}
          <div className="space-y-3">
            {enterpriseProviders.length > 0 && (
              <>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Organization SSO
                </p>
                {enterpriseProviders.map((provider) => (
                  <SSOProviderButton
                    key={provider.id}
                    provider={provider}
                    onClick={() => handleProviderSelect(provider.id)}
                    isPending={isPending}
                  />
                ))}
              </>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800 px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {defaultProviders.map((provider) => (
              <SSOProviderButton
                key={provider.id}
                provider={provider}
                onClick={() => handleProviderSelect(provider.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SSOProviderButton({
  provider,
  onClick,
  isPending,
}: {
  provider: SSOProvider;
  onClick: () => void;
  isPending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="flex w-full items-center gap-3 rounded-md border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      <ProviderIcon icon={provider.icon} />
      <div className="flex-1 text-left">
        <p className="font-medium">{provider.name}</p>
        <p className="text-xs text-slate-400">{provider.description}</p>
      </div>
      <ChevronRightIcon className="w-5 h-5 text-slate-400" />
    </button>
  );
}

function ProviderIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg className="h-6 w-6" viewBox="0 0 24 24">
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
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF" />
        <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900" />
        <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022" />
        <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00" />
      </svg>
    ),
    okta: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" className="text-blue-500" />
      </svg>
    ),
    azure: (
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#0078D4" />
      </svg>
    ),
    key: (
      <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  };

  return icons[icon] || icons.key;
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
