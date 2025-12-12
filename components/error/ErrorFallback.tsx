import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface ErrorFallbackProps {
  error: Error | null;
  componentStack?: string;
  correlationId: string | null;
  onReset: () => void;
  onReportIssue: () => void;
}

/**
 * Error Fallback Component
 * Displays user-friendly error message with options to reset or report
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  componentStack,
  correlationId,
  onReset,
  onReportIssue,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyCorrelationId = () => {
    if (correlationId) {
      navigator.clipboard.writeText(correlationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          }}
        >
          {/* Error Icon and Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              color: 'error.main',
            }}
          >
            <ErrorIcon sx={{ fontSize: 48, mr: 2 }} />
            <Typography variant="h4" component="h1">
              Oops! Something went wrong
            </Typography>
          </Box>

          {/* Error Message */}
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              We're sorry, but an unexpected error occurred. The development team has been
              notified.
            </Typography>
            {error && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                {error.message}
              </Typography>
            )}
          </Alert>

          {/* Correlation ID */}
          {correlationId && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Error ID (for support):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  {correlationId}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyCorrelationId}
                  title="Copy correlation ID"
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              {copied && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                  Copied to clipboard!
                </Typography>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              fullWidth
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<BugReportIcon />}
              onClick={onReportIssue}
              fullWidth
            >
              Report Issue
            </Button>
          </Box>

          {/* Developer Details (Collapsible) */}
          {(error || componentStack) && process.env.NODE_ENV === 'development' && (
            <Box>
              <Button
                size="small"
                onClick={() => setShowDetails(!showDetails)}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                }
              >
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>

              <Collapse in={showDetails}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  {error && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Error:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {error.stack || error.toString()}
                      </Typography>
                    </Box>
                  )}

                  {componentStack && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Component Stack:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {componentStack}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Help Text */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            If this problem persists, please contact support with the Error ID above.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
