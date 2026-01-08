import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Key,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

/**
 * MFA Setup Wizard Component
 * Guides users through setting up multiple MFA methods
 */

type MFAMethod = 'totp' | 'sms' | 'webauthn' | 'backup';

interface MFASetupWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
  availableMethods?: MFAMethod[];
  apiBaseUrl?: string;
}

interface StepConfig {
  id: MFAMethod;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEP_CONFIGS: Record<MFAMethod, StepConfig> = {
  totp: {
    id: 'totp',
    title: 'Authenticator App',
    description: 'Use Google Authenticator, Authy, or similar apps',
    icon: Smartphone,
  },
  webauthn: {
    id: 'webauthn',
    title: 'Security Key',
    description: 'Use YubiKey, Touch ID, or Windows Hello',
    icon: Key,
  },
  sms: {
    id: 'sms',
    title: 'SMS Verification',
    description: 'Receive codes via text message',
    icon: Smartphone,
  },
  backup: {
    id: 'backup',
    title: 'Backup Codes',
    description: 'Download emergency recovery codes',
    icon: FileText,
  },
};

export const MFASetupWizard: React.FC<MFASetupWizardProps> = ({
  onComplete,
  onCancel,
  availableMethods = ['totp', 'webauthn', 'sms', 'backup'],
  apiBaseUrl = '/api',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<MFAMethod>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TOTP state
  const [qrCode, setQrCode] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');

  // SMS state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [smsCode, setSmsCode] = useState<string>('');
  const [smsSent, setSmsSent] = useState(false);

  // WebAuthn state
  const [webAuthnName, setWebAuthnName] = useState<string>('');

  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codesCopied, setCodesCopied] = useState(false);

  const steps = availableMethods.map((method) => STEP_CONFIGS[method]);
  const currentStepConfig = steps[currentStep];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
      onComplete?.();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const markStepCompleted = (step: MFAMethod) => {
    setCompletedSteps(new Set(completedSteps).add(step));
  };

  // TOTP Methods
  const setupTOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/enable-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to setup TOTP');

      const data = await response.json();
      setQrCode(data.qrCode);
      setTotpSecret(data.secret);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ code: totpCode }),
      });

      if (!response.ok) throw new Error('Invalid code');

      markStepCompleted('totp');
      handleNextStep();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // SMS Methods
  const setupSMS = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/mfa/sms/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) throw new Error('Failed to send SMS');

      setSmsSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/mfa/sms/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ phoneNumber, code: smsCode }),
      });

      if (!response.ok) throw new Error('Invalid code');

      markStepCompleted('sms');
      handleNextStep();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // WebAuthn Methods
  const setupWebAuthn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Start WebAuthn registration
      const startResponse = await fetch(
        `${apiBaseUrl}/auth/mfa/webauthn/register/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ friendlyName: webAuthnName || 'Security Key' }),
        }
      );

      if (!startResponse.ok) throw new Error('Failed to start WebAuthn registration');

      const challenge = await startResponse.json();

      // Create credential (simplified - needs WebAuthn API)
      // In production, use @simplewebauthn/browser
      console.log('WebAuthn challenge:', challenge);

      markStepCompleted('webauthn');
      handleNextStep();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Backup Codes Methods
  const generateBackupCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/mfa/backup-codes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ count: 10 }),
      });

      if (!response.ok) throw new Error('Failed to generate backup codes');

      const data = await response.json();
      setBackupCodes(data.codes);
      markStepCompleted('backup');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lexiflow-backup-codes.txt';
    a.click();
  };

  useEffect(() => {
    if (currentStepConfig?.id === 'totp' && !qrCode) {
      setupTOTP();
    } else if (currentStepConfig?.id === 'backup' && backupCodes.length === 0) {
      generateBackupCodes();
    }
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStepConfig?.id) {
      case 'totp':
        return (
          <div className="space-y-4">
            {qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Manual Entry Code:</p>
                  <code className="text-sm font-mono">{totpSecret}</code>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={verifyTOTP}
                  disabled={loading || totpCode.length !== 6}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Continue'}
                </button>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            {!smsSent ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  onClick={setupSMS}
                  disabled={loading || !phoneNumber}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Code'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Code sent to {phoneNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={verifySMS}
                  disabled={loading || smsCode.length !== 6}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Continue'}
                </button>
              </>
            )}
          </div>
        );

      case 'webauthn':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Insert your security key or prepare to use biometric authentication.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Device Name (optional)
              </label>
              <input
                type="text"
                value={webAuthnName}
                onChange={(e) => setWebAuthnName(e.target.value)}
                placeholder="My YubiKey"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={setupWebAuthn}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Register Security Key'}
            </button>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-4">
            {backupCodes.length > 0 ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important!</p>
                      <p>Save these codes securely. Each code can only be used once.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyBackupCodes}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
                  >
                    {codesCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span>{codesCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                </div>
                <button
                  onClick={handleNextStep}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  I've Saved My Codes
                </button>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">MFA Setup</h2>
              <p className="text-blue-100 text-sm">Secure your account</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepConfig && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <currentStepConfig.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {currentStepConfig.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentStepConfig.description}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {renderStepContent()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={currentStep === 0 ? onCancel : handlePreviousStep}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 0 ? 'Cancel' : 'Back'}</span>
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep === steps.length - 1 && (
            <button
              onClick={onComplete}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Finish</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MFASetupWizard;
