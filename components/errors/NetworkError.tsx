/**
 * NetworkError.tsx
 * Network error handling component with retry and offline support
 * Handles various HTTP error codes and connection issues
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface NetworkErrorProps {
  error: NetworkErrorData;
  onRetry?: () => void | Promise<void>;
  onCancel?: () => void;
  showDetails?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface NetworkErrorData {
  status?: number;
  statusText?: string;
  message?: string;
  url?: string;
  method?: string;
  responseData?: any;
  type?: 'offline' | 'timeout' | 'server' | 'client' | 'unknown';
}

// ============================================================================
// NetworkError Component
// ============================================================================

export const NetworkError: React.FC<NetworkErrorProps> = ({
  error,
  onRetry,
  onCancel,
  showDetails = false,
  autoRetry = false,
  maxRetries = 3,
  retryDelay = 3000,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const config = getErrorConfig(error);

  // ============================================================================
  // Auto Retry Logic
  // ============================================================================

  useEffect(() => {
    if (autoRetry && onRetry && retryCount < maxRetries && !isRetrying) {
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

      const retryTimeout = setTimeout(async () => {
        await handleRetry();
        clearInterval(countdownInterval);
      }, retryDelay);

      return () => {
        clearTimeout(retryTimeout);
        clearInterval(countdownInterval);
      };
    }
  }, [autoRetry, retryCount, maxRetries, retryDelay, isRetrying, onRetry]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry?.();
      setRetryCount(0);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = () => {
    setRetryCount(0);
    setIsRetrying(false);
    onCancel?.();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div style={{ ...styles.container, ...config.containerStyle }}>
      <div style={styles.content}>
        {/* Icon */}
        <div style={styles.iconContainer}>
          <span style={{ ...styles.icon, ...config.iconStyle }}>
            {config.icon}
          </span>
        </div>

        {/* Title */}
        <h3 style={styles.title}>{config.title}</h3>

        {/* Message */}
        <p style={styles.message}>
          {error.message || config.message}
        </p>

        {/* Status Code */}
        {error.status && (
          <div style={styles.statusBadge}>
            <span style={styles.statusCode}>{error.status}</span>
            <span style={styles.statusText}>{error.statusText || 'Error'}</span>
          </div>
        )}

        {/* Auto Retry Progress */}
        {autoRetry && isRetrying && retryCount < maxRetries && (
          <div style={styles.retryContainer}>
            <p style={styles.retryText}>
              Retrying in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${((retryDelay / 1000 - countdown) / (retryDelay / 1000)) * 100}%`,
                }}
              />
            </div>
            <p style={styles.attemptText}>
              Attempt {retryCount + 1} of {maxRetries}
            </p>
          </div>
        )}

        {/* Max Retries Reached */}
        {autoRetry && retryCount >= maxRetries && (
          <div style={styles.maxRetriesAlert}>
            <p>❌ Maximum retry attempts reached</p>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          {onRetry && (!autoRetry || retryCount >= maxRetries) && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              style={styles.retryButton}
            >
              {isRetrying ? '⏳ Retrying...' : '🔄 Try Again'}
            </button>
          )}

          {onCancel && (
            <button onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
          )}

          {!onRetry && !onCancel && (
            <button onClick={() => window.location.reload()} style={styles.reloadButton}>
              ↻ Reload Page
            </button>
          )}
        </div>

        {/* Error Details */}
        {showDetails && (
          <details style={styles.details}>
            <summary style={styles.detailsSummary}>Show Technical Details</summary>
            <div style={styles.detailsContent}>
              {error.method && error.url && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Request:</span>
                  <code style={styles.detailValue}>
                    {error.method} {error.url}
                  </code>
                </div>
              )}

              {error.status && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Status:</span>
                  <code style={styles.detailValue}>
                    {error.status} {error.statusText}
                  </code>
                </div>
              )}

              {error.responseData && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Response:</span>
                  <pre style={styles.responseData}>
                    {JSON.stringify(error.responseData, null, 2)}
                  </pre>
                </div>
              )}

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Timestamp:</span>
                <code style={styles.detailValue}>
                  {new Date().toISOString()}
                </code>
              </div>
            </div>
          </details>
        )}

        {/* Help Text */}
        {config.helpText && (
          <p style={styles.helpText}>
            💡 {config.helpText}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Error Configuration
// ============================================================================

function getErrorConfig(error: NetworkErrorData) {
  // Offline
  if (error.type === 'offline' || !navigator.onLine) {
    return {
      icon: '📡',
      title: 'No Internet Connection',
      message: 'Please check your internet connection and try again.',
      helpText: 'You appear to be offline. Your changes will be saved locally and synced when you reconnect.',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    };
  }

  // Timeout
  if (error.type === 'timeout') {
    return {
      icon: '⏱️',
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      helpText: 'This might be due to slow internet or server issues.',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    };
  }

  // By status code
  const status = error.status;

  if (status === 400) {
    return {
      icon: '❌',
      title: 'Bad Request',
      message: 'The request could not be understood by the server.',
      helpText: 'Please check your input and try again.',
      containerStyle: { backgroundColor: '#ffebee' },
      iconStyle: { color: '#d32f2f' },
    };
  }

  if (status === 401) {
    return {
      icon: '🔒',
      title: 'Authentication Required',
      message: 'You need to log in to access this resource.',
      helpText: 'Your session may have expired. Please log in again.',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    };
  }

  if (status === 403) {
    return {
      icon: '🚫',
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
      helpText: 'Contact your administrator if you believe this is a mistake.',
      containerStyle: { backgroundColor: '#ffebee' },
      iconStyle: { color: '#d32f2f' },
    };
  }

  if (status === 404) {
    return {
      icon: '🔍',
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      helpText: 'The page or resource you\'re looking for may have been moved or deleted.',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    };
  }

  if (status === 429) {
    return {
      icon: '⏸️',
      title: 'Too Many Requests',
      message: 'You\'ve made too many requests. Please wait a moment and try again.',
      helpText: 'Rate limiting is in place to protect the service.',
      containerStyle: { backgroundColor: '#fff3e0' },
      iconStyle: { color: '#f57c00' },
    };
  }

  if (status && status >= 500) {
    return {
      icon: '🔧',
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'re working to fix it.',
      helpText: 'Please try again in a few moments.',
      containerStyle: { backgroundColor: '#ffebee' },
      iconStyle: { color: '#d32f2f' },
    };
  }

  // Default
  return {
    icon: '⚠️',
    title: 'Network Error',
    message: 'A network error occurred. Please try again.',
    helpText: 'If the problem persists, please contact support.',
    containerStyle: { backgroundColor: '#fff3e0' },
    iconStyle: { color: '#f57c00' },
  };
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '20px auto',
  },
  content: {
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  icon: {
    fontSize: '48px',
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
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f5f5f5',
    padding: '8px 16px',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  statusCode: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#d32f2f',
  },
  statusText: {
    fontSize: '14px',
    color: '#666',
  },
  retryContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  retryText: {
    margin: '0 0 8px 0',
    color: '#1976d2',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#bbdefb',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    transition: 'width 0.3s ease',
  },
  attemptText: {
    margin: 0,
    fontSize: '12px',
    color: '#1976d2',
  },
  maxRetriesAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  retryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2196f3',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'white',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  reloadButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#4caf50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  details: {
    textAlign: 'left',
    backgroundColor: 'white',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '20px',
  },
  detailsSummary: {
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
    marginBottom: '12px',
  },
  detailsContent: {
    fontSize: '14px',
  },
  detailRow: {
    marginBottom: '12px',
  },
  detailLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333',
  },
  detailValue: {
    display: 'block',
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '13px',
    wordBreak: 'break-all',
  },
  responseData: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: '12px',
  },
  helpText: {
    fontSize: '14px',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '16px',
  },
};

export default NetworkError;
