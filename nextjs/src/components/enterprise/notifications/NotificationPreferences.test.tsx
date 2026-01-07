/**
 * @module components/enterprise/notifications/NotificationPreferences.test
 * @description Unit tests for NotificationPreferences component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPreferences, NotificationPreferencesProps, ExtendedNotificationPreferences } from './NotificationPreferences';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Bell: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
  Mail: ({ className }: { className?: string }) => (
    <svg data-testid="mail-icon" className={className} />
  ),
  Smartphone: ({ className }: { className?: string }) => (
    <svg data-testid="smartphone-icon" className={className} />
  ),
  Volume2: ({ className }: { className?: string }) => (
    <svg data-testid="volume-on-icon" className={className} />
  ),
  VolumeX: ({ className }: { className?: string }) => (
    <svg data-testid="volume-off-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="clock-icon" className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
    <svg data-testid="save-icon" className={className} />
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <svg data-testid="reset-icon" className={className} />
  ),
  Slack: ({ className }: { className?: string }) => (
    <svg data-testid="slack-icon" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  Briefcase: ({ className }: { className?: string }) => (
    <svg data-testid="briefcase-icon" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg data-testid="file-icon" className={className} />
  ),
  CreditCard: ({ className }: { className?: string }) => (
    <svg data-testid="credit-card-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-icon" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <svg data-testid="info-icon" className={className} />
  ),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockPreferences: ExtendedNotificationPreferences = {
  email: true,
  push: true,
  slack: false,
  digestFrequency: 'Daily',
  sound: true,
  desktop: true,
  categories: {
    cases: true,
    documents: true,
    deadlines: true,
    billing: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps: NotificationPreferencesProps = {
  preferences: mockPreferences,
  onSave: jest.fn(),
};

const renderNotificationPreferences = (props: Partial<NotificationPreferencesProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<NotificationPreferences {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('NotificationPreferences rendering', () => {
  it('should render header', () => {
    renderNotificationPreferences();

    expect(screen.getByRole('heading', { name: /notification preferences/i })).toBeInTheDocument();
    expect(screen.getByText('Customize how you receive notifications')).toBeInTheDocument();
  });

  it('should render notification channels section', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Notification Channels')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Slack Notifications')).toBeInTheDocument();
    expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
    expect(screen.getByText('Sound Alerts')).toBeInTheDocument();
  });

  it('should render notification categories section', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Notification Categories')).toBeInTheDocument();
    expect(screen.getByText('Case Notifications')).toBeInTheDocument();
    expect(screen.getByText('Document Notifications')).toBeInTheDocument();
    expect(screen.getByText('Deadline Reminders')).toBeInTheDocument();
    expect(screen.getByText('Billing Alerts')).toBeInTheDocument();
    expect(screen.getByText('System Alerts')).toBeInTheDocument();
  });

  it('should render digest frequency section', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Email Digest Frequency')).toBeInTheDocument();
    expect(screen.getByText('Realtime')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('should render quiet hours section', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
    expect(screen.getByText('Pause non-urgent notifications during specific hours')).toBeInTheDocument();
  });
});

// ============================================================================
// TOGGLE TESTS
// ============================================================================

describe('NotificationPreferences toggles', () => {
  it('should toggle email notifications', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    // Find toggle by accessible role
    const toggles = screen.getAllByRole('switch');
    const emailToggle = toggles[0]; // Email is first

    expect(emailToggle).toHaveAttribute('aria-checked', 'true');

    await user.click(emailToggle);

    expect(emailToggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should toggle push notifications', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    const pushToggle = toggles[1]; // Push is second

    expect(pushToggle).toHaveAttribute('aria-checked', 'true');

    await user.click(pushToggle);

    expect(pushToggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should toggle slack notifications', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    const slackToggle = toggles[2]; // Slack is third

    expect(slackToggle).toHaveAttribute('aria-checked', 'false');

    await user.click(slackToggle);

    expect(slackToggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle category notifications', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    // Categories start after channels (5 channel toggles + quiet hours = index 6+)
    const casesToggle = toggles[5]; // Cases toggle

    await user.click(casesToggle);

    expect(casesToggle).toHaveAttribute('aria-checked', 'false');
  });
});

// ============================================================================
// DIGEST FREQUENCY TESTS
// ============================================================================

describe('NotificationPreferences digest frequency', () => {
  it('should show selected frequency highlighted', () => {
    renderNotificationPreferences();

    const dailyButton = screen.getByRole('button', { name: /daily/i });
    expect(dailyButton).toHaveClass('border-blue-500');
  });

  it('should change digest frequency when clicked', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const realtimeButton = screen.getByRole('button', { name: /realtime/i });
    await user.click(realtimeButton);

    expect(realtimeButton).toHaveClass('border-blue-500');
  });
});

// ============================================================================
// QUIET HOURS TESTS
// ============================================================================

describe('NotificationPreferences quiet hours', () => {
  it('should not show time inputs when quiet hours is disabled', () => {
    renderNotificationPreferences();

    expect(screen.queryByLabelText('Start Time')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('End Time')).not.toBeInTheDocument();
  });

  it('should show time inputs when quiet hours is enabled', async () => {
    const user = userEvent.setup();
    const preferencesWithQuietHours = {
      ...mockPreferences,
      quietHours: { ...mockPreferences.quietHours, enabled: true },
    };
    renderNotificationPreferences({ preferences: preferencesWithQuietHours });

    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
  });

  it('should toggle quiet hours', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    // Find the quiet hours toggle (last toggle in the list before time inputs appear)
    const toggles = screen.getAllByRole('switch');
    const quietHoursToggle = toggles[toggles.length - 1];

    await user.click(quietHoursToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    });
  });

  it('should update start time', async () => {
    const user = userEvent.setup();
    const preferencesWithQuietHours = {
      ...mockPreferences,
      quietHours: { ...mockPreferences.quietHours, enabled: true },
    };
    renderNotificationPreferences({ preferences: preferencesWithQuietHours });

    const startTimeInput = screen.getByLabelText('Start Time');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '23:00');

    expect(startTimeInput).toHaveValue('23:00');
  });

  it('should update end time', async () => {
    const user = userEvent.setup();
    const preferencesWithQuietHours = {
      ...mockPreferences,
      quietHours: { ...mockPreferences.quietHours, enabled: true },
    };
    renderNotificationPreferences({ preferences: preferencesWithQuietHours });

    const endTimeInput = screen.getByLabelText('End Time');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '07:00');

    expect(endTimeInput).toHaveValue('07:00');
  });
});

// ============================================================================
// SAVE TESTS
// ============================================================================

describe('NotificationPreferences save', () => {
  it('should disable save button when no changes', () => {
    renderNotificationPreferences();

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when changes are made', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Toggle email

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('should call onSave with updated preferences', async () => {
    const onSave = jest.fn();
    const user = userEvent.setup();
    renderNotificationPreferences({ onSave });

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Toggle email off

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        email: false, // Changed from true to false
      })
    );
  });

  it('should show saving state when isLoading is true', () => {
    renderNotificationPreferences({ isLoading: true });

    // First make a change to enable the save button area
    // Since we can't make changes with isLoading, we check for "Saving..." text
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});

// ============================================================================
// RESET TESTS
// ============================================================================

describe('NotificationPreferences reset', () => {
  it('should not show reset button when no changes', () => {
    renderNotificationPreferences();

    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
  });

  it('should show reset button when changes are made', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Toggle email

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should reset to initial values when reset is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    const emailToggle = toggles[0];

    await user.click(emailToggle); // Toggle off
    expect(emailToggle).toHaveAttribute('aria-checked', 'false');

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(emailToggle).toHaveAttribute('aria-checked', 'true');
  });
});

// ============================================================================
// CANCEL TESTS
// ============================================================================

describe('NotificationPreferences cancel', () => {
  it('should show cancel button when onCancel is provided and has changes', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences({ onCancel: jest.fn() });

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Make a change

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onCancel when cancel is clicked', async () => {
    const onCancel = jest.fn();
    const user = userEvent.setup();
    renderNotificationPreferences({ onCancel });

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Make a change

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});

// ============================================================================
// UNSAVED CHANGES BAR TESTS
// ============================================================================

describe('NotificationPreferences unsaved changes bar', () => {
  it('should show unsaved changes bar when there are changes', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Make a change

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
  });

  it('should hide unsaved changes bar after save', async () => {
    const user = userEvent.setup();
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]); // Make a change

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('NotificationPreferences styling', () => {
  it('should apply custom className', () => {
    const { container } = renderNotificationPreferences({ className: 'custom-preferences' });

    expect(container.firstChild).toHaveClass('custom-preferences');
  });

  it('should highlight enabled toggles', () => {
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    const enabledToggle = toggles[0]; // Email is enabled

    expect(enabledToggle).toHaveClass('bg-blue-600');
  });

  it('should style disabled toggles', () => {
    const preferencesWithDisabled = {
      ...mockPreferences,
      slack: false,
    };
    renderNotificationPreferences({ preferences: preferencesWithDisabled });

    const toggles = screen.getAllByRole('switch');
    const slackToggle = toggles[2]; // Slack is third and disabled

    expect(slackToggle).toHaveClass('bg-slate-300');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('NotificationPreferences accessibility', () => {
  it('should have accessible toggle switches', () => {
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    toggles.forEach((toggle) => {
      expect(toggle).toHaveAttribute('aria-checked');
    });
  });

  it('should have accessible time inputs', () => {
    const preferencesWithQuietHours = {
      ...mockPreferences,
      quietHours: { ...mockPreferences.quietHours, enabled: true },
    };
    renderNotificationPreferences({ preferences: preferencesWithQuietHours });

    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
  });

  it('should have focus ring on toggles', () => {
    renderNotificationPreferences();

    const toggles = screen.getAllByRole('switch');
    toggles.forEach((toggle) => {
      expect(toggle).toHaveClass('focus:ring-2');
    });
  });
});

// ============================================================================
// DESCRIPTION TESTS
// ============================================================================

describe('NotificationPreferences descriptions', () => {
  it('should show descriptions for each setting', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Receive notifications via email')).toBeInTheDocument();
    expect(screen.getByText('Receive push notifications on your devices')).toBeInTheDocument();
    expect(screen.getByText('Receive notifications in Slack')).toBeInTheDocument();
    expect(screen.getByText('Show desktop notifications in your browser')).toBeInTheDocument();
    expect(screen.getByText('Play sound when receiving notifications')).toBeInTheDocument();
  });

  it('should show category descriptions', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Updates about your cases and assignments')).toBeInTheDocument();
    expect(screen.getByText('Document uploads, changes, and reviews')).toBeInTheDocument();
    expect(screen.getByText('Upcoming deadlines and calendar events')).toBeInTheDocument();
    expect(screen.getByText('Payment reminders and billing updates')).toBeInTheDocument();
    expect(screen.getByText('System maintenance and security updates')).toBeInTheDocument();
  });

  it('should show digest frequency descriptions', () => {
    renderNotificationPreferences();

    expect(screen.getByText('Instant notifications')).toBeInTheDocument();
    expect(screen.getByText('Once per day')).toBeInTheDocument();
    expect(screen.getByText('Once per week')).toBeInTheDocument();
  });
});
