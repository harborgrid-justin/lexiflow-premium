import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Computer as DesktopIcon,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as TrustedIcon,
  Warning as UntrustedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface SessionInfo {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  country: string;
  city: string;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
  isTrusted: boolean;
}

interface SessionManagerProps {
  userId?: string;
  onSessionRevoked?: (sessionId: string) => void;
}

/**
 * Session Manager Component
 * Displays and manages user's active sessions across devices
 * Implements OWASP Session Management best practices
 */
export const SessionManager: React.FC<SessionManagerProps> = ({
  userId,
  onSessionRevoked,
}) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    sessionId: string | null;
    isAll: boolean;
  }>({ open: false, sessionId: null, isAll: false });

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API to get user sessions
      const response = await fetch('/api/auth/sessions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(
        data.map((session: any) => ({
          ...session,
          lastActivityAt: new Date(session.lastActivityAt),
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      setError(null);

      const response = await fetch(`/api/auth/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          reason: 'User initiated revocation',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      // Remove session from list
      setSessions(sessions.filter((s) => s.id !== sessionId));

      if (onSessionRevoked) {
        onSessionRevoked(sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevoking(null);
      setConfirmDialog({ open: false, sessionId: null, isAll: false });
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      setRevoking('all');
      setError(null);

      const response = await fetch('/api/auth/sessions/revoke-others', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke sessions');
      }

      // Reload sessions
      await loadSessions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to revoke sessions',
      );
    } finally {
      setRevoking(null);
      setConfirmDialog({ open: false, sessionId: null, isAll: false });
    }
  };

  const handleTrustDevice = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}/trust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trust device');
      }

      // Update session in list
      setSessions(
        sessions.map((s) =>
          s.id === sessionId ? { ...s, isTrusted: true } : s,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trust device');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <MobileIcon />;
      case 'tablet':
        return <TabletIcon />;
      default:
        return <DesktopIcon />;
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Active Sessions
        </Typography>
        {otherSessions.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() =>
              setConfirmDialog({ open: true, sessionId: null, isAll: true })
            }
            disabled={revoking === 'all'}
          >
            {revoking === 'all' ? 'Revoking...' : 'Logout All Other Devices'}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          You're currently signed in to {sessions.length} device
          {sessions.length !== 1 ? 's' : ''}. For your security, you can sign
          out of any device at any time.
        </Typography>
      </Alert>

      {/* Current Session */}
      {currentSession && (
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                label="Current Device"
                color="primary"
                size="small"
                sx={{ mr: 2 }}
              />
              {currentSession.isTrusted && (
                <Chip
                  icon={<TrustedIcon />}
                  label="Trusted"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  {getDeviceIcon(currentSession.deviceType)}
                  <Box ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {currentSession.browser}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentSession.os}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" ml={1}>
                    {currentSession.location} ({currentSession.ipAddress})
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" ml={1}>
                    Last active: {formatLastActivity(currentSession.lastActivityAt)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {!currentSession.isTrusted && (
              <Box mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SecurityIcon />}
                  onClick={() => handleTrustDevice(currentSession.id)}
                >
                  Trust This Device
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <Box>
          <Typography variant="h6" mb={2}>
            Other Devices
          </Typography>

          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {otherSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getDeviceIcon(session.deviceType)}
                        <Box ml={2}>
                          <Typography variant="body2" fontWeight="bold">
                            {session.browser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.os}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {session.city}, {session.country}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatLastActivity(session.lastActivityAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {session.isTrusted ? (
                        <Chip
                          icon={<TrustedIcon />}
                          label="Trusted"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<UntrustedIcon />}
                          label="Untrusted"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {!session.isTrusted && (
                        <Tooltip title="Trust Device">
                          <IconButton
                            size="small"
                            onClick={() => handleTrustDevice(session.id)}
                          >
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Sign Out">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              sessionId: session.id,
                              isAll: false,
                            })
                          }
                          disabled={revoking === session.id}
                        >
                          {revoking === session.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, sessionId: null, isAll: false })
        }
      >
        <DialogTitle>
          {confirmDialog.isAll
            ? 'Sign Out All Other Devices?'
            : 'Sign Out Device?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.isAll
              ? 'This will sign you out of all devices except this one. You will need to sign in again on those devices.'
              : 'This will sign you out of this device. You will need to sign in again to access your account.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, sessionId: null, isAll: false })
            }
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (confirmDialog.isAll) {
                handleRevokeAllOtherSessions();
              } else if (confirmDialog.sessionId) {
                handleRevokeSession(confirmDialog.sessionId);
              }
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionManager;
