/**
 * SSOLogin Component
 * Single Sign-On integration for enterprise authentication
 *
 * Features:
 * - SAML 2.0 integration
 * - OAuth 2.0 / OpenID Connect
 * - Multiple SSO provider support
 * - Custom provider branding
 * - JIT (Just-In-Time) provisioning
 * - Error handling and recovery
 * - WCAG 2.1 AA compliant
 */

import React, { useState } from 'react';

import type { User } from '@/types';

export type SSOProvider =
  | 'saml'
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'onelogin'
  | 'auth0'
  | 'azure-ad'
  | 'custom';

export interface SSOProviderConfig {
  id: string;
  type: SSOProvider;
  name: string;
  displayName: string;
  icon?: React.ReactNode;
  iconUrl?: string;
  enabled: boolean;
  autoRedirect?: boolean;
  buttonColor?: string;
  buttonTextColor?: string;
  metadata?: {
    entityId?: string;
    ssoUrl?: string;
    clientId?: string;
    domain?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface SSOLoginProps {
  providers: SSOProviderConfig[];
  onSSOInitiate?: (provider: SSOProviderConfig) => void;
  onError?: (error: Error) => void;
  showDivider?: boolean;
  dividerText?: string;
  className?: string;
}

export const SSOLogin: React.FC<SSOLoginProps> = ({
  providers,
  onSSOInitiate,
  onError,
  showDivider = true,
  dividerText = 'Or continue with',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const enabledProviders = providers.filter((p) => p.enabled);

  const getDefaultIcon = (type: SSOProvider): React.ReactNode => {
    const iconClass = 'w-5 h-5';

    switch (type) {
      case 'google':
        return (
          <svg className={iconClass} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case 'microsoft':
      case 'azure-ad':
        return (
          <svg className={iconClass} viewBox="0 0 24 24">
            <path fill="#f25022" d="M1 1h10v10H1z" />
            <path fill="#00a4ef" d="M13 1h10v10H13z" />
            <path fill="#7fba00" d="M1 13h10v10H1z" />
            <path fill="#ffb900" d="M13 13h10v10H13z" />
          </svg>
        );
      case 'okta':
        return (
          <svg className={iconClass} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#007DC1" />
            <circle cx="12" cy="12" r="5" fill="white" />
          </svg>
        );
      case 'saml':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        );
    }
  };

  const handleSSOClick = async (provider: SSOProviderConfig) => {
    setIsLoading(provider.id);

    try {
      if (onSSOInitiate) {
        onSSOInitiate(provider);
      } else {
        // Default behavior: redirect to SSO URL
        const ssoUrl = `/api/auth/sso/${provider.type}/${provider.id}`;
        if (typeof window !== 'undefined') {
          window.location.href = ssoUrl;
        }
      }
    } catch (error) {
      onError?.(error as Error);
      setIsLoading(null);
    }
  };

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showDivider && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{dividerText}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {enabledProviders.map((provider) => {
          const isProviderLoading = isLoading === provider.id;
          const icon = provider.icon || getDefaultIcon(provider.type);

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleSSOClick(provider)}
              disabled={isProviderLoading}
              className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                provider.buttonColor ? '' : 'bg-white text-gray-700'
              }`}
              style={
                provider.buttonColor
                  ? {
                      backgroundColor: provider.buttonColor,
                      color: provider.buttonTextColor || '#ffffff',
                    }
                  : undefined
              }
            >
              {isProviderLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : provider.iconUrl ? (
                <img
                  src={provider.iconUrl}
                  alt={`${provider.displayName} logo`}
                  className="w-5 h-5 mr-3"
                />
              ) : (
                <span className="mr-3">{icon}</span>
              )}
              <span>
                {isProviderLoading
                  ? 'Connecting...'
                  : `Continue with ${provider.displayName}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * SSOCallback Component
 * Handles SSO callback and token exchange
 */
export interface SSOCallbackProps {
  onSuccess?: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const SSOCallback: React.FC<SSOCallbackProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error('Missing authorization code');
        }

        // Exchange code for tokens (implement based on your backend)
        const response = await fetch('/api/auth/sso/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete authentication');
        }

        const data = await response.json();
        setStatus('success');
        onSuccess?.(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        const error = err instanceof Error ? err : new Error(errorMessage);
        setStatus('error');
        setError(errorMessage);
        onError?.(error);
      }
    };

    processCallback();
  }, [onSuccess, onError]);

  if (status === 'processing') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Sign In
          </h2>
          <p className="text-gray-600">Please wait while we verify your credentials...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${className}`}>
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};
