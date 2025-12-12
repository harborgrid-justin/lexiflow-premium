/**
 * SocialLoginButtons Component
 * Google and Microsoft OAuth login buttons
 */

import React, { useState } from 'react';
import { Button, Stack, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { authService } from '../../services/auth/authService';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    setLoading(provider);
    setError(null);

    try {
      // Generate state for CSRF protection
      const state = generateRandomState();
      sessionStorage.setItem('oauth_state', state);

      // Store current location for redirect after OAuth
      sessionStorage.setItem('oauth_redirect', window.location.pathname);

      // Get OAuth URL from backend
      const authUrl = await authService.getOAuthUrl(provider, state);

      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to initiate ${provider} login`;
      setError(errorMessage);
      onError?.(errorMessage);
      setLoading(null);
    }
  };

  const generateRandomState = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={
            loading === 'google' ? (
              <CircularProgress size={20} />
            ) : (
              <GoogleIcon />
            )
          }
          onClick={() => handleSocialLogin('google')}
          disabled={loading !== null}
          sx={{
            py: 1.5,
            borderColor: '#DB4437',
            color: '#DB4437',
            '&:hover': {
              borderColor: '#C23321',
              backgroundColor: 'rgba(219, 68, 55, 0.04)',
            },
          }}
        >
          {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={
            loading === 'microsoft' ? (
              <CircularProgress size={20} />
            ) : (
              <MicrosoftIcon />
            )
          }
          onClick={() => handleSocialLogin('microsoft')}
          disabled={loading !== null}
          sx={{
            py: 1.5,
            borderColor: '#00A4EF',
            color: '#00A4EF',
            '&:hover': {
              borderColor: '#0078D4',
              backgroundColor: 'rgba(0, 164, 239, 0.04)',
            },
          }}
        >
          {loading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
        </Button>
      </Stack>
    </>
  );
};
