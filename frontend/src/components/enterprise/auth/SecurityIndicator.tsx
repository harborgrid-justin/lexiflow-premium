/**
 * SecurityIndicator Component
 * Visual security status and alerts for authentication flows
 *
 * Features:
 * - Connection security status (HTTPS/HTTP)
 * - Account security health score
 * - MFA status indicator
 * - Session security warnings
 * - Suspicious activity alerts
 * - Last login information
 * - WCAG 2.1 AA compliant
 */

export type SecurityLevel = 'secure' | 'warning' | 'danger';

export interface SecurityStatus {
  level: SecurityLevel;
  mfaEnabled: boolean;
  lastLogin?: {
    timestamp: string;
    ip: string;
    location?: string;
  };
  suspiciousActivity?: boolean;
  accountAge?: number; // days
  passwordAge?: number; // days
}

export interface SecurityIndicatorProps {
  status: SecurityStatus;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  status,
  showDetails = false,
  compact = false,
  className = '',
}) => {
  const getSecurityScore = (): number => {
    let score = 100;

    // MFA not enabled
    if (!status.mfaEnabled) {
      score -= 40;
    }

    // Suspicious activity
    if (status.suspiciousActivity) {
      score -= 30;
    }

    // Password age (should be changed regularly)
    if (status.passwordAge && status.passwordAge > 90) {
      score -= 20;
    } else if (status.passwordAge && status.passwordAge > 180) {
      score -= 30;
    }

    // New account (slightly less trusted)
    if (status.accountAge && status.accountAge < 7) {
      score -= 10;
    }

    return Math.max(0, score);
  };

  const score = getSecurityScore();

  const getSecurityLevelFromScore = (score: number): SecurityLevel => {
    if (score >= 80) return 'secure';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const level = status.level || getSecurityLevelFromScore(score);

  const levelConfig = {
    secure: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      label: 'Secure Connection',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      label: 'Security Warning',
    },
    danger: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      label: 'Security Alert',
    },
  };

  const config = levelConfig[level];

  const formatLastLogin = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
  };

  // Compact version (for headers/nav)
  if (compact) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
          <div className={config.iconColor}>
            {config.icon}
          </div>
          <span className={`text-xs font-medium ${config.textColor}`}>
            {status.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </h3>

          {showDetails && (
            <div className={`mt-2 text-xs ${config.textColor} space-y-2`}>
              {/* Security Score */}
              <div className="flex items-center justify-between">
                <span>Security Score:</span>
                <span className="font-semibold">{score}/100</span>
              </div>

              {/* MFA Status */}
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication:</span>
                <span className={`font-semibold ${status.mfaEnabled ? 'text-green-700' : 'text-red-700'}`}>
                  {status.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* Last Login */}
              {status.lastLogin && (
                <div className="pt-2 border-t border-current opacity-30">
                  <div className="opacity-100">
                    <p className="font-medium mb-1">Last Login:</p>
                    <p>{formatLastLogin(status.lastLogin.timestamp)}</p>
                    <p className="flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {status.lastLogin.ip}
                      {status.lastLogin.location && ` · ${status.lastLogin.location}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {level !== 'secure' && (
                <div className="pt-2 border-t border-current opacity-30">
                  <div className="opacity-100">
                    <p className="font-medium mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                      {!status.mfaEnabled && (
                        <li>Enable two-factor authentication</li>
                      )}
                      {status.passwordAge && status.passwordAge > 90 && (
                        <li>Change your password</li>
                      )}
                      {status.suspiciousActivity && (
                        <li>Review recent account activity</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ConnectionSecurityBadge Component
 * Shows HTTPS/HTTP connection status
 */
export interface ConnectionSecurityBadgeProps {
  className?: string;
}

export const ConnectionSecurityBadge: React.FC<ConnectionSecurityBadgeProps> = ({
  className = '',
}) => {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (isSecure) {
    return (
      <div className={`inline-flex items-center space-x-1 text-green-700 ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-medium">Secure Connection</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 text-yellow-700 ${className}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-xs font-medium">Insecure Connection</span>
    </div>
  );
};
