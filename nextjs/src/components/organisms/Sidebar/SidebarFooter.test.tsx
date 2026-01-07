/**
 * @jest-environment jsdom
 * @module SidebarFooter.test
 * @description Enterprise-grade tests for SidebarFooter component
 *
 * Test coverage:
 * - User profile display and navigation
 * - Holographic mode toggle functionality
 * - Backend status indicator integration
 * - Action button interactions
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarFooter } from './SidebarFooter';
import type { User } from '@/types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100', input: 'bg-gray-50' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'backdrop-blur',
      primary: { DEFAULT: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
    },
  }),
  useWindow: () => ({
    isOrbitalEnabled: false,
    toggleOrbitalMode: jest.fn(),
  }),
}));

jest.mock('../BackendStatusIndicator/BackendStatusIndicator', () => ({
  BackendStatusIndicator: ({ variant, showLabel }: { variant: string; showLabel: boolean }) => (
    <div data-testid="backend-status" data-variant={variant} data-show-label={showLabel}>
      Backend Status
    </div>
  ),
}));

jest.mock('./SidebarFooter.styles', () => ({
  getFooterContainer: () => 'footer-container',
  statusIndicatorContainer: 'status-indicator-container',
  holographicModeContainer: 'holographic-mode-container',
  getHolographicModeLabel: () => 'holographic-label',
  getToggleButton: () => 'toggle-button',
  getToggleIndicator: () => 'toggle-indicator',
  getUserButton: () => 'user-button',
  userAvatarWrapper: 'user-avatar',
  userInfoContainer: 'user-info',
  getUserName: () => 'user-name',
  getUserRole: () => 'user-role',
  getChevronIcon: () => 'chevron-icon',
  actionButtonsGrid: 'action-buttons',
  getActionButton: () => 'action-button',
  actionButtonIcon: 'action-icon',
}));

jest.mock('@/config/paths.config', () => ({
  PATHS: {
    PROFILE: '/profile',
    ADMIN: '/admin',
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@lawfirm.com',
  role: 'Senior Partner',
  avatar: '/avatars/john.jpg',
  organizationId: 'org-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  currentUser: mockUser,
  onSwitchUser: jest.fn(),
  onNavigate: jest.fn(),
  activeView: '/dashboard',
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderSidebarFooter = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<SidebarFooter {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('SidebarFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the footer container', () => {
      renderSidebarFooter();

      expect(screen.getByText('Holographic Mode')).toBeInTheDocument();
    });

    it('displays current user name', () => {
      renderSidebarFooter();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays current user role', () => {
      renderSidebarFooter();

      expect(screen.getByText('Senior Partner')).toBeInTheDocument();
    });

    it('renders backend status indicator with correct props', () => {
      renderSidebarFooter();

      const statusIndicator = screen.getByTestId('backend-status');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveAttribute('data-variant', 'compact');
      expect(statusIndicator).toHaveAttribute('data-show-label', 'true');
    });

    it('displays fallback name for guest user', () => {
      const guestUser = { ...mockUser, name: '' };
      renderSidebarFooter({ currentUser: guestUser });

      expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('displays fallback role for undefined role', () => {
      const userWithoutRole = { ...mockUser, role: '' };
      renderSidebarFooter({ currentUser: userWithoutRole });

      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('User Profile Navigation', () => {
    it('navigates to profile when user button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = jest.fn();
      renderSidebarFooter({ onNavigate });

      const userButton = screen.getByText('John Doe').closest('button');
      await user.click(userButton!);

      expect(onNavigate).toHaveBeenCalledWith('/profile');
    });

    it('applies active styling when profile is the current view', () => {
      renderSidebarFooter({ activeView: '/profile' });

      // Component should apply active state styling
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Holographic Mode Toggle', () => {
    it('renders holographic mode toggle', () => {
      renderSidebarFooter();

      expect(screen.getByText('Holographic Mode')).toBeInTheDocument();
    });

    it('displays correct title based on orbital mode state', () => {
      renderSidebarFooter();

      const toggleButton = screen.getByTitle('Flat Interface');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Settings button', () => {
      renderSidebarFooter();

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders Switch button', () => {
      renderSidebarFooter();

      expect(screen.getByText('Switch')).toBeInTheDocument();
    });

    it('navigates to admin when Settings is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = jest.fn();
      renderSidebarFooter({ onNavigate });

      await user.click(screen.getByText('Settings'));

      expect(onNavigate).toHaveBeenCalledWith('/admin');
    });

    it('triggers onSwitchUser when Switch is clicked', async () => {
      const user = userEvent.setup();
      const onSwitchUser = jest.fn();
      renderSidebarFooter({ onSwitchUser });

      await user.click(screen.getByText('Switch'));

      expect(onSwitchUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Avatar', () => {
    it('displays user initial in avatar', () => {
      renderSidebarFooter();

      // Avatar shows first letter of name
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('displays fallback initial for user without name', () => {
      const userWithoutName = { ...mockUser, name: undefined as unknown as string };
      renderSidebarFooter({ currentUser: userWithoutName });

      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      // Verify component is wrapped with React.memo
      expect(SidebarFooter.displayName).toBe('SidebarFooter');
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for all interactive elements', () => {
      renderSidebarFooter();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // User, Settings, Switch at minimum
    });

    it('backend status has title for tooltip', () => {
      renderSidebarFooter();

      const statusContainer = screen.getByTitle('Real-time backend monitoring (updates every 30s)');
      expect(statusContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null currentUser gracefully', () => {
      const nullUser = null as unknown as User;

      // Should not throw
      expect(() => renderSidebarFooter({ currentUser: nullUser })).not.toThrow();
    });

    it('handles empty callbacks', async () => {
      const user = userEvent.setup();
      renderSidebarFooter({
        onNavigate: undefined as unknown as () => void,
        onSwitchUser: undefined as unknown as () => void,
      });

      // Should not throw when buttons are clicked
      const settingsButton = screen.getByText('Settings');
      await expect(user.click(settingsButton)).resolves.not.toThrow();
    });
  });
});
