/**
 * PasswordStrength Component
 * Real-time password strength indicator with visual feedback
 */

import React, { useMemo } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showRequirements = true,
}) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: 'Contains number',
      test: (pwd) => /\d/.test(pwd),
    },
    {
      label: 'Contains special character (@$!%*?&)',
      test: (pwd) => /[@$!%*?&]/.test(pwd),
    },
  ];

  const { strength, score, color } = useMemo(() => {
    if (!password) {
      return { strength: 'None', score: 0, color: 'error' };
    }

    const passedRequirements = requirements.filter((req) =>
      req.test(password)
    ).length;
    const score = (passedRequirements / requirements.length) * 100;

    let strength: string;
    let color: 'error' | 'warning' | 'info' | 'success';

    if (score < 40) {
      strength = 'Weak';
      color = 'error';
    } else if (score < 60) {
      strength = 'Fair';
      color = 'warning';
    } else if (score < 80) {
      strength = 'Good';
      color = 'info';
    } else {
      strength = 'Strong';
      color = 'success';
    }

    return { strength, score, color };
  }, [password]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 2, minWidth: 80 }}>
          Strength: <strong>{strength}</strong>
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            color={color}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>

      {showRequirements && password && (
        <List dense sx={{ mt: 2 }}>
          {requirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {passed ? (
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{ color: 'success.main' }}
                    />
                  ) : (
                    <CancelIcon fontSize="small" sx={{ color: 'error.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={req.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: passed ? 'text.primary' : 'text.secondary',
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};
