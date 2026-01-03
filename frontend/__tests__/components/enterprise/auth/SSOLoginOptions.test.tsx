/**
 * SSOLoginOptions Component Tests
 *
 * Tests for SSO provider buttons, click handlers, and loading states.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SSOLoginOptions } from '@/components/auth/SSOLoginOptions';
import { useAuthActions } from '@/contexts/auth/AuthProvider';
import type { SSOProvider } from '@/contexts/auth/authTypes';

// Mock the auth hooks
jest.mock('@/contexts/auth/AuthProvider', () => ({
  useAuthActions: jest.fn(),
}));

describe('SSOLoginOptions', () => {
  const mockLoginWithSSO = jest.fn();
  const mockOnProviderClick = jest.fn();

  const mockProviders: SSOProvider[] = [
    {
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      type: 'saml',
      enabled: true,
      loginUrl: '/auth/sso/azure-ad',
      logoUrl: 'https://cdn.simpleicons.org/microsoftazure/0078D4',
    },
    {
      id: 'okta',
      name: 'Okta',
      type: 'saml',
      enabled: true,
      loginUrl: '/auth/sso/okta',
      logoUrl: 'https://cdn.simpleicons.org/okta/007DC1',
    },
    {
      id: 'google',
      name: 'Google Workspace',
      type: 'oauth',
      enabled: true,
      loginUrl: '/auth/sso/google',
      logoUrl: 'https://cdn.simpleicons.org/google/4285F4',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthActions as jest.Mock).mockReturnValue({
      loginWithSSO: mockLoginWithSSO,
    });
  });

  describe('Rendering', () => {
    it('renders all enabled SSO providers', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      expect(screen.getByRole('button', { name: /Microsoft Azure AD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Okta/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Google Workspace/i })).toBeInTheDocument();
    });

    it('renders divider with text', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
    });

    it('renders SSO authentication description', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      expect(screen.getByText(/Enterprise SSO authentication via SAML 2.0/i)).toBeInTheDocument();
    });

    it('renders provider logos', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      const azureLogo = screen.getByAltText('Microsoft Azure AD');
      expect(azureLogo).toHaveAttribute('src', 'https://cdn.simpleicons.org/microsoftazure/0078D4');

      const oktaLogo = screen.getByAltText('Okta');
      expect(oktaLogo).toHaveAttribute('src', 'https://cdn.simpleicons.org/okta/007DC1');

      const googleLogo = screen.getByAltText('Google Workspace');
      expect(googleLogo).toHaveAttribute('src', 'https://cdn.simpleicons.org/google/4285F4');
    });

    it('renders nothing when no enabled providers', () => {
      const disabledProviders = mockProviders.map(p => ({ ...p, enabled: false }));
      const { container } = render(<SSOLoginOptions providers={disabledProviders} />);

      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when providers array is empty', () => {
      const { container } = render(<SSOLoginOptions providers={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('uses default providers when none provided', () => {
      render(<SSOLoginOptions />);

      // Should render default providers
      expect(screen.getByRole('button', { name: /Microsoft Azure AD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Okta/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Google Workspace/i })).toBeInTheDocument();
    });
  });

  describe('Provider Filtering', () => {
    it('only renders enabled providers', () => {
      const mixedProviders: SSOProvider[] = [
        { ...mockProviders[0], enabled: true },
        { ...mockProviders[1], enabled: false },
        { ...mockProviders[2], enabled: true },
      ];

      render(<SSOLoginOptions providers={mixedProviders} />);

      expect(screen.getByRole('button', { name: /Microsoft Azure AD/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Okta/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Google Workspace/i })).toBeInTheDocument();
    });

    it('renders provider without logo', () => {
      const providersWithoutLogo: SSOProvider[] = [
        {
          id: 'custom-sso',
          name: 'Custom SSO',
          type: 'saml',
          enabled: true,
          loginUrl: '/auth/sso/custom',
        },
      ];

      render(<SSOLoginOptions providers={providersWithoutLogo} />);

      expect(screen.getByRole('button', { name: /Custom SSO/i })).toBeInTheDocument();
      expect(screen.queryByAltText('Custom SSO')).not.toBeInTheDocument();
    });
  });

  describe('Click Handlers', () => {
    it('calls loginWithSSO when provider button is clicked', async () => {
      mockLoginWithSSO.mockResolvedValue(undefined);

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(mockLoginWithSSO).toHaveBeenCalledWith('azure-ad');
      });
    });

    it('calls custom onProviderClick when provided', async () => {
      render(<SSOLoginOptions providers={mockProviders} onProviderClick={mockOnProviderClick} />);

      const oktaButton = screen.getByRole('button', { name: /Okta/i });
      fireEvent.click(oktaButton);

      await waitFor(() => {
        expect(mockOnProviderClick).toHaveBeenCalledWith('okta');
        expect(mockLoginWithSSO).not.toHaveBeenCalled();
      });
    });

    it('does not call handler for disabled providers', async () => {
      const providersWithDisabled: SSOProvider[] = [
        { ...mockProviders[0], enabled: false },
      ];

      // Since disabled providers are filtered out, this test verifies they don't render
      const { container } = render(<SSOLoginOptions providers={providersWithDisabled} />);

      expect(container.firstChild).toBeNull();
    });

    it('handles click on multiple providers', async () => {
      mockLoginWithSSO.mockResolvedValue(undefined);

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(mockLoginWithSSO).toHaveBeenCalledWith('azure-ad');
      });

      const googleButton = screen.getByRole('button', { name: /Google Workspace/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLoginWithSSO).toHaveBeenCalledWith('google');
      });

      expect(mockLoginWithSSO).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading States', () => {
    it('shows loading state when provider is clicked', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      });
    });

    it('disables button during loading', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(azureButton).toBeDisabled();
      });
    });

    it('shows loading spinner during redirect', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        const spinner = azureButton.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    it('only shows loading for clicked provider', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      const oktaButton = screen.getByRole('button', { name: /Okta/i });

      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(azureButton).toHaveTextContent('Redirecting...');
        expect(oktaButton).not.toHaveTextContent('Redirecting...');
      });
    });

    it('clears loading state after completion', async () => {
      mockLoginWithSSO.mockResolvedValue(undefined);

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Redirecting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles SSO login errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLoginWithSSO.mockRejectedValue(new Error('SSO login failed'));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('SSO login failed:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('clears loading state after error', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      mockLoginWithSSO.mockRejectedValue(new Error('SSO login failed'));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(screen.queryByText('Redirecting...')).not.toBeInTheDocument();
      });

      jest.restoreAllMocks();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      expect(screen.getByRole('button', { name: /Microsoft Azure AD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Okta/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Google Workspace/i })).toBeInTheDocument();
    });

    it('provider logos have alt text', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      expect(screen.getByAltText('Microsoft Azure AD')).toBeInTheDocument();
      expect(screen.getByAltText('Okta')).toBeInTheDocument();
      expect(screen.getByAltText('Google Workspace')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1');
      });
    });

    it('disabled buttons have proper aria state', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(azureButton).toBeDisabled();
        expect(azureButton).toHaveAttribute('disabled');
      });
    });

    it('uses semantic HTML structure', () => {
      const { container } = render(<SSOLoginOptions providers={mockProviders} />);

      // Should have proper button elements
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3);
    });
  });

  describe('Provider Types', () => {
    it('renders SAML providers', () => {
      const samlProviders = mockProviders.filter(p => p.type === 'saml');
      render(<SSOLoginOptions providers={samlProviders} />);

      expect(screen.getByRole('button', { name: /Microsoft Azure AD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Okta/i })).toBeInTheDocument();
    });

    it('renders OAuth providers', () => {
      const oauthProviders = mockProviders.filter(p => p.type === 'oauth');
      render(<SSOLoginOptions providers={oauthProviders} />);

      expect(screen.getByRole('button', { name: /Google Workspace/i })).toBeInTheDocument();
    });

    it('handles mixed provider types', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      // All types should render
      expect(screen.getAllByRole('button').length).toBe(3);
    });
  });

  describe('Visual Styling', () => {
    it('applies correct CSS classes to buttons', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'gap-3');
      });
    });

    it('applies hover styles', () => {
      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      expect(azureButton).toHaveClass('hover:bg-slate-600');
    });

    it('applies disabled styles during loading', async () => {
      mockLoginWithSSO.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SSOLoginOptions providers={mockProviders} />);

      const azureButton = screen.getByRole('button', { name: /Microsoft Azure AD/i });
      fireEvent.click(azureButton);

      await waitFor(() => {
        expect(azureButton).toHaveClass('disabled:bg-slate-700/50');
      });
    });
  });
});
