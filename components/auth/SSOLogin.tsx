import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Business as EnterpriseIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  VpnKey as SamlIcon,
  Security as OidcIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth';
  loginUrl: string;
  enabled: boolean;
  icon?: string;
  description?: string;
}

interface SSOLoginProps {
  onSuccess?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
}

/**
 * SSO Login Component
 * Enterprise Single Sign-On authentication interface
 * Supports SAML, OIDC, and OAuth providers
 */
export const SSOLogin: React.FC<SSOLoginProps> = ({
  onSuccess,
  onError,
  redirectUrl,
}) => {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSSOProviders();
    // Check for SSO callback
    checkSSOCallback();
  }, []);

  const loadSSOProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/sso/providers');

      if (!response.ok) {
        throw new Error('Failed to load SSO providers');
      }

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error('Failed to load SSO providers:', err);
      setError('Unable to load SSO providers');
    } finally {
      setLoading(false);
    }
  };

  const checkSSOCallback = () => {
    // Check if this is an SSO callback with tokens
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      const errorMessage = getErrorMessage(errorParam);
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      if (onSuccess) {
        onSuccess({ accessToken, refreshToken });
      }

      // Clean URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  };

  const handleSSOLogin = (provider: SSOProvider) => {
    setAuthenticating(provider.id);
    setError(null);

    // Redirect to SSO provider
    const loginUrl = `${window.location.origin}${provider.loginUrl}`;
    window.location.href = loginUrl;
  };

  const getProviderIcon = (provider: SSOProvider) => {
    switch (provider.icon?.toLowerCase()) {
      case 'google':
        return <GoogleIcon sx={{ fontSize: 32 }} />;
      case 'microsoft':
        return <MicrosoftIcon sx={{ fontSize: 32 }} />;
      default:
        if (provider.type === 'saml') {
          return <SamlIcon sx={{ fontSize: 32 }} />;
        }
        return <OidcIcon sx={{ fontSize: 32 }} />;
    }
  };

  const getProviderColor = (provider: SSOProvider) => {
    switch (provider.icon?.toLowerCase()) {
      case 'google':
        return '#4285f4';
      case 'microsoft':
        return '#00a4ef';
      default:
        return '#1976d2';
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      saml_auth_failed: 'SAML authentication failed. Please try again.',
      saml_callback_failed: 'SAML callback processing failed.',
      oidc_auth_failed: 'OpenID Connect authentication failed.',
      oidc_callback_failed: 'OpenID Connect callback processing failed.',
      google_auth_failed: 'Google authentication failed.',
      google_callback_failed: 'Google callback processing failed.',
      microsoft_auth_failed: 'Microsoft authentication failed.',
      microsoft_callback_failed: 'Microsoft callback processing failed.',
      access_denied: 'Access denied. Please contact your administrator.',
      invalid_provider: 'Invalid SSO provider.',
    };

    return errorMessages[errorCode] || 'Authentication failed. Please try again.';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (providers.length === 0) {
    return (
      <Alert severity="info">
        <Typography variant="body2">
          No SSO providers are configured. Please contact your administrator or
          use standard login.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box textAlign="center" mb={3}>
        <EnterpriseIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Enterprise Sign-On
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in with your organization's identity provider
        </Typography>
      </Box>

      <Stack spacing={2}>
        {providers.map((provider) => (
          <Card
            key={provider.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => handleSSOLogin(provider)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: getProviderColor(provider),
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {getProviderIcon(provider)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {provider.name}
                    </Typography>
                    {provider.description && (
                      <Typography variant="body2" color="text.secondary">
                        {provider.description}
                      </Typography>
                    )}
                    <Box mt={0.5}>
                      <Chip
                        label={provider.type.toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
                <Box>
                  {authenticating === provider.id ? (
                    <CircularProgress size={24} />
                  ) : (
                    <ArrowIcon color="action" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Don't have SSO access?
        </Typography>
        <Button
          variant="text"
          color="primary"
          href="/login"
          sx={{ mt: 1 }}
        >
          Use standard login
        </Button>
      </Box>

      {/* Security Badge */}
      <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Security sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Secured with enterprise-grade authentication
          </Typography>
        </Box>
      </Box>

      {/* Provider-specific buttons for better UX */}
      {providers.some((p) => p.icon === 'google' || p.icon === 'microsoft') && (
        <Box mt={3}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mb={2}
          >
            Quick access
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {providers
              .filter((p) => p.icon === 'google' || p.icon === 'microsoft')
              .map((provider) => (
                <Button
                  key={provider.id}
                  variant="outlined"
                  startIcon={getProviderIcon(provider)}
                  onClick={() => handleSSOLogin(provider)}
                  disabled={authenticating !== null}
                  sx={{
                    borderColor: getProviderColor(provider),
                    color: getProviderColor(provider),
                    '&:hover': {
                      borderColor: getProviderColor(provider),
                      bgcolor: `${getProviderColor(provider)}10`,
                    },
                  }}
                >
                  {provider.name}
                </Button>
              ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

/**
 * SSO Status Indicator Component
 * Shows current SSO authentication status
 */
export const SSOStatusIndicator: React.FC<{ enabled: boolean }> = ({
  enabled,
}) => {
  return (
    <Chip
      icon={enabled ? <OidcIcon /> : undefined}
      label={enabled ? 'SSO Enabled' : 'SSO Not Configured'}
      color={enabled ? 'success' : 'default'}
      size="small"
      variant={enabled ? 'filled' : 'outlined'}
    />
  );
};

/**
 * SSO Provider Card Component
 * Reusable card for displaying SSO provider information
 */
export const SSOProviderCard: React.FC<{
  provider: SSOProvider;
  onLogin: (provider: SSOProvider) => void;
  loading?: boolean;
}> = ({ provider, onLogin, loading = false }) => {
  const getIcon = () => {
    switch (provider.icon?.toLowerCase()) {
      case 'google':
        return <GoogleIcon />;
      case 'microsoft':
        return <MicrosoftIcon />;
      default:
        return <EnterpriseIcon />;
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
        opacity: loading ? 0.6 : 1,
      }}
      onClick={() => !loading && onLogin(provider)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2 }}>{getIcon()}</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {provider.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {provider.type.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          {loading ? <CircularProgress size={20} /> : <ArrowIcon />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SSOLogin;
