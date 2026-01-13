/**
 * ForgotPasswordForm Component
 * Password reset request form with email verification
 *
 * Features:
 * - Email validation
 * - Rate limiting awareness
 * - Success confirmation
 * - Back to login navigation
 * - Form validation with Zod
 * - WCAG 2.1 AA compliant
 */

import { AuthApiService } from '@/api/auth/auth-api';
import { useState } from 'react';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

type FormStep = 'email' | 'success';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
  className = '',
}) => {
  const [step, setStep] = useState<FormStep>('email');
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const authService = new AuthApiService();

  const validateForm = (): boolean => {
    try {
      forgotPasswordSchema.parse(formData);
      setError('');
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Invalid email');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(formData.email);
      setStep('success');
      onSuccess?.();
    } catch (error) {
      console.error('Password reset error:', error);
      // For security, don't reveal if email exists or not
      // Show success message anyway to prevent email enumeration
      setStep('success');
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (error) {
      setError('');
    }
  };

  if (step === 'success') {
    return (
      <div className={`w-full max-w-md ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="text-center">
            {/* Success icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-sm text-gray-600 mb-6">
              If an account exists for <strong>{formData.email}</strong>, you will receive password
              reset instructions shortly.
            </p>

            {/* Information box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-800 font-medium mb-2">What to do next:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Check your email inbox and spam folder</li>
                    <li>• Click the reset link within 1 hour</li>
                    <li>• If you don't receive an email, try again in a few minutes</li>
                    <li>• Contact support if you continue to have issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {onBackToLogin && (
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Login
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="you@company.com"
              disabled={isLoading}
              required
              autoFocus
            />
            {error && (
              <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !formData.email}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Sending...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {onBackToLogin && (
              <button
                type="button"
                onClick={onBackToLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Security notice */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-xs text-gray-700">
              <strong>Security Note:</strong> Password reset links expire after 1 hour. For your
              security, we limit password reset requests to prevent abuse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
