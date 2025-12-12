/**
 * RememberMe Component
 * Checkbox component for "Remember Me" functionality with device trust info
 */

import React from 'react';
import {
  FormControlLabel,
  Checkbox,
  Box,
  Tooltip,
  Typography,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showInfo?: boolean;
}

export const RememberMe: React.FC<RememberMeProps> = ({
  checked,
  onChange,
  disabled = false,
  showInfo = true,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            color="primary"
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            Remember me on this device
          </Typography>
        }
      />
      {showInfo && (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Remember Me</strong>
              </Typography>
              <Typography variant="caption" display="block">
                When enabled, you'll stay logged in on this device for 30 days. Your session will persist even after closing the browser.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                <strong>Security Note:</strong> Only enable this on devices you trust and use regularly.
              </Typography>
            </Box>
          }
          arrow
          placement="right"
        >
          <InfoIcon
            sx={{
              fontSize: 18,
              color: 'text.disabled',
              cursor: 'help',
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default RememberMe;
