/**
 * MFASetup Component
 * Two-factor authentication setup wizard with QR code
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Alert,
  Paper,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import QRCode from 'qrcode';
import SecurityIcon from '@mui/icons-material/Security';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { authService } from '../../services/auth/authService';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Install App', 'Scan QR Code', 'Verify', 'Backup Codes'];

  useEffect(() => {
    if (activeStep === 1) {
      generateQRCode();
    }
  }, [activeStep]);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.generateMfaSecret();
      setSecret(response.secret);

      // Generate QR code
      const otpauthUrl = `otpauth://totp/LexiFlow:${response.email}?secret=${response.secret}&issuer=LexiFlow`;
      const qrUrl = await QRCode.toDataURL(otpauthUrl);
      setQrCodeUrl(qrUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate MFA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.enableMfa(secret, verificationCode);
      setBackupCodes(response.backupCodes);
      handleNext();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const downloadBackupCodes = () => {
    const text = `LexiFlow MFA Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lexiflow-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SmartphoneIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Install an Authenticator App
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Download an authenticator app on your mobile device:
            </Typography>
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Chip label="Google Authenticator" color="primary" variant="outlined" />
              <Chip label="Microsoft Authenticator" color="primary" variant="outlined" />
              <Chip label="Authy" color="primary" variant="outlined" />
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Scan QR Code
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Open your authenticator app and scan this QR code:
                </Typography>
                {qrCodeUrl && (
                  <Box sx={{ my: 3 }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: 250 }} />
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Or enter this code manually:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    backgroundColor: 'grey.100',
                    display: 'inline-block',
                  }}
                >
                  <Typography variant="h6" fontFamily="monospace">
                    {secret}
                  </Typography>
                </Paper>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SecurityIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Verify Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter the 6-digit code from your authenticator app:
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '24px',
                  fontFamily: 'monospace',
                  letterSpacing: '8px',
                },
              }}
              sx={{ maxWidth: 300, mt: 2 }}
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <VerifiedUserIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Save Backup Codes
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Save these backup codes in a safe place. You can use them to sign in if you
              lose access to your authenticator app.
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Each code can only be used once!
            </Alert>
            <Paper
              sx={{
                p: 3,
                mt: 2,
                backgroundColor: 'grey.100',
                display: 'inline-block',
              }}
            >
              <Stack spacing={1}>
                {backupCodes.map((code, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {code}
                  </Typography>
                ))}
              </Stack>
            </Paper>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={downloadBackupCodes}>
                Download Codes
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Box>
          {activeStep > 0 && activeStep < 3 && (
            <Button onClick={handleBack} disabled={loading} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep < 2 && (
            <Button variant="contained" onClick={handleNext} disabled={loading}>
              Next
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          )}
          {activeStep === 3 && (
            <Button variant="contained" onClick={handleComplete} color="success">
              Complete Setup
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
