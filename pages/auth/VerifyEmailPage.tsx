/**
 * VerifyEmailPage Component
 * Email verification page for new user registrations
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  CheckCircleOutline,
  ErrorOutline,
  Email as EmailIcon,
} from '@mui/icons-material';
import apiClient from '../../services/api/apiClient';
import { API_ENDPOINTS } from '../../services/api/config';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerifying(false);
      setError('Invalid verification link. Please check your email and try again.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await apiClient.post('/auth/verify-email', { token: verificationToken });
      setVerified(true);
      setError(null);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', {
          state: { emailVerified: true, message: 'Email verified successfully! Please log in.' }
        });
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to verify email. The link may have expired.'
      );
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address not found. Please register again.');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await apiClient.post('/auth/resend-verification', { email });
      setResent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to resend verification email. Please try again.'
      );
    } finally {
      setResending(false);
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Email Verification
            </Typography>
          </Box>

          {/* Verifying State */}
          {verifying && (
            <Stack spacing={3} alignItems="center">
              <CircularProgress size={60} />
              <Typography variant="body1" color="text.secondary">
                Verifying your email address...
              </Typography>
            </Stack>
          )}

          {/* Success State */}
          {!verifying && verified && (
            <Stack spacing={3} alignItems="center">
              <CheckCircleOutline
                sx={{ fontSize: 80, color: 'success.main' }}
              />
              <Typography variant="h5" fontWeight="medium">
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your email has been verified. You will be redirected to the login page shortly.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth/login')}
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Stack>
          )}

          {/* Error State */}
          {!verifying && !verified && error && (
            <Stack spacing={3} alignItems="center">
              <ErrorOutline
                sx={{ fontSize: 80, color: 'error.main' }}
              />
              <Typography variant="h5" fontWeight="medium" color="error">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>

              {/* Resend Verification */}
              {email && !resent && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Didn't receive the email or link expired?
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </Box>
              )}

              {resent && (
                <Alert severity="success" sx={{ width: '100%' }}>
                  Verification email has been resent to {email}. Please check your inbox.
                </Alert>
              )}

              <Button
                variant="text"
                component={Link}
                to="/auth/login"
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Stack>
          )}
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="white"
          align="center"
          sx={{ mt: 3, opacity: 0.9 }}
        >
          © 2025 LexiFlow AI. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
