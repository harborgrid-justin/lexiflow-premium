/**
 * SessionTimeout Component
 * Monitors user activity and handles session expiration
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SessionTimeoutProps {
  /**
   * Session timeout in milliseconds (default: 30 minutes)
   */
  timeout?: number;
  /**
   * Warning time before timeout in milliseconds (default: 2 minutes)
   */
  warningTime?: number;
  /**
   * Events to track for user activity (default: mouse, keyboard, touch)
   */
  events?: string[];
}

export const SessionTimeout: React.FC<SessionTimeoutProps> = ({
  timeout = 30 * 60 * 1000, // 30 minutes
  warningTime = 2 * 60 * 1000, // 2 minutes
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
}) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningTime);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset activity timer
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Handle user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, events, resetTimer]);

  // Check for inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const timeUntilTimeout = timeout - inactiveTime;

      if (timeUntilTimeout <= 0) {
        // Session expired
        handleSessionExpired();
      } else if (timeUntilTimeout <= warningTime && !showWarning) {
        // Show warning
        setShowWarning(true);
        setTimeLeft(timeUntilTimeout);
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [isAuthenticated, lastActivity, timeout, warningTime, showWarning]);

  // Update countdown timer
  useEffect(() => {
    if (!showWarning) return;

    const updateTimer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          handleSessionExpired();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [showWarning]);

  const handleSessionExpired = () => {
    setShowWarning(false);
    logout();
    navigate('/auth/login', {
      replace: true,
      state: { sessionExpired: true },
    });
  };

  const handleExtendSession = () => {
    resetTimer();
    // Optionally refresh the token here
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
    navigate('/auth/login', { replace: true });
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((warningTime - timeLeft) / warningTime) * 100;

  return (
    <Dialog
      open={showWarning}
      onClose={() => {}} // Prevent closing by clicking outside
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Session Expiring Soon</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Your session will expire due to inactivity. You will be automatically
          logged out in:
        </Typography>
        <Typography
          variant="h3"
          align="center"
          color="warning.main"
          sx={{ my: 2, fontWeight: 'bold' }}
        >
          {formatTime(timeLeft)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="warning"
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Click "Stay Logged In" to continue your session.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleLogout} color="inherit">
          Logout Now
        </Button>
        <Button
          onClick={handleExtendSession}
          variant="contained"
          color="primary"
          autoFocus
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};
