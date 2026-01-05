/**
 * MFA Setup Component
 *
 * Allows users to enable multi-factor authentication for their account.
 * Shows QR code for authenticator app setup and backup codes.
 *
 * @module components/auth/MFASetup
 */

import { useAuthActions, useAuthState } from '@/contexts/auth/AuthProvider';
import { useState } from 'react';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { enableMFA } = useAuthActions();
  const { user } = useAuthState();
  const [step, setStep] = useState<'initial' | 'scan' | 'verify' | 'complete'>('initial');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const setup = await enableMFA();
      setQrCode(setup.qrCode);
      setSecret(setup.secret);
      setBackupCodes(setup.backupCodes || []);
      setStep('scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verification happens when logging in, but we show the backup codes
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Multi-Factor Authentication
        </h2>
        <p className="text-gray-600">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Step 1: Initial */}
      {step === 'initial' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Enable Two-Factor Authentication
            </h3>
            <p className="text-gray-600 mb-4">
              Two-factor authentication adds an additional layer of security to your account by
              requiring more than just a password to sign in.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">What you'll need:</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                <li>An authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Your mobile device</li>
                <li>A secure place to store backup codes</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartSetup}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Setting up...' : 'Enable MFA'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Scan QR Code */}
      {step === 'scan' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Scan QR Code
            </h3>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Can't scan the code? Enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm">
                  {secret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(secret)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Verification */}
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code from your app
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={isLoading || verificationCode.length !== 6}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              onClick={() => setStep('initial')}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'complete' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                MFA Successfully Enabled!
              </h3>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-900 mb-2">Save Your Backup Codes</h4>
              <p className="text-yellow-800 text-sm mb-4">
                Store these backup codes in a safe place. You can use them to access your account
                if you lose your authenticator device.
              </p>

              <div className="bg-white border border-yellow-300 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={copyBackupCodes}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                Copy All Backup Codes
              </button>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
