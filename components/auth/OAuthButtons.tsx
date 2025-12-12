/**
 * OAuthButtons Component
 * Standalone OAuth provider login buttons
 */

import React, { useState } from 'react';
import { Button, Stack, Box, CircularProgress } from '@mui/material';
import { Google, Microsoft } from '@mui/icons-material';
import { useOAuth } from '../../hooks/useOAuth';

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'outlined',
  fullWidth = true,
}) => {
  const { loginWithGoogle, loginWithMicrosoft, loading } = useOAuth();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setActiveProvider(provider);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithMicrosoft();
      }
      onSuccess?.();
    } catch (error: any) {
      onError?.(error);
    } finally {
      setActiveProvider(null);
    }
  };

  const isLoading = (provider: string) => loading && activeProvider === provider;

  return (
    <Stack spacing={2}>
      {/* Google OAuth */}
      <Button
        variant={variant}
        fullWidth={fullWidth}
        size="large"
        disabled={disabled || loading}
        onClick={() => handleOAuthLogin('google')}
        startIcon={
          isLoading('google') ? (
            <CircularProgress size={20} />
          ) : (
            <Google />
          )
        }
        sx={{
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {isLoading('google') ? 'Connecting...' : 'Continue with Google'}
      </Button>

      {/* Microsoft OAuth */}
      <Button
        variant={variant}
        fullWidth={fullWidth}
        size="large"
        disabled={disabled || loading}
        onClick={() => handleOAuthLogin('microsoft')}
        startIcon={
          isLoading('microsoft') ? (
            <CircularProgress size={20} />
          ) : (
            <Microsoft />
          )
        }
        sx={{
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {isLoading('microsoft') ? 'Connecting...' : 'Continue with Microsoft'}
      </Button>
    </Stack>
  );
};

export default OAuthButtons;
