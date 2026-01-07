/**
 * @jest-environment jsdom
 * SidebarFooter Component Tests
 * Enterprise-grade tests for sidebar footer with user profile and actions
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarFooter, SidebarFooterProps } from './SidebarFooter';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '', highlight: '' },
      text: { primary: '', secondary: '', tertiary: '', muted: '' },
      border: { default: '', subtle: '' },
      backdrop: '',
    },
  }),
}));

// Mock DataService
jest.mock('@/services/data/dataService', () => ({
  DataService: {
    auth: {
      logout: jest.fn(() => Promise.resolve()),
    },
    profile: {
      getProfile: jest.fn(() => Promise.resolve({
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
        role: 'Attorney',
      })),
    },
  },
}));

// Mock useQuery
jest.mock('@/hooks/useQueryHooks', () => ({
  useQuery: jest.fn((key, fn, options) => ({
    data: options?.initialData ?? {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
      role: 'Attorney',
    },
    isLoading: false,
    error: null,
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const defaultProps: SidebarFooterProps = {
  onLogout: jest.fn(),
};

describe('SidebarFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user profile section', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays user email', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('displays user role', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByText('Attorney')).toBeInTheDocument();
    });

    it('renders user avatar with initials when no avatar URL', () => {
      render(<SidebarFooter {...defaultProps} />);

      // Avatar should show initials
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders settings button', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByTitle('Settings')).toBeInTheDocument();
    });

    it('renders notifications button', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    });

    it('renders logout button', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('calls onLogout when logout button clicked', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn();

      render(<SidebarFooter onLogout={onLogout} />);

      await user.click(screen.getByTitle('Logout'));

      expect(onLogout).toHaveBeenCalled();
    });

    it('handles async logout', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn(() => Promise.resolve());

      render(<SidebarFooter onLogout={onLogout} />);

      await user.click(screen.getByTitle('Logout'));

      expect(onLogout).toHaveBeenCalled();
    });
  });

  describe('Settings Navigation', () => {
    it('calls onSettingsClick when settings clicked', async () => {
      const user = userEvent.setup();
      const onSettingsClick = jest.fn();

      render(<SidebarFooter {...defaultProps} onSettingsClick={onSettingsClick} />);

      await user.click(screen.getByTitle('Settings'));

      expect(onSettingsClick).toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    it('shows notification badge when unreadNotifications > 0', () => {
      render(<SidebarFooter {...defaultProps} unreadNotifications={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('hides notification badge when unreadNotifications is 0', () => {
      render(<SidebarFooter {...defaultProps} unreadNotifications={0} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('calls onNotificationsClick when notifications button clicked', async () => {
      const user = userEvent.setup();
      const onNotificationsClick = jest.fn();

      render(
        <SidebarFooter
          {...defaultProps}
          onNotificationsClick={onNotificationsClick}
        />
      );

      await user.click(screen.getByTitle('Notifications'));

      expect(onNotificationsClick).toHaveBeenCalled();
    });
  });

  describe('Profile Click', () => {
    it('calls onProfileClick when profile section clicked', async () => {
      const user = userEvent.setup();
      const onProfileClick = jest.fn();

      render(<SidebarFooter {...defaultProps} onProfileClick={onProfileClick} />);

      await user.click(screen.getByText('John Doe'));

      expect(onProfileClick).toHaveBeenCalled();
    });

    it('has clickable profile section', () => {
      const onProfileClick = jest.fn();

      render(<SidebarFooter {...defaultProps} onProfileClick={onProfileClick} />);

      const profileSection = screen.getByText('John Doe').closest('div[class*="cursor-pointer"]');
      expect(profileSection).toBeInTheDocument();
    });
  });

  describe('Online Status', () => {
    it('shows online indicator when user is online', () => {
      render(<SidebarFooter {...defaultProps} isOnline={true} />);

      const onlineIndicator = document.querySelector('.bg-green-500');
      expect(onlineIndicator).toBeInTheDocument();
    });

    it('shows offline indicator when user is offline', () => {
      render(<SidebarFooter {...defaultProps} isOnline={false} />);

      const offlineIndicator = document.querySelector('.bg-gray-400');
      expect(offlineIndicator).toBeInTheDocument();
    });

    it('defaults to online', () => {
      render(<SidebarFooter {...defaultProps} />);

      const onlineIndicator = document.querySelector('.bg-green-500');
      expect(onlineIndicator).toBeInTheDocument();
    });
  });

  describe('Collapsed Mode', () => {
    it('hides text labels when collapsed', () => {
      render(<SidebarFooter {...defaultProps} isCollapsed={true} />);

      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    it('shows avatar when collapsed', () => {
      render(<SidebarFooter {...defaultProps} isCollapsed={true} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows full content when not collapsed', () => {
      render(<SidebarFooter {...defaultProps} isCollapsed={false} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies border styling', () => {
      const { container } = render(<SidebarFooter {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border-t');
    });

    it('applies padding', () => {
      const { container } = render(<SidebarFooter {...defaultProps} />);

      expect(container.firstChild).toHaveClass('p-4');
    });
  });

  describe('Accessibility', () => {
    it('action buttons have accessible titles', () => {
      render(<SidebarFooter {...defaultProps} />);

      expect(screen.getByTitle('Settings')).toBeInTheDocument();
      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
      expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });

    it('buttons are focusable', () => {
      render(<SidebarFooter {...defaultProps} />);

      const settingsButton = screen.getByTitle('Settings');
      settingsButton.focus();
      expect(document.activeElement).toBe(settingsButton);
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SidebarFooter {...defaultProps} className="custom-footer-class" />
      );

      expect(container.firstChild).toHaveClass('custom-footer-class');
    });
  });
});
