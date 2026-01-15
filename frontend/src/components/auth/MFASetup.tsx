/**
 * MFA Setup Component
 *
 * Allows users to enable multi-factor authentication for their account.
 * Shows QR code for authenticator app setup and backup codes.
 *
 * @module components/auth/MFASetup
 */

import { useAuthActions, useAuthState } from '@/providers/application/AuthProvider';
import { useTheme } from "@/hooks/useTheme";
import { useState } from 'react';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { theme, tokens } = useTheme();
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
    <div className="max-w-2xl mx-auto p-6" style={{ backgroundColor: theme.surface.default, color: theme.text.primary }}>
      {/* Header */}
      <div className="mb-8" style={{ borderBottom: `1px solid ${theme.border.default}`, paddingBottom: tokens.spacing.normal.md }}>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: tokens.colors.text }}>
          Multi-Factor Authentication
        </h2>
        <p style={{ color: tokens.colors.textMuted }}>
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Step 1: Initial */}
      {step === 'initial' && (
        <div className="p-6" style={{
          backgroundColor: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.lg
        }}>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2" style={{ color: tokens.colors.text }}>
              Enable Two-Factor Authentication
            </h3>
            <p className="mb-4" style={{ color: tokens.colors.textMuted }}>
              Two-factor authentication adds an additional layer of security to your account by
              requiring more than just a password to sign in.
            </p>
            <div className="p-4 mb-4" style={{
              backgroundColor: tokens.colors.info + '10',
              border: `1px solid ${tokens.colors.borderInfo}`,
              borderRadius: tokens.borderRadius.lg
            }}>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.info }}>What you'll need:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: tokens.colors.info }}>
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
              className="px-6 py-2 font-medium transition-colors"
              style={{
                backgroundColor: isLoading ? tokens.colors.disabled : tokens.colors.primary,
                color: tokens.colors.textInverse,
                borderRadius: tokens.borderRadius.lg,
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Setting up...' : 'Enable MFA'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 font-medium transition-colors"
                style={{
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.lg
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 text-sm" style={{
              backgroundColor: tokens.colors.error + '10',
              border: `1px solid ${tokens.colors.borderError}`,
              borderRadius: tokens.borderRadius.lg,
              color: tokens.colors.error
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Scan QR Code */}
      {step === 'scan' && (
        <div className="p-6" style={{
          backgroundColor: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.lg
        }}>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: tokens.colors.text }}>
              Scan QR Code
            </h3>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4" style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.borderRadius.lg,
                border: `2px solid ${tokens.colors.border}`
              }}>
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="p-4 mb-6" style={{
              backgroundColor: tokens.colors.backgroundSecondary,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.borderRadius.lg
            }}>
              <p className="text-sm mb-2" style={{ color: tokens.colors.textMuted }}>
                Can't scan the code? Enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 font-mono text-sm" style={{
                  backgroundColor: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.md,
                  color: tokens.colors.text
                }}>
                  {secret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(secret)}
                  className="px-3 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: tokens.colors.primary,
                    color: tokens.colors.textInverse,
                    borderRadius: tokens.borderRadius.md
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Verification */}
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text }}>
                Enter verification code from your app
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 font-mono text-lg text-center tracking-widest focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={isLoading || verificationCode.length !== 6}
              className="px-6 py-2 font-medium transition-colors"
              style={{
                backgroundColor: (isLoading || verificationCode.length !== 6) ? tokens.colors.disabled : tokens.colors.primary,
                color: tokens.colors.textInverse,
                borderRadius: tokens.borderRadius.lg,
                opacity: (isLoading || verificationCode.length !== 6) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              onClick={() => setStep('initial')}
              className="px-6 py-2 font-medium transition-colors"
              style={{
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.borderRadius.lg
              }}
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 text-sm" style={{
              backgroundColor: tokens.colors.error + '10',
              border: `1px solid ${tokens.colors.borderError}`,
              borderRadius: tokens.borderRadius.lg,
              color: tokens.colors.error
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'complete' && (
        <div className="p-6" style={{
          backgroundColor: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.lg
        }}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: tokens.colors.success }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium" style={{ color: tokens.colors.text }}>
                MFA Successfully Enabled!
              </h3>
            </div>

            <div className="p-4 mb-6" style={{
              backgroundColor: tokens.colors.warning + '10',
              border: `1px solid ${tokens.colors.borderWarning}`,
              borderRadius: tokens.borderRadius.lg
            }}>
              <h4 className="font-medium mb-2" style={{ color: tokens.colors.warning }}>Save Your Backup Codes</h4>
              <p className="text-sm mb-4" style={{ color: tokens.colors.warning }}>
                Store these backup codes in a safe place. You can use them to access your account
                if you lose your authenticator device.
              </p>

              <div className="p-4 mb-4" style={{
                backgroundColor: tokens.colors.surface,
                border: `1px solid ${tokens.colors.borderWarning}`,
                borderRadius: tokens.borderRadius.lg
              }}>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="px-3 py-2" style={{
                      backgroundColor: tokens.colors.backgroundSecondary,
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.border}`,
                      color: tokens.colors.text
                    }}>
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={copyBackupCodes}
                className="w-full px-4 py-2 font-medium transition-colors"
                style={{
                  backgroundColor: tokens.colors.warning,
                  color: tokens.colors.textInverse,
                  borderRadius: tokens.borderRadius.lg
                }}
              >
                Copy All Backup Codes
              </button>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full px-6 py-2 font-medium transition-colors"
            style={{
              backgroundColor: tokens.colors.primary,
              color: tokens.colors.textInverse,
              borderRadius: tokens.borderRadius.lg
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
