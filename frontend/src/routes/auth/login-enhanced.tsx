/**
 * Enhanced Login Page
 *
 * Enterprise-grade login with:
 * - Email/password authentication
 * - Zod validation
 * - Remember me functionality
 * - MFA support (TOTP)
 * - Forgot password link
 * - Professional UI/UX
 * - Error handling
 * - Loading states
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { useAuthActions, useAuthState } from '@/providers/application/authprovider';
import {
  loginSchema,
  mfaCodeSchema,
  type LoginFormData,
} from '@/services/validation/authSchemas';

export default function LoginPage() {
  const navigate = useNavigate();
  const { error: authError } = useAuthState();
  const { login, verifyMFA, clearError } = useAuthActions();

  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as unknown as Resolver<LoginFormData>,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle regular login
  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setMfaError(null);
    setIsSubmitting(true);

    try {
      const result = await login(
        data.email,
        data.password,
        data.rememberMe
      );

      if (result.mfaRequired) {
        setShowMfa(true);
        setIsSubmitting(false);
        return;
      }

      if (result.success) {
        // Redirect to dashboard or intended destination
        const from = new URLSearchParams(window.location.search).get('from');
        navigate(from || '/dashboard');
      }
    } catch (err) {
      console.error('[Login] Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle MFA submission
  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMfaError(null);

    // Validate MFA code
    const validation = mfaCodeSchema.safeParse(mfaCode);
    if (!validation.success) {
      setMfaError(validation.error.issues[0]?.message || 'Invalid code');
      return;
    }

    setIsSubmitting(true);

    try {
      const verified = await verifyMFA(mfaCode);

      if (verified) {
        const from = new URLSearchParams(window.location.search).get('from');
        navigate(from || '/dashboard');
      } else {
        setMfaError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('[Login] MFA error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset MFA state
  const handleBackToLogin = () => {
    setShowMfa(false);
    setMfaCode('');
    setMfaError(null);
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          {!showMfa ? (
            <>
              {/* Login Form */}
              <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>

              {/* Error Message */}
              {authError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-slate-300">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="mr-2 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/auth/register"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* MFA Form */}
              <div className="mb-6">
                <button
                  onClick={handleBackToLogin}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to login
                </button>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter the 6-digit code from your authenticator app
              </p>

              {/* Error Message */}
              {(authError || mfaError) && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
                  {authError || mfaError}
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {/* MFA Code Field */}
                <div>
                  <label
                    htmlFor="mfaCode"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Authentication Code
                  </label>
                  <input
                    id="mfaCode"
                    type="text"
                    value={mfaCode}
                    onChange={(e) => {
                      setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setMfaError(null);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || mfaCode.length !== 6}
                  className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </>
          )}

          {/* Demo Credentials (only show on non-MFA screen) */}
          {!showMfa && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center mb-3">Demo Credentials</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p>
                  Email:{' '}
                  <code className="bg-slate-700/50 px-2 py-1 rounded">
                    admin@lexiflow.com
                  </code>
                </p>
                <p>
                  Password:{' '}
                  <code className="bg-slate-700/50 px-2 py-1 rounded">Demo123!</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 LexiFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
