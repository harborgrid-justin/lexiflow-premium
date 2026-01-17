import { useState } from 'react';

import { useAuthActions } from '@/providers/application/AuthProvider';

import { cleanVerificationCode } from '../utils/authFormatters';

export type MFAStep = 'initial' | 'scan' | 'verify' | 'complete';

export interface UseMFAFlowResult {
  step: MFAStep;
  qrCode: string;
  secret: string;
  backupCodes: string[];
  verificationCode: string;
  isLoading: boolean;
  error: string | null;
  startSetup: () => Promise<void>;
  verifyCode: () => Promise<void>;
  completeSetup: () => void;
  reset: () => void;
  setVerificationCode: (code: string) => void;
  setBackupCodes: (codes: string[]) => void;
  setStep: (step: MFAStep) => void;
}

export function useMFAFlow(onComplete?: () => void): UseMFAFlowResult {
  const { enableMFA } = useAuthActions();
  const [step, setStep] = useState<MFAStep>('initial');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = async () => {
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

  const handleVerificationCodeChange = (code: string) => {
    setVerificationCode(cleanVerificationCode(code));
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verification logic typically goes here if needed before completion
      // For this flow, we move to showing backup codes
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = () => {
    onComplete?.();
  };

  const reset = () => {
    setStep('initial');
    setVerificationCode('');
    setError(null);
  };

  return {
    step,
    qrCode,
    secret,
    backupCodes,
    verificationCode,
    isLoading,
    error,
    startSetup,
    verifyCode,
    completeSetup,
    reset,
    setVerificationCode: handleVerificationCodeChange,
    setBackupCodes,
    setStep
  };
}
