'use client';

/**
 * Forgot Password Form Client Component
 * Handles email submission for password reset
 */

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { AuthFormState } from '../types';

interface ForgotPasswordFormProps {
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  csrfToken: string;
}

const initialState: AuthFormState = {
  success: false,
  message: undefined,
  error: undefined,
  fieldErrors: undefined,
};

export function ForgotPasswordForm({ action, csrfToken }: ForgotPasswordFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Show success state after submission
  if (state.success) {
    const email = (state.data as { email?: string })?.email || submittedEmail;

    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <CheckIcon className="h-7 w-7 text-emerald-400" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-white">
          Check Your Email
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {state.message || 'If an account exists with this email, you will receive password reset instructions.'}
        </p>

        {email && (
          <p className="text-sm text-slate-300 mb-6 p-3 bg-slate-700/50 rounded-md border border-slate-600">
            Sent to: <span className="font-medium text-white">{email}</span>
          </p>
        )}

        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Didn&apos;t receive an email? Check your spam folder or try a different email.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Try a different email
          </button>
        </div>

        {/* Return to Login */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setSubmittedEmail(formData.get('email') as string);
        return formAction(formData);
      }}
      className="space-y-4"
    >
      {/* CSRF Token */}
      <input type="hidden" name="_csrf" value={csrfToken} />

      {/* Error Message */}
      {state.error && (
        <div className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-400">
          <div className="flex items-center gap-2">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {state.error}
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
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-rose-400">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <SubmitButton />

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Sending...
        </span>
      ) : (
        'Send Reset Instructions'
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
