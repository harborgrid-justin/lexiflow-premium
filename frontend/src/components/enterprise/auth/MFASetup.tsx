/**
 * MFASetup Component
 * Multi-Factor Authentication setup and management interface
 *
 * Features:
 * - QR code display for authenticator app setup
 * - Manual entry key display
 * - Verification code validation
 * - Backup codes generation and display
 * - MFA disable functionality
 * - Copy-to-clipboard for keys and backup codes
 * - WCAG 2.1 AA compliant
 */

import { AuthApiService } from '@/api/auth/auth-api';
import React, { useState } from 'react';
import { z } from 'zod';

const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

export interface MFASetupProps {
  isEnabled: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type SetupStep = 'qr-display' | 'verify' | 'backup-codes' | 'complete';

export const MFASetup: React.FC<MFASetupProps> = ({
  isEnabled: initialEnabled,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [step, setStep] = useState<SetupStep>('qr-display');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  // LAYOUT STABILITY: Backup codes are immutable once generated
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const authService = new AuthApiService();

  const initializeMFASetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.enableMFA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep('qr-display');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize MFA setup';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeMFASetup();
  }, []);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      verificationSchema.parse({ code: verificationCode });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Invalid code');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyMFA(verificationCode);

      if (response.verified) {
        setBackupCodes(response.backupCodes || []);
        setStep('backup-codes');
        setIsEnabled(true);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.disableMFA();
      setIsEnabled(false);
      setStep('qr-display');
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setError('Clipboard not available');
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Clipboard error:', error);
      setError('Failed to copy to clipboard');
    }
  };

  const handleComplete = () => {
    setStep('complete');
    onSuccess?.();
  };

  const formatSecretKey = (key: string): string => {
    return key.match(/.{1,4}/g)?.join(' ') || key;
  };

  if (isEnabled && step === 'qr-display') {
    return (
      <div className={`w-full max-w-2xl ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="mt-2 text-sm text-gray-600">MFA is currently enabled on your account</p>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enabled
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Your account is protected</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Two-factor authentication adds an extra layer of security to your account by requiring a verification code when signing in.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleDisableMFA}
              disabled={isLoading}
              className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Disabling...' : 'Disable MFA'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup-codes') {
    return (
      <div className={`w-full max-w-2xl ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Save Your Backup Codes</h2>
            <p className="mt-2 text-sm text-gray-600">
              Store these backup codes in a safe place. Each code can be used once if you lose access to your authenticator app.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  These codes will only be shown once. Download or print them now.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded border border-gray-300"
                >
                  <span className="text-gray-900">{code}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(code, `code-${index}`)}
                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`Copy code ${index + 1}`}
                  >
                    {copiedItem === `code-${index}` ? (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                const codesText = backupCodes.join('\n');
                const blob = new Blob([codesText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lexiflow-mfa-backup-codes.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Download Codes
            </button>

            <button
              type="button"
              onClick={handleComplete}
              className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className={`w-full max-w-2xl ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Setup</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app to verify the setup
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep('qr-display')}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // QR Display Step
  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Enable Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            Scan the QR code with your authenticator app or enter the key manually
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-3">1. Scan QR Code</h3>
                {qrCode ? (
                  <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block">
                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="bg-gray-100 w-48 h-48 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-3">2. Or Enter Key Manually</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Your secret key:</p>
                  <div className="flex items-center justify-between bg-white px-4 py-3 rounded border border-gray-300 font-mono text-sm break-all">
                    <span className="text-gray-900">{formatSecretKey(secret)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(secret, 'secret')}
                      className="ml-2 flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label="Copy secret key"
                    >
                      {copiedItem === 'secret' ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter this key in your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('verify')}
                className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ml-auto"
              >
                Continue to Verification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
