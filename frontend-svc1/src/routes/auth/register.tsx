/**
 * Registration Page
 *
 * User registration with:
 * - Comprehensive validation using Zod
 * - Password strength indicator
 * - Terms acceptance
 * - Professional UI/UX
 * - Error handling
 */

import { AuthApiService } from '@/api/auth/auth-api';
import {
  registerSchema,
  validatePasswordStrength,
  type RegisterFormData,
} from '@/services/validation/authSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: 0 | 1 | 2 | 3 | 4;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      organizationName: '',
      acceptTerms: false,
    },
  });

  // Watch password for strength validation
  const password = watch('password');

  // Update password strength on password change
  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePasswordStrength(password));
    }
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const authApi = new AuthApiService();
      await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Registration successful, redirect to login
      navigate('/auth/login?registered=true');
    } catch (err) {
      console.error('[Register] Error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get password strength color and label
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-rose-500';
      case 2:
        return 'bg-amber-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-emerald-500';
      default:
        return 'bg-slate-600';
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiFlow</h1>
          <p className="text-slate-400">Enterprise Legal OS</p>
        </div>

        {/* Registration Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Create Account</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-1">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  placeholder="John"
                  autoComplete="given-name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-rose-400">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-1">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-rose-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email <span className="text-rose-400">*</span>
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

            {/* Phone Field (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">
                Phone <span className="text-slate-500 text-xs">(Optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-rose-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-slate-300 mb-1">
                Organization <span className="text-slate-500 text-xs">(Optional)</span>
              </label>
              <input
                id="organizationName"
                type="text"
                {...register('organizationName')}
                placeholder="Law Firm Name"
                autoComplete="organization"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-rose-400">{errors.organizationName.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Password Strength:</span>
                    <span className="text-xs text-slate-300">
                      {getStrengthLabel(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordStrength.feedback.map((tip, index) => (
                        <li key={index} className="text-xs text-slate-400 flex items-start">
                          <span className="text-amber-400 mr-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Acceptance */}
            <div className="pt-2">
              <label className="flex items-start text-sm text-slate-300">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="mt-1 mr-2 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>{' '}
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-rose-400">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
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
