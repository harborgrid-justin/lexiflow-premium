/**
 * @fileoverview Enterprise-grade tests for SSOLogin and SSOCallback components
 * Tests SSO provider integration, authentication flows, and error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SSOLogin, SSOCallback, type SSOProviderConfig } from './SSOLogin';

expect.extend(toHaveNoViolations);

// Mock fetch for SSOCallback
global.fetch = jest.fn();

describe('SSOLogin', () => {
  const mockProviders: SSOProviderConfig[] = [
    {
      id: 'google-1',
      type: 'google',
      name: 'google',
      displayName: 'Google',
      enabled: true
    },
    {
      id: 'microsoft-1',
      type: 'microsoft',
      name: 'microsoft',
      displayName: 'Microsoft',
      enabled: true
    },
    {
      id: 'okta-1',
      type: 'okta',
      name: 'okta',
      displayName: 'Okta',
      enabled: true
    },
    {
      id: 'saml-1',
      type: 'saml',
      name: 'saml',
      displayName: 'Enterprise SSO',
      enabled: true
    },
    {
      id: 'disabled-1',
      type: 'auth0',
      name: 'auth0',
      displayName: 'Auth0',
      enabled: false
    }
  ];

  const mockOnSSOInitiate = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders enabled providers', () => {
      render(<SSOLogin providers={mockProviders} />);

      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with microsoft/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with okta/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with enterprise sso/i)).toBeInTheDocument();
    });

    it('does not render disabled providers', () => {
      render(<SSOLogin providers={mockProviders} />);

      expect(screen.queryByText(/continue with auth0/i)).not.toBeInTheDocument();
    });

    it('renders divider by default', () => {
      render(<SSOLogin providers={mockProviders} />);

      expect(screen.getByText('Or continue with')).toBeInTheDocument();
    });

    it('hides divider when showDivider is false', () => {
      render(<SSOLogin providers={mockProviders} showDivider={false} />);

      expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('shows custom divider text', () => {
      render(<SSOLogin providers={mockProviders} dividerText="Sign in with SSO" />);

      expect(screen.getByText('Sign in with SSO')).toBeInTheDocument();
    });

    it('returns null when no providers are enabled', () => {
      const disabledProviders = mockProviders.map(p => ({ ...p, enabled: false }));
      const { container } = render(<SSOLogin providers={disabledProviders} />);

      expect(container.firstChild).toBeNull();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SSOLogin providers={mockProviders} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Provider Icons', () => {
    it('renders Google icon', () => {
      render(<SSOLogin providers={[mockProviders[0]]} />);

      const button = screen.getByRole('button', { name: /continue with google/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders Microsoft icon', () => {
      render(<SSOLogin providers={[mockProviders[1]]} />);

      const button = screen.getByRole('button', { name: /continue with microsoft/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders Okta icon', () => {
      render(<SSOLogin providers={[mockProviders[2]]} />);

      const button = screen.getByRole('button', { name: /continue with okta/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom icon URL', () => {
      const providerWithIcon: SSOProviderConfig = {
        id: 'custom-1',
        type: 'custom',
        name: 'custom',
        displayName: 'Custom Provider',
        enabled: true,
        iconUrl: 'https://example.com/icon.png'
      };

      render(<SSOLogin providers={[providerWithIcon]} />);

      const img = screen.getByAltText('Custom Provider logo');
      expect(img).toHaveAttribute('src', 'https://example.com/icon.png');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom button color', () => {
      const providerWithColor: SSOProviderConfig = {
        id: 'custom-1',
        type: 'custom',
        name: 'custom',
        displayName: 'Custom Provider',
        enabled: true,
        buttonColor: '#FF5500',
        buttonTextColor: '#FFFFFF'
      };

      render(<SSOLogin providers={[providerWithColor]} />);

      const button = screen.getByRole('button', { name: /continue with custom provider/i });
      expect(button).toHaveStyle({ backgroundColor: '#FF5500', color: '#FFFFFF' });
    });
  });

  describe('SSO Initiation', () => {
    it('calls onSSOInitiate when provider clicked', async () => {
      const user = userEvent.setup();
      render(<SSOLogin providers={mockProviders} onSSOInitiate={mockOnSSOInitiate} />);

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      expect(mockOnSSOInitiate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'google-1', type: 'google' })
      );
    });

    it('shows loading state while initiating', async () => {
      const user = userEvent.setup();
      mockOnSSOInitiate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLogin providers={mockProviders} onSSOInitiate={mockOnSSOInitiate} />);

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('disables button while loading', async () => {
      const user = userEvent.setup();
      mockOnSSOInitiate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLogin providers={mockProviders} onSSOInitiate={mockOnSSOInitiate} />);

      const button = screen.getByRole('button', { name: /continue with google/i });
      await user.click(button);

      expect(button).toBeDisabled();
    });

    it('calls onError when initiation fails', async () => {
      const user = userEvent.setup();
      mockOnSSOInitiate.mockRejectedValue(new Error('SSO initiation failed'));

      render(
        <SSOLogin
          providers={mockProviders}
          onSSOInitiate={mockOnSSOInitiate}
          onError={mockOnError}
        />
      );

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SSOLogin providers={mockProviders} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SSOLogin providers={mockProviders} onSSOInitiate={mockOnSSOInitiate} />);

      const firstButton = screen.getByRole('button', { name: /continue with google/i });
      firstButton.focus();

      await user.keyboard('{Enter}');

      expect(mockOnSSOInitiate).toHaveBeenCalled();
    });
  });
});

describe('SSOCallback', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();

    // Reset window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        search: '?code=test-code&state=test-state',
        href: 'http://localhost/callback?code=test-code&state=test-state',
        protocol: 'http:'
      }
    });
  });

  describe('Processing State', () => {
    it('shows processing state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      expect(screen.getByText('Completing Sign In')).toBeInTheDocument();
      expect(screen.getByText(/please wait/i)).toBeInTheDocument();
    });

    it('shows spinner during processing', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<SSOCallback onSuccess={mockOnSuccess} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Success Flow', () => {
    it('calls onSuccess after successful callback', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          user: { id: '1', email: 'test@example.com' }
        })
      });

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken: 'test-token',
            refreshToken: 'test-refresh'
          })
        );
      });
    });

    it('sends code and state to callback endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          user: { id: '1', email: 'test@example.com' }
        })
      });

      render(<SSOCallback onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/sso/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'test-code', state: 'test-state' })
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error state when error param present', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          search: '?error=access_denied',
          href: 'http://localhost/callback?error=access_denied'
        }
      });

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
      });
    });

    it('shows error state when code is missing', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          search: '',
          href: 'http://localhost/callback'
        }
      });

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
        expect(screen.getByText(/missing authorization code/i)).toBeInTheDocument();
      });
    });

    it('shows error state when API call fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
      });
    });

    it('calls onError callback on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<SSOCallback onSuccess={mockOnSuccess} onError={mockOnError} />);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('shows return to login button on error', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          search: '?error=access_denied',
          href: 'http://localhost/callback?error=access_denied'
        }
      });

      render(<SSOCallback onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /return to login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations in processing state', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { container } = render(<SSOCallback onSuccess={mockOnSuccess} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations in error state', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          search: '?error=access_denied',
          href: 'http://localhost/callback?error=access_denied'
        }
      });

      const { container } = render(<SSOCallback onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { container } = render(
        <SSOCallback onSuccess={mockOnSuccess} className="custom-callback-class" />
      );

      expect(container.firstChild).toHaveClass('custom-callback-class');
    });
  });
});
