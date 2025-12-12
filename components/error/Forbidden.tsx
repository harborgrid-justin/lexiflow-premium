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
  Lock as LockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ContactSupport as ContactSupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ForbiddenProps {
  message?: string;
  requiredPermission?: string;
  resourceType?: string;
}

/**
 * 403 Forbidden Component
 * Displayed when user lacks permission to access a resource
 */
export const Forbidden: React.FC<ForbiddenProps> = ({
  message,
  requiredPermission,
  resourceType,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    navigate('/support');
  };

  const defaultMessage = requiredPermission
    ? `You don't have the required permission (${requiredPermission}) to access this ${resourceType || 'resource'}.`
    : "You don't have permission to access this resource.";

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
          {/* Lock Icon */}
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
              403
            </Typography>
            <LockIcon
              sx={{
                fontSize: { xs: 60, md: 80 },
                color: 'error.main',
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom>
            Access Forbidden
          </Typography>

          {/* Message */}
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1">
              {message || defaultMessage}
            </Typography>
          </Alert>

          {/* Information */}
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              What you can do:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Verify you are logged in with the correct account
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Contact your administrator to request access
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Check if your subscription includes this feature
              </Typography>
              <Typography component="li" variant="body2">
                Review your organization's permission settings
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              size="large"
            >
              Go to Homepage
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              size="large"
            >
              Go Back
            </Button>
          </Box>

          {/* Contact Support */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              startIcon={<ContactSupportIcon />}
              onClick={handleContactSupport}
            >
              Contact Support for Help
            </Button>
          </Box>

          {/* Additional Info */}
          {requiredPermission && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Required Permission: <strong>{requiredPermission}</strong>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
