/**
 * MFA Verification Component
 *
 * Prompts user to enter their MFA code during login
 *
 * @module components/auth/MFAVerification
 */

import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { useNotify } from '@/hooks/core';
import { useTheme } from "@/hooks/useTheme";
import { useAuthActions } from '@/providers/application/authprovider';
import { IntegrationOrchestrator } from '@/services/integration/integration-orchestrator.service';
import { type SystemEventPayloads, SystemEventType } from '@/types/integration-types';

interface MFAVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MFAVerification({ onSuccess, onCancel }: MFAVerificationProps) {
  const { verifyMFA } = useAuthActions();
  const { theme, tokens } = useTheme();
  const notify = useNotify();
  const gradientBackground = String(theme.colors.gradients.primary);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const publishEvent = <T extends SystemEventType>(
    type: T,
    payload: SystemEventPayloads[T],
  ) => {
    void IntegrationOrchestrator.publish(type, payload).catch((error) => {
      console.error("Failed to publish MFA event", error);
    });
  };

  const handleVerify = (event: React.FormEvent) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const success = await verifyMFA(code);

        if (success) {
          const payload: SystemEventPayloads[SystemEventType.MFA_VERIFICATION_SUCCESS] = {
            method: useBackupCode ? 'backup_code' : 'authenticator',
          };
          publishEvent(SystemEventType.MFA_VERIFICATION_SUCCESS, payload);
          notify.success('Two-factor authentication successful');
          onSuccess?.();
        } else {
          setError('Invalid verification code. Please try again.');
          notify.error('Invalid verification code');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Verification failed';
        setError(errorMessage);
        notify.error(`MFA verification failed: ${errorMessage}`);

        const payload: SystemEventPayloads[SystemEventType.MFA_VERIFICATION_FAILED] = {
          error: errorMessage,
          method: useBackupCode ? 'backup_code' : 'authenticator',
        };
        publishEvent(SystemEventType.MFA_VERIFICATION_FAILED, payload);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gradientBackground }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Logo/Branding */}
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing.layout.lg }}>
          <h1 style={{ fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.bold, color: theme.text.primary, marginBottom: tokens.spacing.compact.sm }}>LexiFlow</h1>
          <p style={{ color: theme.text.secondary }}>Two-Factor Authentication</p>
        </div>

        {/* MFA Card */}
        <div style={{ backgroundColor: theme.surface.elevated, borderColor: theme.border.default, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.xxl, padding: tokens.spacing.layout.xl, borderWidth: '1px' }}>
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary.DEFAULT }}>
                <svg className="w-8 h-8" style={{ color: theme.text.inverse }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-center mb-2" style={{ color: theme.text.primary }}>
              Verify Your Identity
            </h2>
            <p className="text-center text-sm" style={{ color: theme.text.secondary }}>
              {useBackupCode
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ backgroundColor: theme.status.error.bg, borderColor: theme.status.error.border, borderWidth: '1px', borderRadius: tokens.borderRadius.md, padding: tokens.spacing.normal.md, color: theme.status.error.text, fontSize: tokens.typography.fontSize.sm }}>
              {error}
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
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
                style={{ backgroundColor: theme.surface.input, borderColor: theme.border.default, color: theme.text.primary }}
                className="w-full px-4 py-3 border rounded font-mono text-2xl text-center tracking-widest focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={code.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>

          {/* Alternative Options */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: theme.border.default }}>
            <Button
              variant="link"
              size="sm"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="p-0 h-auto"
            >
              {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
            </Button>
          </div>

          {/* Cancel */}
          {onCancel && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="w-full"
              >
                Cancel and return to login
              </Button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Lost your device?{' '}
            <a href="/auth/recovery" style={{ color: theme.primary.DEFAULT }} className="hover:opacity-80 transition-all">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
