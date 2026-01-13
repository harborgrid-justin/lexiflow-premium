/**
 * Enterprise Login Page
 *
 * Enhanced login with MFA, SSO, and enterprise features
 */

import { AccountLockedMessage } from '@/components/auth/AccountLockedMessage';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { SSOLoginOptions } from '@/components/auth/SSOLoginOptions';
import { useAuthActions, useAuthState } from '@/contexts/auth/AuthProvider';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

export default function EnterpriseLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthActions();
  const { requiresMFA, user } = useAuthState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountLocked, setAccountLocked] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('[Login] Attempting login with:', email);
      const result = await login(email, password);

      if (result.success) {
        // Check if account is locked
        if (user?.accountLocked) {
          setAccountLocked(true);
          return;
        }

        // Login successful, redirect
        navigate('/dashboard');
      } else if (!result.mfaRequired && !requiresMFA) {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      const message = err instanceof Error ? err.message : 'An error occurred during login';

      // Check for account locked error
      if (message.includes('locked')) {
        setAccountLocked(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASuccess = () => {
    navigate('/dashboard');
  };

  const handleMFACancel = () => {
    // Reset state and go back to login
    setError(null);
    setPassword('');
  };

  // Show account locked message
  if (accountLocked) {
    return <AccountLockedMessage reason="failed_attempts" />;
  }

  // Show MFA verification if required
  if (requiresMFA) {
    return <MFAVerification onSuccess={handleMFASuccess} onCancel={handleMFACancel} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* SSO Options */}
          <div className="mt-6">
            <SSOLoginOptions />
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center mb-3">Demo Credentials</p>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Email: <code className="bg-slate-700/50 px-2 py-1 rounded">admin@lexiflow.com</code></p>
              <p>Password: <code className="bg-slate-700/50 px-2 py-1 rounded">Demo123!</code></p>
            </div>
          </div>
        </div>

        {/* Security Features Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-slate-400">Enterprise-grade security with MFA & SSO</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 LexiFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
