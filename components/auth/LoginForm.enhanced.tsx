/**
 * Enhanced LoginForm Component
 * Complete login form with validation, MFA, and remember me functionality
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Link as MuiLink,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useLogin } from '../../hooks/useLogin';
import { RememberMe } from './RememberMe';

interface LoginFormEnhancedProps {
  onSuccess?: () => void;
  onMfaRequired?: (mfaToken: string) => void;
  onForgotPassword?: () => void;
  showRememberMe?: boolean;
}

export const LoginFormEnhanced: React.FC<LoginFormEnhancedProps> = ({
  onSuccess,
  onMfaRequired,
  onForgotPassword,
  showRememberMe = true,
}) => {
  const { login, loading, error, clearError } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(email, password, rememberMe);

      // Check if MFA is required
      if (response.requiresMfa && response.mfaToken) {
        onMfaRequired?.(response.mfaToken);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      // Error is already set by the hook
      console.error('Login error:', err);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors({ ...validationErrors, email: '' });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors({ ...validationErrors, password: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Global Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Email Field */}
      <TextField
        fullWidth
        label="Email Address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={handleEmailChange}
        error={!!validationErrors.email}
        helperText={validationErrors.email}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Password Field */}
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
        error={!!validationErrors.password}
        helperText={validationErrors.password}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Remember Me */}
      {showRememberMe && (
        <Box sx={{ mb: 2 }}>
          <RememberMe
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={loading}
          />
        </Box>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Forgot Password Link */}
      {onForgotPassword && (
        <Box sx={{ textAlign: 'center' }}>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            onClick={onForgotPassword}
            sx={{ cursor: 'pointer' }}
          >
            Forgot your password?
          </MuiLink>
        </Box>
      )}
    </Box>
  );
};

export default LoginFormEnhanced;
