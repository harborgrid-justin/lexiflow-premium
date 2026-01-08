'use client';

/**
 * Forgot Password Form Client Component
 */

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import type { AuthResult } from '../actions';

interface ForgotPasswordFormProps {
  action: (formData: FormData) => Promise<AuthResult>;
}

export function ForgotPasswordForm({ action }: ForgotPasswordFormProps) {
  const [state, formAction] = useActionState(
    async (_prevState: AuthResult | null, formData: FormData) => {
      return await action(formData);
    },
    null
  );

  const [emailSent, setEmailSent] = useState(false);

  if (state?.success || emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
          Check your email
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {state?.message ||
            "If an account exists with this email, you will receive a password reset link."}
        </p>
        <button
          type="button"
          onClick={() => setEmailSent(false)}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
          placeholder="you@example.com"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-800"
    >
      {pending ? 'Sending...' : 'Send reset link'}
    </button>
  );
}
