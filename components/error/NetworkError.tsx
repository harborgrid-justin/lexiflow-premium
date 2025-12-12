import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

/**
 * Network Error Component
 * Displayed when there's a network connectivity issue
 */
export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message,
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          {/* Network Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <CloudOffIcon
              sx={{
                fontSize: 80,
                color: 'warning.main',
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom>
            No Internet Connection
          </Typography>

          {/* Message */}
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              {message ||
                'Unable to connect to the server. Please check your internet connection.'}
            </Typography>
          </Alert>

          {/* Troubleshooting Steps */}
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Troubleshooting steps:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <WifiIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Check your Wi-Fi or mobile data connection
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Verify that airplane mode is turned off
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Try accessing other websites to confirm connectivity
              </Typography>
              <Typography component="li" variant="body2">
                Restart your router if using Wi-Fi
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              size="large"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGoHome}
              size="large"
            >
              Go to Homepage
            </Button>
          </Box>

          {/* Help Text */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            If you continue to experience connection issues, please contact your
            network administrator.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
