/**
 * SSO Login Options Component
 *
 * Displays available SSO providers for login
 *
 * @module components/auth/SSOLoginOptions
 */

import { useState } from 'react';

import { useAuthActions } from '@/providers/application/authprovider';

import type { SSOProvider } from '@/lib/auth/types';

interface SSOLoginOptionsProps {
  providers?: SSOProvider[];
  onProviderClick?: (providerId: string) => void;
}

// Default SSO providers (in production, these would come from API/config)
const DEFAULT_PROVIDERS: SSOProvider[] = [
  {
    id: 'azure-ad',
    name: 'Microsoft Azure AD',
    type: 'saml',
    enabled: true,
    loginUrl: '/auth/sso/azure-ad',
    logoUrl: 'https://cdn.simpleicons.org/microsoftazure/0078D4',
  },
  {
    id: 'okta',
    name: 'Okta',
    type: 'saml',
    enabled: true,
    loginUrl: '/auth/sso/okta',
    logoUrl: 'https://cdn.simpleicons.org/okta/007DC1',
  },
  {
    id: 'google',
    name: 'Google Workspace',
    type: 'oauth',
    enabled: true,
    loginUrl: '/auth/sso/google',
    logoUrl: 'https://cdn.simpleicons.org/google/4285F4',
  },
];

export function SSOLoginOptions({ providers = DEFAULT_PROVIDERS, onProviderClick }: SSOLoginOptionsProps) {
  const { loginWithSSO } = useAuthActions();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleProviderClick = async (provider: SSOProvider) => {
    if (!provider.enabled) return;

    setIsLoading(provider.id);

    try {
      if (onProviderClick) {
        onProviderClick(provider.id);
      } else {
        await loginWithSSO(provider.id);
      }
    } catch (error) {
      console.error('SSO login failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const enabledProviders = providers.filter(p => p.enabled);

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {enabledProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderClick(provider)}
            disabled={isLoading === provider.id}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors group"
          >
            {provider.logoUrl && (
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="w-5 h-5"
              />
            )}
            <span className="text-white font-medium">
              {isLoading === provider.id ? 'Redirecting...' : provider.name}
            </span>
            {isLoading === provider.id && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Enterprise SSO authentication via SAML 2.0
      </p>
    </div>
  );
}
