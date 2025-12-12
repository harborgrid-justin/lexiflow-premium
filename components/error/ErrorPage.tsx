import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showSupportButton?: boolean;
}

/**
 * Error Page Component
 * Full-page error display for routing errors (404, 500, etc.)
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title,
  message,
  showHomeButton = true,
  showBackButton = true,
  showSupportButton = true,
}) => {
  const navigate = useNavigate();

  const getDefaultContent = () => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Page Not Found',
          message:
            "The page you're looking for doesn't exist or has been moved.",
        };
      case 403:
        return {
          title: 'Access Denied',
          message: "You don't have permission to access this resource.",
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'Please log in to access this page.',
        };
      case 500:
        return {
          title: 'Server Error',
          message:
            'An internal server error occurred. Please try again later.',
        };
      default:
        return {
          title: 'Error',
          message: 'An unexpected error occurred.',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    // Navigate to support page or open support modal
    navigate('/support');
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
            p: 6,
            width: '100%',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          {/* Status Code */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: statusCode === 404 ? 'warning.main' : 'error.main',
                mr: 2,
              }}
            />
            <Typography
              variant="h1"
              component="div"
              sx={{
                fontSize: '6rem',
                fontWeight: 700,
                color: statusCode === 404 ? 'warning.main' : 'error.main',
                lineHeight: 1,
              }}
            >
              {statusCode}
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom>
            {displayTitle}
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            {displayMessage}
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            {showHomeButton && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                size="large"
              >
                Go Home
              </Button>
            )}

            {showBackButton && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<BackIcon />}
                onClick={handleGoBack}
                size="large"
              >
                Go Back
              </Button>
            )}

            {showSupportButton && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SupportIcon />}
                onClick={handleContactSupport}
                size="large"
              >
                Contact Support
              </Button>
            )}
          </Stack>

          {/* Additional Help Text */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            If you believe this is a mistake, please contact our support team.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * Specific error page components for common status codes
 */
export const NotFoundPage: React.FC = () => (
  <ErrorPage statusCode={404} />
);

export const UnauthorizedPage: React.FC = () => (
  <ErrorPage statusCode={401} showBackButton={false} />
);

export const ForbiddenPage: React.FC = () => (
  <ErrorPage statusCode={403} />
);

export const ServerErrorPage: React.FC = () => (
  <ErrorPage statusCode={500} showBackButton={false} />
);
