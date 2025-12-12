/**
 * LoginPage Component
 * Main login page with form validation and social login options
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import { LoginForm } from '../../components/auth/LoginForm';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';
  const sessionExpired = (location.state as any)?.sessionExpired;

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleMfaRequired = (mfaToken: string) => {
    navigate('/auth/two-factor', {
      state: { mfaToken, from }
    });
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
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
              LexiFlow AI Legal Suite
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {/* Session expired warning */}
          {sessionExpired && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Your session has expired. Please sign in again.
            </Alert>
          )}

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onMfaRequired={handleMfaRequired}
          />

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Social Login */}
          <SocialLoginButtons onSuccess={handleLoginSuccess} />

          {/* Footer Links */}
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 3 }}
          >
            <Link
              to="/auth/forgot-password"
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Typography>
            </Link>
            <Link
              to="/auth/register"
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create account
              </Typography>
            </Link>
          </Stack>
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

export default LoginPage;
