/**
 * MFA Verification Component
 *
 * Prompts user to enter their MFA code during login
 *
 * @module components/auth/MFAVerification
 */

import { useAuthActions } from '@/contexts/auth/AuthProvider';
import React, { useState } from 'react';

interface MFAVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MFAVerification({ onSuccess, onCancel }: MFAVerificationProps) {
  const { verifyMFA } = useAuthActions();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await verifyMFA(code);

      if (success) {
        onSuccess?.();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
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
          <p className="text-slate-400">Two-Factor Authentication</p>
        </div>

        {/* MFA Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Verify Your Identity
            </h2>
            <p className="text-slate-400 text-center text-sm">
              {useBackupCode
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-300 mb-2">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <input
                id="mfa-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white font-mono text-2xl text-center tracking-widest focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Alternative Options */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
            </button>
          </div>

          {/* Cancel */}
          {onCancel && (
            <div className="mt-4">
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Cancel and return to login
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Lost your device?{' '}
            <a href="/auth/recovery" className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
