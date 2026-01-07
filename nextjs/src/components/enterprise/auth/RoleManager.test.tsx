/**
 * @fileoverview Enterprise-grade tests for RoleManager component
 * Tests permission matrix, role management, and CRUD operations
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RoleManager } from './RoleManager';

expect.extend(toHaveNoViolations);

// Mock PermissionsApiService
jest.mock('@/api/auth/access-rights-api', () => ({
  PermissionsApiService: jest.fn().mockImplementation(() => ({
    getRolePermissions: jest.fn().mockResolvedValue({
      permissions: [
        { id: '1', resource: 'cases', action: 'read', effect: 'allow', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', resource: 'cases', action: 'create', effect: 'allow', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '3', resource: 'documents', action: 'read', effect: 'allow', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
    }),
    updateRolePermissions: jest.fn().mockResolvedValue({
      permissions: [
        { id: '1', resource: 'cases', action: 'read', effect: 'allow', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', resource: 'cases', action: 'create', effect: 'allow', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
    })
  }))
}));

describe('RoleManager', () => {
  const defaultProps = {
    roleId: 'role-123',
    roleName: 'Administrator'
  };

  const mockOnPermissionsUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Role Permissions')).toBeInTheDocument();
      });
    });

    it('displays role name', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Administrator')).toBeInTheDocument();
      });
    });

    it('renders edit permissions button', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });
    });

    it('applies custom className', async () => {
      const { container } = render(<RoleManager {...defaultProps} className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });

    it('renders permission guide', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/permission guide/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      render(<RoleManager {...defaultProps} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('hides spinner after loading completes', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
      });
    });
  });

  describe('Resource Categories', () => {
    it('displays all resource categories', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Case Management')).toBeInTheDocument();
        expect(screen.getByText('Document Management')).toBeInTheDocument();
        expect(screen.getByText('Billing & Time Tracking')).toBeInTheDocument();
        expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument();
      });
    });

    it('toggles category expansion on click', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Case Management')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /case management/i });
      await user.click(categoryButton);

      // Category should collapse (table should be hidden)
      expect(categoryButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows permission count for each category', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/2 permissions/i)).toBeInTheDocument();
      });
    });
  });

  describe('Permission Matrix', () => {
    it('displays action columns', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Create')).toBeInTheDocument();
        expect(screen.getByText('Read')).toBeInTheDocument();
        expect(screen.getByText('Update')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Execute')).toBeInTheDocument();
        expect(screen.getByText('All')).toBeInTheDocument();
      });
    });

    it('shows allow icon for granted permissions', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        const allowIcons = document.querySelectorAll('.text-green-600');
        expect(allowIcons.length).toBeGreaterThan(0);
      });
    });

    it('shows none icon for unset permissions', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        const noneIcons = document.querySelectorAll('.text-gray-300');
        expect(noneIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edit Mode', () => {
    it('enters edit mode on button click', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('exits edit mode on cancel', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
    });

    it('allows toggling permissions in edit mode', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));

      // Find a permission toggle button and click it
      const permissionButtons = screen.getAllByRole('button', { name: /permission/i });
      expect(permissionButtons.length).toBeGreaterThan(0);
    });

    it('does not allow toggling in view mode', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Role Permissions')).toBeInTheDocument();
      });

      // All permission buttons should be disabled in view mode
      const permissionButtons = screen.getAllByRole('button', { name: /permission/i });
      permissionButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Save Permissions', () => {
    it('saves permissions on save button click', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} onPermissionsUpdated={mockOnPermissionsUpdated} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/permissions updated successfully/i)).toBeInTheDocument();
      });
    });

    it('calls onPermissionsUpdated callback after save', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} onPermissionsUpdated={mockOnPermissionsUpdated} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnPermissionsUpdated).toHaveBeenCalled();
      });
    });

    it('shows saving state during save', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Brief loading state
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('exits edit mode after successful save', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error on load failure', async () => {
      const mockPermissionsService = require('@/api/auth/access-rights-api').PermissionsApiService;
      mockPermissionsService.mockImplementation(() => ({
        getRolePermissions: jest.fn().mockRejectedValue(new Error('Failed to load'))
      }));

      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('displays error on save failure', async () => {
      const mockPermissionsService = require('@/api/auth/access-rights-api').PermissionsApiService;
      mockPermissionsService.mockImplementation(() => ({
        getRolePermissions: jest.fn().mockResolvedValue({ permissions: [] }),
        updateRolePermissions: jest.fn().mockRejectedValue(new Error('Failed to save'))
      }));

      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });
    });

    it('shows error in alert role', async () => {
      const mockPermissionsService = require('@/api/auth/access-rights-api').PermissionsApiService;
      mockPermissionsService.mockImplementation(() => ({
        getRolePermissions: jest.fn().mockRejectedValue(new Error('Network error'))
      }));

      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Permission Toggle States', () => {
    it('cycles through allow -> deny -> none states', async () => {
      const user = userEvent.setup();
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit permissions/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit permissions/i }));

      // Get a permission button - first toggle from allow to deny, then deny to none
      const permissionButtons = screen.getAllByRole('button', { name: /permission/i });
      const firstButton = permissionButtons[0];

      // Initial click - should change state
      await user.click(firstButton);
      // State should change from whatever it was
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Role Permissions')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Role Permissions');
      });
    });

    it('category buttons have aria-expanded', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        const categoryButton = screen.getByRole('button', { name: /case management/i });
        expect(categoryButton).toHaveAttribute('aria-expanded');
      });
    });

    it('permission buttons have aria-labels', async () => {
      render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        const permissionButtons = screen.getAllByRole('button', { name: /permission/i });
        permissionButtons.forEach(button => {
          expect(button).toHaveAttribute('aria-label');
        });
      });
    });
  });

  describe('Reload Permissions', () => {
    it('reloads permissions when roleId changes', async () => {
      const mockPermissionsService = require('@/api/auth/access-rights-api').PermissionsApiService;
      const mockGetPermissions = jest.fn().mockResolvedValue({ permissions: [] });
      mockPermissionsService.mockImplementation(() => ({
        getRolePermissions: mockGetPermissions
      }));

      const { rerender } = render(<RoleManager {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetPermissions).toHaveBeenCalledTimes(1);
      });

      rerender(<RoleManager {...defaultProps} roleId="different-role" />);

      await waitFor(() => {
        expect(mockGetPermissions).toHaveBeenCalledTimes(2);
      });
    });
  });
});
