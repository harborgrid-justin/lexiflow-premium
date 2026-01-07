/**
 * @fileoverview Enterprise-grade tests for Header component
 * @module components/layout/Header.test
 *
 * Tests search functionality, notifications dropdown, and user menu.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bell: () => <svg data-testid="bell-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
  Menu: () => <svg data-testid="menu-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  User: () => <svg data-testid="user-icon" />,
}));

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('Header', () => {
  describe('Basic Rendering', () => {
    it('renders header element', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders mobile menu button', () => {
      render(<Header />);
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<Header />);
      expect(screen.getByPlaceholderText(/search cases, documents/i)).toBeInTheDocument();
    });

    it('renders notifications button', () => {
      render(<Header />);
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('renders user menu button with initials', () => {
      render(<Header />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders user name', () => {
      render(<Header />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================================================

  describe('Search Functionality', () => {
    it('renders search input with placeholder', () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText(/search cases, documents/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<Header />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('allows typing in search input', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search cases, documents/i);
      await user.type(searchInput, 'test query');

      expect(searchInput).toHaveValue('test query');
    });

    it('search input is type="search"', () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText(/search cases, documents/i);
      expect(searchInput).toHaveAttribute('type', 'search');
    });
  });

  // ============================================================================
  // NOTIFICATIONS DROPDOWN TESTS
  // ============================================================================

  describe('Notifications Dropdown', () => {
    it('does not show dropdown by default', () => {
      render(<Header />);
      expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
    });

    it('opens notifications dropdown when bell clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      await user.click(bellButton!);

      expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    });

    it('shows notification items in dropdown', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      await user.click(bellButton!);

      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Notification 3')).toBeInTheDocument();
    });

    it('shows timestamps for notifications', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      await user.click(bellButton!);

      const timestamps = screen.getAllByText('2 hours ago');
      expect(timestamps.length).toBe(3);
    });

    it('shows notification indicator dot', () => {
      render(<Header />);
      const notificationDot = document.querySelector('.animate-pulse.bg-red-500');
      expect(notificationDot).toBeInTheDocument();
    });

    it('closes dropdown when clicked again', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      await user.click(bellButton!);
      await user.click(bellButton!);

      expect(screen.queryByRole('heading', { name: /notifications/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // USER MENU TESTS
  // ============================================================================

  describe('User Menu', () => {
    it('does not show user menu by default', () => {
      render(<Header />);
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('opens user menu when clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    });

    it('shows user info in dropdown header', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      const johnDoeElements = screen.getAllByText('John Doe');
      expect(johnDoeElements.length).toBeGreaterThan(1);
      expect(screen.getByText('Attorney')).toBeInTheDocument();
    });

    it('shows Profile menu item', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    });

    it('shows Settings menu item', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('shows Logout menu item with red styling', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveClass('hover:bg-red-50');
    });

    it('closes menu when clicked again', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);
      await user.click(userMenuButton!);

      expect(screen.queryByRole('button', { name: /profile/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // MENU ICONS TESTS
  // ============================================================================

  describe('Menu Icons', () => {
    it('renders User icon in Profile menu item', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('renders Settings icon in Settings menu item', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('renders Logout icon in Logout menu item', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('renders ChevronDown icon in user button', () => {
      render(<Header />);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE BEHAVIOR TESTS
  // ============================================================================

  describe('Responsive Behavior', () => {
    it('mobile menu button is visible', () => {
      render(<Header />);
      const menuButton = screen.getByTestId('menu-icon').closest('button');
      expect(menuButton).toHaveClass('lg:hidden');
    });

    it('search input is hidden on mobile', () => {
      render(<Header />);
      const searchContainer = screen.getByPlaceholderText(/search cases, documents/i).closest('div.relative');
      expect(searchContainer?.parentElement).toHaveClass('hidden', 'md:block');
    });

    it('user name is hidden on small screens', () => {
      render(<Header />);
      const userName = screen.getByText('John Doe');
      expect(userName).toHaveClass('hidden', 'sm:inline');
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('header has correct height', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-16');
    });

    it('header has border and shadow', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-b', 'shadow-sm');
    });

    it('user avatar has gradient background', () => {
      render(<Header />);
      const avatar = screen.getByText('JD');
      expect(avatar).toHaveClass('bg-linear-to-br', 'from-blue-500', 'to-blue-600');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to header', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dark:bg-slate-950', 'dark:border-slate-800');
    });

    it('applies dark mode classes to search input', () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText(/search cases, documents/i);
      expect(searchInput).toHaveClass('dark:bg-slate-800', 'dark:focus:ring-blue-600');
    });

    it('applies dark mode classes to user name', () => {
      render(<Header />);
      const userName = screen.getByText('John Doe');
      expect(userName).toHaveClass('dark:text-slate-300');
    });
  });

  // ============================================================================
  // Z-INDEX AND POSITIONING TESTS
  // ============================================================================

  describe('Z-Index and Positioning', () => {
    it('notification dropdown has high z-index', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      await user.click(bellButton!);

      const dropdown = screen.getByRole('heading', { name: /notifications/i }).closest('div.absolute');
      expect(dropdown).toHaveClass('z-50');
    });

    it('user menu dropdown has high z-index', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByText('John Doe').closest('button');
      await user.click(userMenuButton!);

      const dropdown = screen.getByText('Attorney').closest('div.absolute');
      expect(dropdown).toHaveClass('z-50');
    });
  });
});
