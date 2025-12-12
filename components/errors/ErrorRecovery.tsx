/**
 * ErrorRecovery.tsx
 * Error recovery UI components with multiple recovery strategies
 * Provides user-friendly error messages and recovery actions
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorRecoveryProps {
  error: Error | string;
  severity?: ErrorSeverity;
  title?: string;
  message?: string;
  recoveryActions?: RecoveryAction[];
  onRecover?: () => void;
  showStack?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  icon?: string;
  primary?: boolean;
}

// ============================================================================
// ErrorRecovery Component
// ============================================================================

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  severity = 'medium',
  title,
  message,
  recoveryActions,
  onRecover,
  showStack = false,
  autoRetry = false,
  retryDelay = 3000,
  maxRetries = 3,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  // ============================================================================
  // Auto Retry Logic
  // ============================================================================

  useEffect(() => {
    if (autoRetry && retryCount < maxRetries && !isRetrying) {
      setIsRetrying(true);
      setCountdown(Math.ceil(retryDelay / 1000));

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
        onRecover?.();
      }, retryDelay);

      return () => {
        clearTimeout(retryTimeout);
        clearInterval(countdownInterval);
      };
    }
  }, [autoRetry, retryCount, maxRetries, retryDelay, isRetrying, onRecover]);

  // ============================================================================
  // Severity Configuration
  // ============================================================================

  const config = getSeverityConfig(severity);

  // ============================================================================
  // Default Recovery Actions
  // ============================================================================

  const defaultActions: RecoveryAction[] = [
    {
      label: 'Try Again',
      action: () => {
        setRetryCount(0);
        onRecover?.();
      },
      icon: '🔄',
      primary: true,
    },
    {
      label: 'Reload Page',
      action: () => window.location.reload(),
      icon: '↻',
    },
    {
      label: 'Go Home',
      action: () => window.location.href = '/',
      icon: '🏠',
    },
  ];

  const actions = recoveryActions || defaultActions;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div style={{ ...styles.container, ...config.containerStyle }}>
      <div style={styles.content}>
        {/* Icon */}
        <div style={{ ...styles.icon, ...config.iconStyle }}>
          {config.icon}
        </div>

        {/* Title */}
        <h2 style={styles.title}>
          {title || config.title}
        </h2>

        {/* Message */}
        <p style={styles.message}>
          {message || errorMessage}
        </p>

        {/* Auto Retry Countdown */}
        {autoRetry && isRetrying && retryCount < maxRetries && (
          <div style={styles.retryBanner}>
            <p style={styles.retryText}>
              Retrying in {countdown} second{countdown !== 1 ? 's' : ''}...
              (Attempt {retryCount + 1} of {maxRetries})
            </p>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((retryDelay / 1000 - countdown) / (retryDelay / 1000)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Max Retries Reached */}
        {autoRetry && retryCount >= maxRetries && (
          <div style={styles.maxRetriesBanner}>
            <p>Maximum retry attempts reached. Please try manual recovery.</p>
          </div>
        )}

        {/* Recovery Actions */}
        <div style={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              style={action.primary ? styles.primaryButton : styles.secondaryButton}
            >
              {action.icon && <span style={styles.buttonIcon}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>

        {/* Stack Trace (Development) */}
        {showStack && errorStack && (
          <details style={styles.stackDetails}>
            <summary style={styles.stackSummary}>Show Error Details</summary>
            <pre style={styles.stackTrace}>{errorStack}</pre>
          </details>
        )}

        {/* Support Information */}
        <div style={styles.support}>
          <p style={styles.supportText}>
            Need help? Contact support at{' '}
            <a href="mailto:support@lexiflow.com" style={styles.supportLink}>
              support@lexiflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Severity Configuration
// ============================================================================

function getSeverityConfig(severity: ErrorSeverity) {
  const configs = {
    low: {
      icon: 'ℹ️',
      title: 'Information',
      containerStyle: { backgroundColor: '#e3f2fd' },
      iconStyle: { color: '#1976d2' },
    },
    medium: {
      icon: '⚠️',
      title: 'Warning',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    },
    high: {
      icon: '❌',
      title: 'Error',
      containerStyle: { backgroundColor: '#ffebee' },
      iconStyle: { color: '#d32f2f' },
    },
    critical: {
      icon: '🚨',
      title: 'Critical Error',
      containerStyle: { backgroundColor: '#fce4ec' },
      iconStyle: { color: '#c2185b' },
    },
  };

  return configs[severity];
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '20px',
    borderRadius: '8px',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1a1a1a',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  retryBanner: {
    backgroundColor: '#fff',
    border: '2px solid #2196f3',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
  },
  retryText: {
    margin: '0 0 8px 0',
    color: '#1976d2',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e3f2fd',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    transition: 'width 0.3s ease',
  },
  maxRetriesBanner: {
    backgroundColor: '#fff3e0',
    border: '2px solid #f57c00',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
    color: '#e65100',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  primaryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#007bff',
    backgroundColor: 'white',
    border: '2px solid #007bff',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  stackDetails: {
    textAlign: 'left',
    marginTop: '24px',
    backgroundColor: 'white',
    borderRadius: '6px',
    padding: '16px',
  },
  stackSummary: {
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#666',
  },
  stackTrace: {
    fontSize: '12px',
    color: '#333',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '12px',
    overflow: 'auto',
    maxHeight: '200px',
  },
  support: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  supportText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  supportLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default ErrorRecovery;
