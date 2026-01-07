/**
 * @jest-environment jsdom
 * ActivityFeed Component Tests
 * Enterprise-grade tests for activity feed with timeline view
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityFeed, ActivityFeedProps } from './ActivityFeed';
import type { Activity, ActivityType } from '@/types/dashboard';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '' },
      text: { primary: '', secondary: '', muted: '' },
      border: { default: '' },
    },
  }),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

const createMockActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'activity-1',
  type: 'case_updated' as ActivityType,
  title: 'Case Updated',
  description: 'Smith v. Jones case was updated',
  timestamp: new Date().toISOString(),
  ...overrides,
});

const defaultProps: ActivityFeedProps = {
  activities: [],
};

describe('ActivityFeed', () => {
  describe('Rendering', () => {
    it('renders activity items', () => {
      const activities = [createMockActivity({ title: 'Test Activity' })];

      render(<ActivityFeed {...defaultProps} activities={activities} />);

      expect(screen.getByText('Test Activity')).toBeInTheDocument();
    });

    it('renders activity description', () => {
      const activities = [createMockActivity({ description: 'Activity description' })];

      render(<ActivityFeed {...defaultProps} activities={activities} />);

      expect(screen.getByText('Activity description')).toBeInTheDocument();
    });

    it('renders timestamp', () => {
      const activities = [createMockActivity()];

      render(<ActivityFeed {...defaultProps} activities={activities} />);

      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });

    it('renders user name when provided', () => {
      const activities = [createMockActivity({
        user: { id: 'user-1', name: 'John Doe' }
      })];

      render(<ActivityFeed {...defaultProps} activities={activities} />);

      expect(screen.getByText('by John Doe')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      const { container } = render(<ActivityFeed {...defaultProps} isLoading={true} />);

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows 5 skeleton items', () => {
      const { container } = render(<ActivityFeed {...defaultProps} isLoading={true} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(5);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no activities', () => {
      render(<ActivityFeed {...defaultProps} activities={[]} />);

      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      render(
        <ActivityFeed
          {...defaultProps}
          activities={[]}
          emptyMessage="Nothing to show"
        />
      );

      expect(screen.getByText('Nothing to show')).toBeInTheDocument();
    });
  });

  describe('Activity Types', () => {
    const activityTypes: Array<{ type: ActivityType; expectedClass: string }> = [
      { type: 'case_created', expectedClass: 'bg-blue-100' },
      { type: 'case_updated', expectedClass: 'bg-indigo-100' },
      { type: 'case_closed', expectedClass: 'bg-emerald-100' },
      { type: 'document_uploaded', expectedClass: 'bg-purple-100' },
      { type: 'task_completed', expectedClass: 'bg-green-100' },
      { type: 'deadline_approaching', expectedClass: 'bg-orange-100' },
      { type: 'payment_received', expectedClass: 'bg-emerald-100' },
      { type: 'team_member_added', expectedClass: 'bg-blue-100' },
      { type: 'comment_added', expectedClass: 'bg-gray-100' },
      { type: 'status_changed', expectedClass: 'bg-yellow-100' },
    ];

    activityTypes.forEach(({ type, expectedClass }) => {
      it(`renders correct icon background for ${type}`, () => {
        const activities = [createMockActivity({ type })];

        const { container } = render(
          <ActivityFeed {...defaultProps} activities={activities} />
        );

        expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
      });
    });
  });

  describe('Priority Indicators', () => {
    it('applies critical priority border', () => {
      const activities = [createMockActivity({ priority: 'critical' })];

      const { container } = render(
        <ActivityFeed {...defaultProps} activities={activities} />
      );

      expect(container.querySelector('.border-l-red-500')).toBeInTheDocument();
    });

    it('applies high priority border', () => {
      const activities = [createMockActivity({ priority: 'high' })];

      const { container } = render(
        <ActivityFeed {...defaultProps} activities={activities} />
      );

      expect(container.querySelector('.border-l-orange-500')).toBeInTheDocument();
    });

    it('applies medium priority border', () => {
      const activities = [createMockActivity({ priority: 'medium' })];

      const { container } = render(
        <ActivityFeed {...defaultProps} activities={activities} />
      );

      expect(container.querySelector('.border-l-yellow-500')).toBeInTheDocument();
    });

    it('applies low priority border', () => {
      const activities = [createMockActivity({ priority: 'low' })];

      const { container } = render(
        <ActivityFeed {...defaultProps} activities={activities} />
      );

      expect(container.querySelector('.border-l-gray-300')).toBeInTheDocument();
    });
  });

  describe('Max Items', () => {
    it('limits displayed items to maxItems', () => {
      const activities = Array.from({ length: 20 }, (_, i) =>
        createMockActivity({ id: String(i), title: `Activity ${i}` })
      );

      render(<ActivityFeed {...defaultProps} activities={activities} maxItems={5} />);

      expect(screen.getByText('Activity 0')).toBeInTheDocument();
      expect(screen.getByText('Activity 4')).toBeInTheDocument();
      expect(screen.queryByText('Activity 5')).not.toBeInTheDocument();
    });

    it('defaults to 10 max items', () => {
      const activities = Array.from({ length: 15 }, (_, i) =>
        createMockActivity({ id: String(i), title: `Activity ${i}` })
      );

      render(<ActivityFeed {...defaultProps} activities={activities} />);

      expect(screen.getByText('Activity 9')).toBeInTheDocument();
      expect(screen.queryByText('Activity 10')).not.toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('calls onActivityClick when activity clicked', async () => {
      const user = userEvent.setup();
      const onActivityClick = jest.fn();
      const activity = createMockActivity();

      render(
        <ActivityFeed
          {...defaultProps}
          activities={[activity]}
          onActivityClick={onActivityClick}
        />
      );

      await user.click(screen.getByText('Case Updated'));

      expect(onActivityClick).toHaveBeenCalledWith(activity);
    });

    it('applies cursor-pointer when onActivityClick provided', () => {
      const activities = [createMockActivity()];

      const { container } = render(
        <ActivityFeed
          {...defaultProps}
          activities={activities}
          onActivityClick={jest.fn()}
        />
      );

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });

    it('has role=button when clickable', () => {
      const activities = [createMockActivity()];

      render(
        <ActivityFeed
          {...defaultProps}
          activities={activities}
          onActivityClick={jest.fn()}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible when clickable', () => {
      const activities = [createMockActivity()];

      render(
        <ActivityFeed
          {...defaultProps}
          activities={activities}
          onActivityClick={jest.fn()}
        />
      );

      const item = screen.getByRole('button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Avatars', () => {
    it('shows user avatar when showAvatars is true and avatar provided', () => {
      const activities = [createMockActivity({
        user: { id: 'user-1', name: 'John', avatar: 'https://example.com/avatar.jpg' }
      })];

      render(
        <ActivityFeed
          {...defaultProps}
          activities={activities}
          showAvatars={true}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('shows icon when showAvatars is false', () => {
      const activities = [createMockActivity({
        user: { id: 'user-1', name: 'John', avatar: 'https://example.com/avatar.jpg' }
      })];

      const { container } = render(
        <ActivityFeed
          {...defaultProps}
          activities={activities}
          showAvatars={false}
        />
      );

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ActivityFeed
          {...defaultProps}
          activities={[createMockActivity()]}
          className="custom-feed"
        />
      );

      expect(container.firstChild).toHaveClass('custom-feed');
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(ActivityFeed.displayName).toBe('ActivityFeed');
    });
  });
});
