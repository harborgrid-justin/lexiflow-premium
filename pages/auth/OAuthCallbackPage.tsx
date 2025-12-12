/**
 * OAuthCallbackPage Component
 * Handles OAuth redirect callbacks from Google, Microsoft, etc.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth/authService';

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const provider = searchParams.get('provider') || 'google';

    // Check for OAuth errors
    if (errorParam) {
      setStatus('error');
      setError(
        errorParam === 'access_denied'
          ? 'Access denied. You cancelled the authentication.'
          : `Authentication error: ${errorParam}`
      );
      return;
    }

    // Validate required parameters
    if (!code) {
      setStatus('error');
      setError('Invalid OAuth callback: missing authorization code');
      return;
    }

    try {
      // Exchange authorization code for tokens
      const response = await authService.oauthCallback(provider, code, state || '');

      // Save tokens and user data
      login(response.user, response.accessToken, response.refreshToken);

      // Show success briefly before redirecting
      setStatus('success');

      setTimeout(() => {
        const redirectTo = sessionStorage.getItem('oauth_redirect') || '/';
        sessionStorage.removeItem('oauth_redirect');
        navigate(redirectTo, { replace: true });
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setError(
        err.response?.data?.message ||
        'Failed to complete OAuth authentication'
      );
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Completing Authentication
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your credentials...
            </Typography>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: 'success.main', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom color="success.main">
              Authentication Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting you now...
            </Typography>
          </>
        );

      case 'error':
        return (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error.main">
              Authentication Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate('/auth/login')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              Back to Login
            </Button>
          </>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default OAuthCallbackPage;
