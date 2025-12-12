import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onComplete,
  onCancel,
}) => {
  const { user, enableTwoFactor, disableTwoFactor, verifyTwoFactorSetup } = useAuth();
  const [step, setStep] = useState<'init' | 'setup' | 'verify' | 'disable'>('init');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user?.mfaEnabled) {
      setStep('init');
    }
  }, [user]);

  const handleEnableTwoFactor = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await enableTwoFactor(password);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep('setup');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to enable two-factor authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    setError(null);
    setLoading(true);

    try {
      await verifyTwoFactorSetup(secret, verificationCode);
      setSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setError(null);
    setLoading(true);

    try {
      await disableTwoFactor(password, verificationCode);
      setSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable two-factor authentication.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'init') {
    return (
      <div className="auth-form two-factor-setup">
        <h2>Two-Factor Authentication</h2>

        {user?.mfaEnabled ? (
          <div className="mfa-status">
            <div className="status-badge enabled">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              Two-Factor Authentication is Enabled
            </div>
            <p className="status-description">
              Your account is protected with two-factor authentication. You'll need to
              enter a code from your authenticator app when you sign in.
            </p>
            <button
              type="button"
              onClick={() => setStep('disable')}
              className="btn-danger"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        ) : (
          <div className="mfa-status">
            <div className="status-badge disabled">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v7h-2V7zm0 8h2v2h-2v-2z"/>
              </svg>
              Two-Factor Authentication is Disabled
            </div>
            <p className="status-description">
              Protect your account with an additional layer of security. After enabling,
              you'll need to enter both your password and a code from your authenticator
              app to sign in.
            </p>

            <div className="form-group">
              <label htmlFor="password">Confirm Your Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="button"
              onClick={handleEnableTwoFactor}
              disabled={loading || !password}
              className="btn-primary"
            >
              {loading ? 'Processing...' : 'Enable Two-Factor Authentication'}
            </button>
          </div>
        )}

        <div className="auth-links">
          <button type="button" onClick={onCancel} className="link-button">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="auth-form two-factor-setup">
        <h2>Set Up Authenticator App</h2>

        <div className="setup-steps">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Download an Authenticator App</h3>
              <p>
                If you don't have one already, download an authenticator app like:
              </p>
              <ul>
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Scan the QR Code</h3>
              <p>Use your authenticator app to scan this QR code:</p>
              {qrCode && (
                <div className="qr-code-container">
                  <img src={qrCode} alt="QR Code" />
                </div>
              )}
              <details className="manual-entry">
                <summary>Can't scan? Enter code manually</summary>
                <div className="secret-code">
                  <code>{secret}</code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(secret)}
                    className="btn-copy"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </details>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Enter Verification Code</h3>
              <p>Enter the 6-digit code from your authenticator app:</p>
              <div className="form-group">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  autoFocus
                  className="code-input"
                />
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success ? (
          <div className="success-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Two-Factor Authentication Enabled</h3>
            <p>Your account is now protected with 2FA.</p>
          </div>
        ) : (
          <div className="button-group">
            <button
              type="button"
              onClick={handleVerifySetup}
              disabled={loading || verificationCode.length !== 6}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('init');
                setQrCode('');
                setSecret('');
                setVerificationCode('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'disable') {
    return (
      <div className="auth-form two-factor-setup">
        <h2>Disable Two-Factor Authentication</h2>

        <div className="warning-message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <p>
            Disabling two-factor authentication will make your account less secure.
            Are you sure you want to continue?
          </p>
        </div>

        {success ? (
          <div className="success-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Two-Factor Authentication Disabled</h3>
            <p>Your account no longer requires 2FA to sign in.</p>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="password">Confirm Your Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Authentication Code</label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="\d{6}"
                required
              />
              <small className="form-hint">
                Enter the code from your authenticator app
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button
                type="button"
                onClick={handleDisableTwoFactor}
                disabled={loading || !password || verificationCode.length !== 6}
                className="btn-danger"
              >
                {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
              </button>
              <button
                type="button"
                onClick={() => setStep('init')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};
