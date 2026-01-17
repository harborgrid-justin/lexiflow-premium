/**
 * Forgot Password Page
 *
 * Handles password reset request
 */

import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';

import { AuthApiService } from '@/lib/frontend-api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('[ForgotPassword] Requesting password reset for:', email);

      const authApi = new AuthApiService();
      await authApi.forgotPassword(email);

      setSuccess(true);
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
            <p className="text-slate-400">Enterprise Legal OS</p>
          </div>

          {/* Success Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Check Your Email</h2>
              <p className="text-slate-400 mb-6">
                We've sent password reset instructions to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-sm text-slate-500 mb-6">
                If you don't see the email, check your spam folder.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Login
            </Link>
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
