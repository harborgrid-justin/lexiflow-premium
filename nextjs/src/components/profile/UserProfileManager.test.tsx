/**
 * @jest-environment jsdom
 * UserProfileManager Component Tests
 * Enterprise-grade tests for user profile management with tabs
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileManager from './UserProfileManager';

describe('UserProfileManager', () => {
  describe('Rendering', () => {
    it('renders header with title', () => {
      render(<UserProfileManager />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Profile');
    });

    it('renders subtitle', () => {
      render(<UserProfileManager />);

      expect(screen.getByText(/Manage identity, granular permissions/)).toBeInTheDocument();
    });

    it('renders all tab buttons', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Access Matrix')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Audit Log')).toBeInTheDocument();
    });

    it('renders Overview tab content by default', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Partner')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('displays user avatar with initials', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('displays user name', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('displays user role', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('Senior Partner')).toBeInTheDocument();
    });

    it('displays user email', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('jane.doe@lexiflow.com')).toBeInTheDocument();
    });

    it('displays user phone', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    });

    it('displays user location', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });

    it('renders Edit Profile button', () => {
      render(<UserProfileManager />);

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Preferences Tab', () => {
    it('switches to Preferences tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Preferences'));

      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
    });

    it('displays theme selector', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Preferences'));

      expect(screen.getByText('System Default')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('displays language selector', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Preferences'));

      expect(screen.getByText('English (US)')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
    });

    it('displays Configure button for notifications', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Preferences'));

      expect(screen.getByText('Configure')).toBeInTheDocument();
    });
  });

  describe('Access Matrix Tab', () => {
    it('switches to Access Matrix tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Access Matrix'));

      expect(screen.getByText('View and manage your permissions')).toBeInTheDocument();
    });

    it('displays module list', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Access Matrix'));

      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('displays permission headers', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Access Matrix'));

      expect(screen.getByText('Module')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
      expect(screen.getByText('Write')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Security Tab', () => {
    it('switches to Security tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByText('Security Settings')).toBeInTheDocument();
    });

    it('displays password section', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Last changed 3 months ago')).toBeInTheDocument();
    });

    it('displays 2FA section', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Enabled via Authenticator App')).toBeInTheDocument();
    });

    it('displays API keys section', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText('2 active keys')).toBeInTheDocument();
    });

    it('displays action buttons for security items', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Security'));

      const changeButtons = screen.getAllByText('Change');
      const configureButtons = screen.getAllByText('Configure');
      const manageButtons = screen.getAllByText('Manage');

      expect(changeButtons.length).toBeGreaterThan(0);
      expect(configureButtons.length).toBeGreaterThan(0);
      expect(manageButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Log Tab', () => {
    it('switches to Audit Log tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      await user.click(screen.getByText('Audit Log'));

      expect(screen.getByText('Audit logs visualization component placeholder.')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('highlights active tab', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      const preferencesTab = screen.getByText('Preferences').closest('button');
      await user.click(preferencesTab!);

      expect(preferencesTab).toHaveClass('border-blue-500');
    });

    it('deselects previous tab when new tab selected', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      // Overview is default
      const overviewTab = screen.getByText('Overview').closest('button');
      expect(overviewTab).toHaveClass('border-blue-500');

      // Switch to Preferences
      await user.click(screen.getByText('Preferences'));

      expect(overviewTab).not.toHaveClass('border-blue-500');
    });

    it('maintains correct content for each tab', async () => {
      const user = userEvent.setup();
      render(<UserProfileManager />);

      // Check Overview
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();

      // Check Preferences
      await user.click(screen.getByText('Preferences'));
      expect(screen.getByText('Theme')).toBeInTheDocument();

      // Check Access Matrix
      await user.click(screen.getByText('Access Matrix'));
      expect(screen.getByText('Module')).toBeInTheDocument();

      // Check Security
      await user.click(screen.getByText('Security'));
      expect(screen.getByText('Password')).toBeInTheDocument();

      // Check Audit Log
      await user.click(screen.getByText('Audit Log'));
      expect(screen.getByText(/Audit logs visualization/)).toBeInTheDocument();
    });
  });

  describe('Tab Icons', () => {
    it('displays icons for each tab', () => {
      const { container } = render(<UserProfileManager />);

      // Each tab should have an icon (svg)
      const tabs = container.querySelectorAll('nav button svg');
      expect(tabs.length).toBe(5);
    });
  });

  describe('Styling', () => {
    it('applies proper layout structure', () => {
      const { container } = render(<UserProfileManager />);

      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    });

    it('applies border styling to tabs', () => {
      const { container } = render(<UserProfileManager />);

      expect(container.querySelector('.border-b')).toBeInTheDocument();
    });
  });
});
