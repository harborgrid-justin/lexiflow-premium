import React, { useState } from 'react';
import { Building2, Shield, ArrowRight, Loader2 } from 'lucide-react';

/**
 * SSO Login Button Component
 * Provides SAML 2.0 Single Sign-On login functionality
 */

interface SSOLoginButtonProps {
  organizationId?: string;
  onLogin?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const SSOLoginButton: React.FC<SSOLoginButtonProps> = ({
  organizationId,
  onLogin,
  onError,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState(organizationId || '');
  const [showOrgInput, setShowOrgInput] = useState(!organizationId);

  const handleSSOLogin = async () => {
    if (!orgId) {
      setShowOrgInput(true);
      return;
    }

    setLoading(true);

    try {
      // Redirect to SAML SSO login endpoint
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const ssoUrl = `${apiBaseUrl}/auth/saml/login/${encodeURIComponent(orgId)}`;

      // Store return URL
      sessionStorage.setItem('sso_return_url', window.location.pathname);

      // Redirect to SSO provider
      window.location.href = ssoUrl;
    } catch (error) {
      setLoading(false);
      onError?.(error as Error);
    }
  };

  if (showOrgInput && !organizationId) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Enterprise SSO Login
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Sign in using your organization's SAML 2.0 identity provider
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="Enter organization ID"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSSOLogin}
                  disabled={loading || !orgId}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with SSO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSSOLogin}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Redirecting to SSO...</span>
        </>
      ) : (
        <>
          <Building2 className="w-5 h-5" />
          <span>Sign in with SSO</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
};

/**
 * SSO Login Card Component
 * Full card UI for SSO login
 */
export const SSOLoginCard: React.FC<{
  title?: string;
  description?: string;
  organizationId?: string;
  onLogin?: (result: any) => void;
  onError?: (error: Error) => void;
}> = ({
  title = 'Enterprise Sign-In',
  description = 'Access your account using your organization\'s identity provider',
  organizationId,
  onLogin,
  onError,
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
          <p className="text-blue-100 text-center text-sm">{description}</p>
        </div>

        <div className="p-6">
          <SSOLoginButton
            organizationId={organizationId}
            onLogin={onLogin}
            onError={onError}
            className="w-full"
          />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-2 text-xs text-gray-600">
              <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p>
                Your organization uses SAML 2.0 for secure authentication.
                You'll be redirected to your identity provider to sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSOLoginButton;
