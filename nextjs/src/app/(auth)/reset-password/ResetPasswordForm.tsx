'use client';

/**
 * Reset Password Form Client Component
 * Handles new password submission with strength indicator
 */

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AuthFormState } from '../types';
import { validatePasswordStrength } from '../validation';

interface ResetPasswordFormProps {
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  token: string;
}

const initialState: AuthFormState = {
  success: false,
  message: undefined,
  error: undefined,
  fieldErrors: undefined,
};

export function ResetPasswordForm({ action, token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    label: string;
    color: string;
  } | null>(null);

  // Handle successful password reset
  useEffect(() => {
    if (state.success) {
      // Redirect to login with success message after short delay
      const timer = setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Update password strength
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Show success state
  if (state.success) {
    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <CheckIcon className="h-7 w-7 text-emerald-400" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-white">
          Password Reset Successful
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {state.message || 'Your password has been reset successfully.'}
        </p>

        <p className="text-xs text-slate-500 mb-4">
          Redirecting to login...
        </p>

        <Link
          href="/login"
          className="inline-flex justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden token field */}
      <input type="hidden" name="token" value={token} />

      {/* Error Message */}
      {state.error && (
        <div className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
          <div className="flex items-center gap-2">
            <AlertIcon className="h-4 w-4 flex-shrink-0" />
            {state.error}
          </div>
        </div>
      )}

      {/* New Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300"
        >
          New Password
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 pr-10 text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p className="mt-1 text-sm text-rose-400">
            {state.fieldErrors.password[0]}
          </p>
        )}

        {/* Password Strength Indicator */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Password Strength:</span>
              <span className="text-xs text-slate-300">{passwordStrength.label}</span>
            </div>
            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
              />
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordStrength.feedback.map((tip, index) => (
                  <li key={index} className="text-xs text-slate-400 flex items-start">
                    <span className="text-amber-400 mr-1">-</span>
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
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-slate-300"
        >
          Confirm New Password
        </label>
        <div className="relative mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 pr-10 text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Repeat your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-sm text-rose-400">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <SubmitButton disabled={passwordStrength ? passwordStrength.score < 2 : true} />

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-slate-700">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to login
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Resetting Password...
        </span>
      ) : (
        'Reset Password'
      )}
    </button>
  );
}

// Icon Components
function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
