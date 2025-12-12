import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  VpnKey as KeyIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { SessionManager } from './SessionManager';

interface TabPanelProps {
  children?: React.Node;
  index: number;
  value: number;
}

interface PasswordStrength {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very_strong';
  errors: string[];
  suggestions: string[];
}

interface SecuritySettingsData {
  mfaEnabled: boolean;
  activeSessions: number;
  trustedDevices: number;
  lastPasswordChange?: Date;
  passwordExpiresAt?: Date;
  isLocked: boolean;
  lockedUntil?: Date;
  loginHistoryCount: number;
  failedLoginAttempts: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Security Settings Component
 * Comprehensive security management interface
 * Implements OWASP Authentication best practices
 */
export const SecuritySettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<SecuritySettingsData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA State
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [enablingMfa, setEnablingMfa] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  useEffect(() => {
    if (newPassword) {
      checkPasswordStrength(newPassword);
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/security-settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load security settings');
      }

      const data = await response.json();
      setSecurityData({
        ...data,
        lastPasswordChange: data.lastPasswordChange
          ? new Date(data.lastPasswordChange)
          : undefined,
        passwordExpiresAt: data.passwordExpiresAt
          ? new Date(data.passwordExpiresAt)
          : undefined,
        lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : undefined,
      });
      setMfaEnabled(data.mfaEnabled);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load settings',
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = async (password: string) => {
    try {
      const response = await fetch('/api/auth/password/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setPasswordStrength(data);
      }
    } catch (err) {
      // Silently fail - not critical
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);

      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('All fields are required');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }

      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
      await loadSecuritySettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnableMfa = async () => {
    try {
      setEnablingMfa(true);
      setError(null);

      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      const data = await response.json();
      setMfaQrCode(data.qrCode);
      setShowMfaDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
    } finally {
      setEnablingMfa(false);
    }
  };

  const handleVerifyMfa = async () => {
    try {
      setEnablingMfa(true);
      setError(null);

      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ code: mfaCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setSuccess('Two-factor authentication enabled successfully');
      setMfaEnabled(true);
      setShowMfaDialog(false);
      setMfaCode('');
      setMfaQrCode(null);
      await loadSecuritySettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setEnablingMfa(false);
    }
  };

  const handleDisableMfa = async () => {
    try {
      setEnablingMfa(true);
      setError(null);

      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      setSuccess('Two-factor authentication disabled');
      setMfaEnabled(false);
      await loadSecuritySettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setEnablingMfa(false);
    }
  };

  const getPasswordStrengthColor = (level: string) => {
    switch (level) {
      case 'weak':
        return 'error';
      case 'medium':
        return 'warning';
      case 'strong':
        return 'info';
      case 'very_strong':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPasswordStrengthValue = (score: number) => {
    return Math.min(100, score);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account security and authentication methods
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Security Overview */}
      {securityData && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {securityData.activeSessions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Sessions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {securityData.trustedDevices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trusted Devices
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {securityData.loginHistoryCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Login History
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography
                variant="h4"
                color={
                  securityData.failedLoginAttempts > 0 ? 'error' : 'text.secondary'
                }
              >
                {securityData.failedLoginAttempts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed Attempts
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="security settings tabs"
        >
          <Tab label="Password" icon={<LockIcon />} />
          <Tab label="Two-Factor Auth" icon={<KeyIcon />} />
          <Tab label="Sessions" icon={<SecurityIcon />} />
        </Tabs>

        {/* Password Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" mb={2}>
            Change Password
          </Typography>

          {securityData?.lastPasswordChange && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Last changed:{' '}
              {securityData.lastPasswordChange.toLocaleDateString()}
              {securityData.passwordExpiresAt && (
                <>
                  {' '}
                  | Expires:{' '}
                  {securityData.passwordExpiresAt.toLocaleDateString()}
                </>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Minimum 12 characters with uppercase, lowercase, numbers, and symbols"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            {passwordStrength && (
              <Box mt={1} mb={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Password Strength</Typography>
                  <Chip
                    label={passwordStrength.level.replace('_', ' ').toUpperCase()}
                    color={getPasswordStrengthColor(passwordStrength.level)}
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPasswordStrengthValue(passwordStrength.score)}
                  color={getPasswordStrengthColor(passwordStrength.level)}
                />
                {passwordStrength.errors.length > 0 && (
                  <List dense>
                    {passwordStrength.errors.map((err, idx) => (
                      <ListItem key={idx}>
                        <ErrorIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                        <ListItemText primary={err} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              error={
                confirmPassword.length > 0 && newPassword !== confirmPassword
              }
              helperText={
                confirmPassword.length > 0 && newPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              sx={{ mt: 2 }}
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </Box>
        </TabPanel>

        {/* 2FA Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" mb={2}>
            Two-Factor Authentication
          </Typography>

          <Alert severity={mfaEnabled ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <Typography variant="body2">
              {mfaEnabled
                ? '2FA is enabled. Your account is protected with an extra layer of security.'
                : '2FA is not enabled. Enable it to add an extra layer of security to your account.'}
            </Typography>
          </Alert>

          <FormControlLabel
            control={
              <Switch
                checked={mfaEnabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleEnableMfa();
                  } else {
                    handleDisableMfa();
                  }
                }}
                disabled={enablingMfa}
              />
            }
            label="Enable Two-Factor Authentication"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            Two-factor authentication adds an extra layer of security to your
            account. In addition to your password, you'll need to enter a
            verification code from your authenticator app.
          </Typography>
        </TabPanel>

        {/* Sessions Tab */}
        <TabPanel value={tabValue} index={2}>
          <SessionManager />
        </TabPanel>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog
        open={showMfaDialog}
        onClose={() => {
          setShowMfaDialog(false);
          setMfaCode('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Scan this QR code with your authenticator app (Google Authenticator,
            Authy, etc.), then enter the verification code below.
          </Typography>

          {mfaQrCode && (
            <Box display="flex" justifyContent="center" mb={2}>
              <img src={mfaQrCode} alt="2FA QR Code" style={{ maxWidth: '100%' }} />
            </Box>
          )}

          <TextField
            fullWidth
            label="Verification Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="000000"
            inputProps={{ maxLength: 6 }}
            helperText="Enter the 6-digit code from your authenticator app"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowMfaDialog(false);
              setMfaCode('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyMfa}
            disabled={mfaCode.length !== 6 || enablingMfa}
          >
            {enablingMfa ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
