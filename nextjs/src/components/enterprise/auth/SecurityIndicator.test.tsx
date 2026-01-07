/**
 * @fileoverview Enterprise-grade tests for SecurityIndicator and ConnectionSecurityBadge components
 * Tests security score calculation, status display, and visual indicators
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SecurityIndicator, ConnectionSecurityBadge, type SecurityStatus } from './SecurityIndicator';

expect.extend(toHaveNoViolations);

describe('SecurityIndicator', () => {
  const secureStatus: SecurityStatus = {
    level: 'secure',
    mfaEnabled: true,
    lastLogin: {
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      ip: '192.168.1.1',
      location: 'New York, US'
    },
    accountAge: 365,
    passwordAge: 30
  };

  const warningStatus: SecurityStatus = {
    level: 'warning',
    mfaEnabled: false,
    lastLogin: {
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      ip: '10.0.0.1'
    },
    accountAge: 30,
    passwordAge: 100
  };

  const dangerStatus: SecurityStatus = {
    level: 'danger',
    mfaEnabled: false,
    suspiciousActivity: true,
    lastLogin: {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      ip: '10.0.0.1'
    },
    passwordAge: 200
  };

  describe('Rendering - Default View', () => {
    it('renders with required props', () => {
      render(<SecurityIndicator status={secureStatus} />);

      expect(screen.getByText('Secure Connection')).toBeInTheDocument();
    });

    it('displays secure status', () => {
      render(<SecurityIndicator status={secureStatus} />);

      expect(screen.getByText('Secure Connection')).toBeInTheDocument();
    });

    it('displays warning status', () => {
      render(<SecurityIndicator status={warningStatus} />);

      expect(screen.getByText('Security Warning')).toBeInTheDocument();
    });

    it('displays danger status', () => {
      render(<SecurityIndicator status={dangerStatus} />);

      expect(screen.getByText('Security Alert')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SecurityIndicator status={secureStatus} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Compact View', () => {
    it('renders compact version', () => {
      render(<SecurityIndicator status={secureStatus} compact />);

      expect(screen.getByText('MFA Enabled')).toBeInTheDocument();
    });

    it('shows MFA Disabled in compact mode when MFA is off', () => {
      render(<SecurityIndicator status={warningStatus} compact />);

      expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
    });

    it('does not show details in compact mode', () => {
      render(<SecurityIndicator status={secureStatus} compact />);

      expect(screen.queryByText('Security Score:')).not.toBeInTheDocument();
    });
  });

  describe('Detailed View', () => {
    it('shows security score when showDetails is true', () => {
      render(<SecurityIndicator status={secureStatus} showDetails />);

      expect(screen.getByText('Security Score:')).toBeInTheDocument();
    });

    it('shows MFA status in details', () => {
      render(<SecurityIndicator status={secureStatus} showDetails />);

      expect(screen.getByText('Two-Factor Authentication:')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('shows MFA disabled when not enabled', () => {
      render(<SecurityIndicator status={warningStatus} showDetails />);

      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('shows last login information', () => {
      render(<SecurityIndicator status={secureStatus} showDetails />);

      expect(screen.getByText('Last Login:')).toBeInTheDocument();
      expect(screen.getByText(/192.168.1.1/)).toBeInTheDocument();
      expect(screen.getByText(/New York, US/)).toBeInTheDocument();
    });

    it('formats last login time correctly - minutes', () => {
      const status: SecurityStatus = {
        ...secureStatus,
        lastLogin: {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          ip: '192.168.1.1'
        }
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
    });

    it('formats last login time correctly - hours', () => {
      const status: SecurityStatus = {
        ...secureStatus,
        lastLogin: {
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.1'
        }
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText(/3 hours ago/)).toBeInTheDocument();
    });

    it('formats last login time correctly - days', () => {
      const status: SecurityStatus = {
        ...secureStatus,
        lastLogin: {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.1'
        }
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
    });

    it('shows just now for recent login', () => {
      const status: SecurityStatus = {
        ...secureStatus,
        lastLogin: {
          timestamp: new Date().toISOString(),
          ip: '192.168.1.1'
        }
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText(/just now/)).toBeInTheDocument();
    });
  });

  describe('Security Score Calculation', () => {
    it('calculates full score for secure status', () => {
      render(<SecurityIndicator status={secureStatus} showDetails />);

      expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('penalizes for MFA disabled', () => {
      const status: SecurityStatus = {
        level: 'warning',
        mfaEnabled: false
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText('60/100')).toBeInTheDocument();
    });

    it('penalizes for suspicious activity', () => {
      const status: SecurityStatus = {
        level: 'danger',
        mfaEnabled: true,
        suspiciousActivity: true
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText('70/100')).toBeInTheDocument();
    });

    it('penalizes for old password', () => {
      const status: SecurityStatus = {
        level: 'warning',
        mfaEnabled: true,
        passwordAge: 100
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText('80/100')).toBeInTheDocument();
    });

    it('penalizes for new account', () => {
      const status: SecurityStatus = {
        level: 'secure',
        mfaEnabled: true,
        accountAge: 3
      };

      render(<SecurityIndicator status={status} showDetails />);

      expect(screen.getByText('90/100')).toBeInTheDocument();
    });
  });

  describe('Recommendations', () => {
    it('shows recommendations for non-secure status', () => {
      render(<SecurityIndicator status={warningStatus} showDetails />);

      expect(screen.getByText('Recommendations:')).toBeInTheDocument();
    });

    it('does not show recommendations for secure status', () => {
      render(<SecurityIndicator status={secureStatus} showDetails />);

      expect(screen.queryByText('Recommendations:')).not.toBeInTheDocument();
    });

    it('recommends enabling MFA when disabled', () => {
      render(<SecurityIndicator status={warningStatus} showDetails />);

      expect(screen.getByText('Enable two-factor authentication')).toBeInTheDocument();
    });

    it('recommends password change when old', () => {
      render(<SecurityIndicator status={warningStatus} showDetails />);

      expect(screen.getByText('Change your password')).toBeInTheDocument();
    });

    it('recommends reviewing activity when suspicious', () => {
      render(<SecurityIndicator status={dangerStatus} showDetails />);

      expect(screen.getByText('Review recent account activity')).toBeInTheDocument();
    });
  });

  describe('Color Classes', () => {
    it('applies green styling for secure status', () => {
      const { container } = render(<SecurityIndicator status={secureStatus} />);

      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
      expect(container.querySelector('.border-green-200')).toBeInTheDocument();
    });

    it('applies yellow styling for warning status', () => {
      const { container } = render(<SecurityIndicator status={warningStatus} />);

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
    });

    it('applies red styling for danger status', () => {
      const { container } = render(<SecurityIndicator status={dangerStatus} />);

      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
      expect(container.querySelector('.border-red-200')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SecurityIndicator status={secureStatus} showDetails />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations in compact mode', async () => {
      const { container } = render(<SecurityIndicator status={secureStatus} compact />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('ConnectionSecurityBadge', () => {
  beforeEach(() => {
    // Reset window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        protocol: 'https:'
      }
    });
  });

  describe('Secure Connection', () => {
    it('shows secure connection for HTTPS', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { protocol: 'https:' }
      });

      render(<ConnectionSecurityBadge />);

      expect(screen.getByText('Secure Connection')).toBeInTheDocument();
    });

    it('applies green styling for HTTPS', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { protocol: 'https:' }
      });

      const { container } = render(<ConnectionSecurityBadge />);

      expect(container.querySelector('.text-green-700')).toBeInTheDocument();
    });
  });

  describe('Insecure Connection', () => {
    it('shows insecure connection for HTTP', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { protocol: 'http:' }
      });

      render(<ConnectionSecurityBadge />);

      expect(screen.getByText('Insecure Connection')).toBeInTheDocument();
    });

    it('applies yellow styling for HTTP', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { protocol: 'http:' }
      });

      const { container } = render(<ConnectionSecurityBadge />);

      expect(container.querySelector('.text-yellow-700')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<ConnectionSecurityBadge className="custom-badge-class" />);

      expect(container.firstChild).toHaveClass('custom-badge-class');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ConnectionSecurityBadge />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
