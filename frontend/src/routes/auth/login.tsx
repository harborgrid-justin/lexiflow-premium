/**
 * Login Page
 *
 * Handles user authentication with email/password
 */

import { type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useFormError } from '@/hooks/routes';
import { useAuthActions } from '@/providers/application/authprovider';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { errors, setError, clearAll, hasError } = useFormError();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearAll();

    // Validate inputs
    if (!email.trim() || !password) {
      setError('__global__', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Attempting login with:', email);
      const result = await login(email, password);
      console.log('[Login] Login result:', result);
      if (result.success) {
        // Redirect to the original destination or dashboard
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } else if (result.mfaRequired) {
        setError('__global__', 'Multi-factor verification required. Please complete MFA using the enterprise login experience.');
      } else {
        setError('__global__', 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      setError('__global__', err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

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
          {hasError('__global__') && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {errors.__global__}
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
                suppressHydrationWarning
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                suppressHydrationWarning
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

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center mb-3">Demo Credentials</p>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Email: <code className="bg-slate-700/50 px-2 py-1 rounded">admin@lexiflow.com</code></p>
              <p>Password: <code className="bg-slate-700/50 px-2 py-1 rounded">Demo123!</code></p>
            </div>
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
