/**
 * AccountLockedPage Component
 * Displayed when user account is locked due to security reasons
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import apiClient from '../../services/api/apiClient';

export const AccountLockedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get('email');
  const reason = searchParams.get('reason') || 'multiple_failed_attempts';

  const reasonMessages: Record<string, { title: string; description: string }> = {
    multiple_failed_attempts: {
      title: 'Too Many Failed Login Attempts',
      description: 'Your account has been temporarily locked due to multiple failed login attempts. This is a security measure to protect your account.',
    },
    suspicious_activity: {
      title: 'Suspicious Activity Detected',
      description: 'We detected unusual activity on your account and have locked it as a precautionary measure.',
    },
    admin_locked: {
      title: 'Account Locked by Administrator',
      description: 'Your account has been locked by an administrator. Please contact support for more information.',
    },
    policy_violation: {
      title: 'Policy Violation',
      description: 'Your account has been locked due to a violation of our terms of service.',
    },
  };

  const { title, description } = reasonMessages[reason] || reasonMessages.multiple_failed_attempts;

  const handleUnlockRequest = async () => {
    if (!email) {
      setError('Email address not found. Please contact support.');
      return;
    }

    setRequesting(true);
    setError(null);

    try {
      await apiClient.post('/auth/unlock-account', { email });
      setRequested(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to send unlock request. Please try again or contact support.'
      );
    } finally {
      setRequesting(false);
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
          }}
        >
          {/* Header */}
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 48, color: 'error.dark' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              textAlign="center"
            >
              Account Locked
            </Typography>
          </Stack>

          {/* Reason */}
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2">
              {description}
            </Typography>
          </Alert>

          {/* What to do */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            What can you do?
          </Typography>

          <Stack spacing={2}>
            {/* Auto-unlock info for failed attempts */}
            {reason === 'multiple_failed_attempts' && (
              <Alert severity="info">
                <Typography variant="body2">
                  Your account will be automatically unlocked after 30 minutes. Alternatively, you can request an unlock email below.
                </Typography>
              </Alert>
            )}

            {/* Unlock request */}
            {email && !requested && reason !== 'admin_locked' && reason !== 'policy_violation' && (
              <Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<EmailIcon />}
                  onClick={handleUnlockRequest}
                  disabled={requesting}
                  sx={{ mb: 1 }}
                >
                  {requesting ? 'Sending...' : 'Send Unlock Email'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                  We'll send you an email with instructions to unlock your account
                </Typography>
              </Box>
            )}

            {requested && (
              <Alert severity="success">
                <Typography variant="body2">
                  An unlock email has been sent to {email}. Please check your inbox and follow the instructions.
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Password reset option */}
            {reason === 'multiple_failed_attempts' && (
              <>
                <Divider sx={{ my: 2 }}>OR</Divider>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/auth/forgot-password"
                >
                  Reset Password Instead
                </Button>
              </>
            )}

            {/* Contact support */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center" gutterBottom>
                Need help? Contact our support team
              </Typography>
              <Button
                variant="text"
                fullWidth
                startIcon={<SupportIcon />}
                href="mailto:support@lexiflow.ai"
              >
                Contact Support
              </Button>
            </Box>
          </Stack>

          {/* Back to login */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              component={Link}
              to="/auth/login"
              variant="text"
            >
              Back to Login
            </Button>
          </Box>
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

export default AccountLockedPage;
