/**
 * useTwoFactor Hook
 * Custom hook for handling two-factor authentication (MFA) operations
 */

import { useState, useCallback } from 'react';
import { setupMFA, verifyMFA, disableMFA } from '../services/api/authService';
import type { TwoFactorSetupResponse, TwoFactorVerifyRequest } from '../types/api';

interface UseTwoFactorResult {
  setupMfa: () => Promise<TwoFactorSetupResponse>;
  verifyMfa: (token: string, code: string) => Promise<void>;
  disableMfa: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  qrCode: string | null;
  secret: string | null;
  backupCodes: string[];
  clearError: () => void;
  reset: () => void;
}

export const useTwoFactor = (): UseTwoFactorResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMfaHandler = useCallback(async (): Promise<TwoFactorSetupResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await setupMFA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setBackupCodes(response.backupCodes || []);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to setup MFA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMfaHandler = useCallback(async (token: string, code: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const request: TwoFactorVerifyRequest = { token, code };
      await verifyMFA(request);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Invalid verification code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const disableMfaHandler = useCallback(async (password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await disableMFA(password);
      setQrCode(null);
      setSecret(null);
      setBackupCodes([]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to disable MFA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setQrCode(null);
    setSecret(null);
    setBackupCodes([]);
  }, []);

  return {
    setupMfa: setupMfaHandler,
    verifyMfa: verifyMfaHandler,
    disableMfa: disableMfaHandler,
    loading,
    error,
    qrCode,
    secret,
    backupCodes,
    clearError,
    reset,
  };
};

export default useTwoFactor;
