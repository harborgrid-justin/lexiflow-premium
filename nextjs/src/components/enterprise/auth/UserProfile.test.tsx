/**
 * @fileoverview Enterprise-grade tests for UserProfile component
 * Tests profile editing, password change, avatar upload, and tab navigation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UserProfile } from './UserProfile';
import type { User } from '@/types';

expect.extend(toHaveNoViolations);

// Mock UsersApiService
jest.mock('@/api/auth/users-api', () => ({
  UsersApiService: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockResolvedValue({
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'User'
    })
  }))
}));

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    changePassword: jest.fn().mockResolvedValue({})
  }))
}));

describe('UserProfile', () => {
  const mockUser: User = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'User',
    phone: '123-456-7890',
    mobilePhone: '098-765-4321',
    extension: '123',
    office: 'New York',
    department: 'Engineering',
    title: 'Software Engineer',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<UserProfile user={mockUser} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Profile Tab', () => {
    it('displays profile information heading', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('displays first name input with value', () => {
      render(<UserProfile user={mockUser} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveValue('John');
    });

    it('displays last name input with value', () => {
      render(<UserProfile user={mockUser} />);

      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(lastNameInput).toHaveValue('Doe');
    });

    it('displays email input with value', () => {
      render(<UserProfile user={mockUser} />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveValue('john@example.com');
    });

    it('displays job title input', () => {
      render(<UserProfile user={mockUser} />);

      const titleInput = screen.getByLabelText(/job title/i);
      expect(titleInput).toHaveValue('Software Engineer');
    });

    it('displays department input', () => {
      render(<UserProfile user={mockUser} />);

      const departmentInput = screen.getByLabelText(/department/i);
      expect(departmentInput).toHaveValue('Engineering');
    });

    it('displays phone inputs', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByLabelText(/office phone/i)).toHaveValue('123-456-7890');
      expect(screen.getByLabelText(/mobile phone/i)).toHaveValue('098-765-4321');
      expect(screen.getByLabelText(/extension/i)).toHaveValue('123');
    });

    it('displays user role', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByText(/role:/i)).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('displays save changes button', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Avatar Upload', () => {
    it('displays avatar placeholder when no avatar', () => {
      render(<UserProfile user={mockUser} />);

      // Should show placeholder icon when no avatar
      const avatarContainer = document.querySelector('.rounded-full');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('displays avatar image when avatarUrl exists', () => {
      const userWithAvatar = { ...mockUser, avatarUrl: 'https://example.com/avatar.jpg' };
      render(<UserProfile user={userWithAvatar} />);

      const avatarImage = screen.getByAltText('Profile');
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('has change avatar button', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByRole('button', { name: /change avatar/i })).toBeInTheDocument();
    });

    it('has hidden file input', () => {
      render(<UserProfile user={mockUser} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('shows avatar upload instructions', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByText(/upload a profile photo/i)).toBeInTheDocument();
    });
  });

  describe('Profile Form Submission', () => {
    it('submits profile form successfully', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);

      await user.clear(screen.getByLabelText(/first name/i));
      await user.type(screen.getByLabelText(/first name/i), 'Jane');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('calls onUpdate callback after successful save', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('shows loading state during save', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('shows error for invalid first name', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.clear(screen.getByLabelText(/first name/i));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid email', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  describe('Security Tab', () => {
    it('switches to security tab on click', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('displays password fields', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('displays password requirements', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText('Password Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/uppercase and lowercase/i)).toBeInTheDocument();
    });

    it('displays change password button', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });
  });

  describe('Password Change', () => {
    it('changes password successfully', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
      });
    });

    it('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'short');
      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('shows error for password without uppercase', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'oldpassword1!');
      await user.type(screen.getByLabelText(/new password/i), 'newpassword1!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
    });

    it('shows error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'DifferentPassword1!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });

    it('clears password fields after successful change', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/current password/i)).toHaveValue('');
        expect(screen.getByLabelText(/new password/i)).toHaveValue('');
        expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('');
      });
    });
  });

  describe('Preferences Tab', () => {
    it('switches to preferences tab on click', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /preferences/i }));

      expect(screen.getByText('User Preferences')).toBeInTheDocument();
    });

    it('shows coming soon message', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /preferences/i }));

      expect(screen.getByText(/preference settings coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('highlights active tab', () => {
      render(<UserProfile user={mockUser} />);

      const profileTab = screen.getByRole('button', { name: /^profile$/i });
      expect(profileTab).toHaveClass('border-blue-500');
    });

    it('updates active tab styling on click', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      const securityTab = screen.getByRole('button', { name: /security/i });
      expect(securityTab).toHaveClass('border-blue-500');
    });

    it('has aria-current for active tab', () => {
      render(<UserProfile user={mockUser} />);

      const profileTab = screen.getByRole('button', { name: /^profile$/i });
      expect(profileTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Error Handling', () => {
    it('displays profile update error', async () => {
      const mockUsersService = require('@/api/auth/users-api').UsersApiService;
      mockUsersService.mockImplementation(() => ({
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      }));

      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });

    it('displays password change error', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        changePassword: jest.fn().mockRejectedValue(new Error('Incorrect password'))
      }));

      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });
    });

    it('shows error in alert role', async () => {
      const mockUsersService = require('@/api/auth/users-api').UsersApiService;
      mockUsersService.mockImplementation(() => ({
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      }));

      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations on profile tab', async () => {
      const { container } = render(<UserProfile user={mockUser} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations on security tab', async () => {
      const user = userEvent.setup();
      const { container } = render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('has navigation landmark for tabs', () => {
      render(<UserProfile user={mockUser} />);

      expect(screen.getByRole('navigation', { name: /tabs/i })).toBeInTheDocument();
    });
  });
});
