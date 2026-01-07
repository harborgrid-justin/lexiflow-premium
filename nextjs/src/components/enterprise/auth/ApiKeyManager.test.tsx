/**
 * @fileoverview Enterprise-grade tests for ApiKeyManager component
 * Tests API key creation, revocation, scope management, and security
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ApiKeyManager, type ApiKey } from './ApiKeyManager';

expect.extend(toHaveNoViolations);

// Mock the API service
jest.mock('@/api/auth/api-keys-api', () => ({
  ApiKeysApiService: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue({ keys: [] }),
    create: jest.fn().mockResolvedValue({ key: 'test-api-key-123', id: '1' }),
    revoke: jest.fn().mockResolvedValue({}),
    getScopes: jest.fn().mockResolvedValue({ scopes: ['read', 'write', 'admin'] })
  }))
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('ApiKeyManager', () => {
  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      prefix: 'sk_live_xxxx',
      scopes: ['read', 'write'],
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-06-15T10:30:00Z',
      expiresAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Development API Key',
      prefix: 'sk_test_yyyy',
      scopes: ['read'],
      createdAt: '2024-03-01T00:00:00Z',
      lastUsed: null,
      expiresAt: null
    }
  ];

  const mockOnCreate = jest.fn();
  const mockOnRevoke = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText('API Keys')).toBeInTheDocument();
    });

    it('displays all API keys', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText('Production API Key')).toBeInTheDocument();
      expect(screen.getByText('Development API Key')).toBeInTheDocument();
    });

    it('displays key prefixes', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText('sk_live_xxxx')).toBeInTheDocument();
      expect(screen.getByText('sk_test_yyyy')).toBeInTheDocument();
    });

    it('displays scopes badges', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getAllByText('read').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('write')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ApiKeyManager apiKeys={mockApiKeys} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Create API Key', () => {
    it('shows create button', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} onCreate={mockOnCreate} />);

      expect(screen.getByText('Create API Key')).toBeInTheDocument();
    });

    it('opens create modal on button click', async () => {
      const user = userEvent.setup();
      render(<ApiKeyManager apiKeys={mockApiKeys} onCreate={mockOnCreate} />);

      await user.click(screen.getByText('Create API Key'));

      expect(screen.getByText('Create New API Key')).toBeInTheDocument();
    });

    it('displays name input in modal', async () => {
      const user = userEvent.setup();
      render(<ApiKeyManager apiKeys={mockApiKeys} onCreate={mockOnCreate} />);

      await user.click(screen.getByText('Create API Key'));

      expect(screen.getByLabelText(/Key Name/i)).toBeInTheDocument();
    });

    it('displays scope checkboxes', async () => {
      const user = userEvent.setup();
      render(
        <ApiKeyManager
          apiKeys={mockApiKeys}
          onCreate={mockOnCreate}
          availableScopes={['read', 'write', 'admin']}
        />
      );

      await user.click(screen.getByText('Create API Key'));

      expect(screen.getByLabelText('read')).toBeInTheDocument();
      expect(screen.getByLabelText('write')).toBeInTheDocument();
      expect(screen.getByLabelText('admin')).toBeInTheDocument();
    });

    it('calls onCreate with form data', async () => {
      const user = userEvent.setup();
      render(
        <ApiKeyManager
          apiKeys={mockApiKeys}
          onCreate={mockOnCreate}
          availableScopes={['read', 'write']}
        />
      );

      await user.click(screen.getByText('Create API Key'));
      await user.type(screen.getByLabelText(/Key Name/i), 'New Test Key');
      await user.click(screen.getByLabelText('read'));
      await user.click(screen.getByRole('button', { name: /Create Key/i }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Test Key',
            scopes: expect.arrayContaining(['read'])
          })
        );
      });
    });

    it('displays generated key after creation', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockResolvedValue({ key: 'sk_new_key_12345', id: '3' });

      render(
        <ApiKeyManager
          apiKeys={mockApiKeys}
          onCreate={mockOnCreate}
          availableScopes={['read']}
        />
      );

      await user.click(screen.getByText('Create API Key'));
      await user.type(screen.getByLabelText(/Key Name/i), 'New Key');
      await user.click(screen.getByLabelText('read'));
      await user.click(screen.getByRole('button', { name: /Create Key/i }));

      await waitFor(() => {
        expect(screen.getByText(/Copy this key/i)).toBeInTheDocument();
      });
    });

    it('closes modal on cancel', async () => {
      const user = userEvent.setup();
      render(<ApiKeyManager apiKeys={mockApiKeys} onCreate={mockOnCreate} />);

      await user.click(screen.getByText('Create API Key'));
      expect(screen.getByText('Create New API Key')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New API Key')).not.toBeInTheDocument();
    });
  });

  describe('Revoke API Key', () => {
    it('shows revoke button for each key', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} onRevoke={mockOnRevoke} />);

      const revokeButtons = screen.getAllByText('Revoke');
      expect(revokeButtons.length).toBe(2);
    });

    it('shows confirmation dialog on revoke click', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<ApiKeyManager apiKeys={mockApiKeys} onRevoke={mockOnRevoke} />);

      const revokeButtons = screen.getAllByText('Revoke');
      await user.click(revokeButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('calls onRevoke when confirmed', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ApiKeyManager apiKeys={mockApiKeys} onRevoke={mockOnRevoke} />);

      const revokeButtons = screen.getAllByText('Revoke');
      await user.click(revokeButtons[0]);

      expect(mockOnRevoke).toHaveBeenCalledWith('1');
    });

    it('does not call onRevoke when cancelled', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<ApiKeyManager apiKeys={mockApiKeys} onRevoke={mockOnRevoke} />);

      const revokeButtons = screen.getAllByText('Revoke');
      await user.click(revokeButtons[0]);

      expect(mockOnRevoke).not.toHaveBeenCalled();
    });
  });

  describe('Copy Key', () => {
    it('copies key prefix to clipboard', async () => {
      const user = userEvent.setup();
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      const copyButtons = screen.getAllByTitle(/Copy/i);
      await user.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('sk_live_xxxx');
    });
  });

  describe('Key Details', () => {
    it('displays last used time', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText(/Last used:/i)).toBeInTheDocument();
    });

    it('displays expiration date', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText(/Expires:/i)).toBeInTheDocument();
    });

    it('displays created date', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getAllByText(/Created:/i).length).toBeGreaterThanOrEqual(1);
    });

    it('shows never used for keys without last used', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText(/Never used/i)).toBeInTheDocument();
    });

    it('shows no expiration for keys without expiry', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByText(/No expiration/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when no keys', () => {
      render(<ApiKeyManager apiKeys={[]} />);

      expect(screen.getByText(/No API keys/i)).toBeInTheDocument();
    });

    it('shows create button in empty state', () => {
      render(<ApiKeyManager apiKeys={[]} onCreate={mockOnCreate} />);

      expect(screen.getByText('Create API Key')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when loading', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} loading={true} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('hides keys when loading', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} loading={true} />);

      expect(screen.queryByText('Production API Key')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ApiKeyManager apiKeys={mockApiKeys} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('API Keys');
    });

    it('revoke buttons have accessible labels', () => {
      render(<ApiKeyManager apiKeys={mockApiKeys} onRevoke={mockOnRevoke} />);

      const revokeButtons = screen.getAllByText('Revoke');
      revokeButtons.forEach((button) => {
        expect(button.closest('button')).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on create failure', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockRejectedValue(new Error('Failed to create key'));

      render(
        <ApiKeyManager
          apiKeys={mockApiKeys}
          onCreate={mockOnCreate}
          availableScopes={['read']}
        />
      );

      await user.click(screen.getByText('Create API Key'));
      await user.type(screen.getByLabelText(/Key Name/i), 'Test Key');
      await user.click(screen.getByLabelText('read'));
      await user.click(screen.getByRole('button', { name: /Create Key/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create key/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in key names', () => {
      const keysWithSpecialChars: ApiKey[] = [
        {
          id: '1',
          name: "Test Key's <Special> & \"Characters\"",
          prefix: 'sk_test_xxxx',
          scopes: ['read'],
          createdAt: '2024-01-01T00:00:00Z',
          lastUsed: null,
          expiresAt: null
        }
      ];

      render(<ApiKeyManager apiKeys={keysWithSpecialChars} />);

      expect(screen.getByText("Test Key's <Special> & \"Characters\"")).toBeInTheDocument();
    });

    it('handles many scopes', () => {
      const keyWithManyScopes: ApiKey[] = [
        {
          id: '1',
          name: 'Full Access Key',
          prefix: 'sk_full_xxxx',
          scopes: ['read', 'write', 'delete', 'admin', 'billing', 'users', 'reports'],
          createdAt: '2024-01-01T00:00:00Z',
          lastUsed: null,
          expiresAt: null
        }
      ];

      render(<ApiKeyManager apiKeys={keyWithManyScopes} />);

      expect(screen.getByText('Full Access Key')).toBeInTheDocument();
    });
  });
});
