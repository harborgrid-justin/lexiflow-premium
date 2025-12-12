import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ReportProblem as ReportProblemIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ServerErrorProps {
  message?: string;
  correlationId?: string;
  onRetry?: () => void;
  onReportIssue?: () => void;
  autoRetry?: boolean;
  retryDelay?: number;
}

/**
 * 500 Server Error Component
 * Displayed when a server-side error occurs
 */
export const ServerError: React.FC<ServerErrorProps> = ({
  message,
  correlationId,
  onRetry,
  onReportIssue,
  autoRetry = false,
  retryDelay = 5,
}) => {
  const navigate = useNavigate();
  const [retryCountdown, setRetryCountdown] = React.useState(
    autoRetry ? retryDelay : 0,
  );
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Auto-retry countdown
  React.useEffect(() => {
    if (!autoRetry || retryCountdown <= 0) return;

    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          handleRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRetry, retryCountdown]);

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReportIssue = () => {
    if (onReportIssue) {
      onReportIssue();
    } else {
      navigate('/support/report-issue', {
        state: { correlationId, message },
      });
    }
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
          {/* Server Error Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant="h1"
              component="div"
              sx={{
                fontSize: { xs: '4rem', md: '6rem' },
                fontWeight: 'bold',
                color: 'error.main',
                mr: 2,
              }}
            >
              500
            </Typography>
            <ReportProblemIcon
              sx={{
                fontSize: { xs: 60, md: 80 },
                color: 'error.main',
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom>
            Server Error
          </Typography>

          {/* Message */}
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              {message ||
                'An unexpected error occurred on our servers. Our team has been notified and is working to fix the issue.'}
            </Typography>
          </Alert>

          {/* Correlation ID */}
          {correlationId && (
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Error ID (for support):
              </Typography>
              <Box
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  p: 1.5,
                  borderRadius: 1,
                  wordBreak: 'break-all',
                }}
              >
                <Typography variant="body2">{correlationId}</Typography>
              </Box>
            </Box>
          )}

          {/* Auto-retry countdown */}
          {autoRetry && retryCountdown > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Retrying automatically in {retryCountdown} seconds...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((retryDelay - retryCountdown) / retryDelay) * 100}
              />
            </Box>
          )}

          {/* Loading state */}
          {isRetrying && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Retrying...
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          {!isRetrying && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  mb: 2,
                }}
              >
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
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  size="large"
                >
                  Go to Homepage
                </Button>
              </Box>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<BugReportIcon />}
                onClick={handleReportIssue}
                fullWidth
              >
                Report This Issue
              </Button>
            </>
          )}

          {/* What Happened */}
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              What happened?
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Our servers encountered an unexpected problem
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                The error has been automatically logged and reported
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Our engineering team is investigating the issue
              </Typography>
              <Typography component="li" variant="body2">
                Your data is safe and no information was lost
              </Typography>
            </Box>
          </Box>

          {/* Help Text */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            If the problem persists, please contact our support team with the
            Error ID above.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
