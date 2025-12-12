import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  message?: string;
  showSearch?: boolean;
}

/**
 * 404 Not Found Component
 * Displayed when a resource or page cannot be found
 */
export const NotFound: React.FC<NotFoundProps> = ({
  message,
  showSearch = true,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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
          {/* 404 Icon and Number */}
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
                color: 'primary.main',
                mr: 2,
              }}
            >
              404
            </Typography>
            <SearchOffIcon
              sx={{
                fontSize: { xs: 60, md: 80 },
                color: 'primary.main',
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom>
            Page Not Found
          </Typography>

          {/* Message */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {message ||
              "The page you're looking for doesn't exist or has been moved."}
          </Typography>

          {/* Search Form */}
          {showSearch && (
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ mb: 3 }}
            >
              <TextField
                fullWidth
                placeholder="Search for cases, documents, or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

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

          {/* Suggestions */}
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Helpful links:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/cases')}
                >
                  View All Cases
                </Button>
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/documents')}
                >
                  Browse Documents
                </Button>
              </Typography>
              <Typography component="li" variant="body2">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
