'use client';

/**
 * Enhanced Login Form with MFA Support
 * Handles standard login + TOTP verification
 */

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { loginAction, loginWithMfaAction } from '../actions';
import type { AuthFormState } from '../types';

interface EnhancedLoginFormProps {
  callbackUrl: string;
  showMfaFirst?: boolean;
}

const initialState: AuthFormState = {
  success: false,
  message: undefined,
  error: undefined,
  fieldErrors: undefined,
};

export function EnhancedLoginForm({ callbackUrl, showMfaFirst = false }: EnhancedLoginFormProps) {
  const router = useRouter();
  const [showMfa, setShowMfa] = useState(showMfaFirst);
  const [mfaMethod, setMfaMethod] = useState<string>('totp');
  const [loginState, loginFormAction] = useActionState(loginAction, initialState);
  const [mfaState, mfaFormAction] = useActionState(loginWithMfaAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  // MFA code input refs for auto-focus
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);

  // Handle successful login
  useEffect(() => {
    if (loginState.success || mfaState.success) {
      router.push(callbackUrl);
      router.refresh();
    }
  }, [loginState.success, mfaState.success, callbackUrl, router]);

  // Handle MFA required
  useEffect(() => {
    if (loginState.error === 'MFA_REQUIRED') {
      setShowMfa(true);
      const data = loginState.data as { mfaMethod?: string } | undefined;
      if (data?.mfaMethod) {
        setMfaMethod(data.mfaMethod);
      }
    }
  }, [loginState.error, loginState.data]);

  // Handle MFA code input
  const handleMfaCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...mfaCode];
    newCode[index] = value.slice(-1);
    setMfaCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace in MFA code
  const handleMfaCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for MFA code
  const handleMfaCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...mfaCode];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setMfaCode(newCode);
    codeInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Reset to login form
  const handleBackToLogin = () => {
    setShowMfa(false);
    setMfaCode(['', '', '', '', '', '']);
  };

  const currentState = showMfa ? mfaState : loginState;

  if (showMfa) {
    return (
      <form action={mfaFormAction} className="space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackToLogin}
          className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to login
        </button>

        {/* MFA Instructions */}
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-slate-300">
            {mfaMethod === 'totp'
              ? 'Enter the 6-digit code from your authenticator app'
              : mfaMethod === 'sms'
              ? 'Enter the code sent to your phone'
              : 'Enter the code sent to your email'}
          </p>
        </div>

        {/* Error Message */}
        {currentState.error && currentState.error !== 'MFA_REQUIRED' && (
          <div className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
            {currentState.error}
          </div>
        )}

        {/* MFA Code Input */}
        <div className="flex justify-center gap-2" onPaste={handleMfaCodePaste}>
          {mfaCode.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { codeInputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleMfaCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleMfaCodeKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Hidden input for form submission */}
        <input type="hidden" name="mfaCode" value={mfaCode.join('')} />

        <MfaSubmitButton disabled={mfaCode.some(d => !d)} />

        {/* Resend Code */}
        {mfaMethod !== 'totp' && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Didn&apos;t receive the code? Resend
            </button>
          </div>
        )}

        {/* Recovery Options */}
        <div className="text-center pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Having trouble?{' '}
            <Link
              href="/auth/recovery"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Use a backup code
            </Link>
          </p>
        </div>
      </form>
    );
  }

  return (
    <form action={loginFormAction} className="space-y-4">
      {/* Error Message */}
      {currentState.error && currentState.error !== 'MFA_REQUIRED' && (
        <div className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
          <div className="flex items-center gap-2">
            <AlertIcon className="h-4 w-4 flex-shrink-0" />
            {currentState.error}
          </div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-300"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          placeholder="you@example.com"
        />
        {currentState.fieldErrors?.email && (
          <p className="mt-1 text-sm text-rose-400">
            {currentState.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 pr-10 text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {currentState.fieldErrors?.password && (
          <p className="mt-1 text-sm text-rose-400">
            {currentState.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            value="true"
            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
          />
          <span className="text-sm text-slate-400">
            Remember this device for 30 days
          </span>
        </label>
      </div>

      <LoginSubmitButton />

      {/* Register Link */}
      <div className="mt-6 text-center pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Signing in...
        </span>
      ) : (
        'Sign in'
      )}
    </button>
  );
}

function MfaSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Verifying...
        </span>
      ) : (
        'Verify'
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
