/**
 * Reset Password Page
 *
 * Handles password reset with token from email
 */

import { AuthApiService } from '@/lib/frontend-api';
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10">
                <svg
                  className="w-6 h-6 text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Invalid Reset Link</h2>
              <p className="text-slate-400 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ResetPassword] Resetting password with token');

      const authApi = new AuthApiService();
      await authApi.resetPassword(token, formData.password);

      // Redirect to login with success message
      navigate('/login?reset=success');
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Set New Password</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Enter your new password below.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="••••••••"
                autoComplete="new-password"
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
              {isLoading ? 'Resetting...' : 'Reset Password'}
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
