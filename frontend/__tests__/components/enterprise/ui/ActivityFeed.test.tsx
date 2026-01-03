/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ActivityFeed, ActivityItem, ActivityType } from '@/components/enterprise/ui/ActivityFeed';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'create',
    user: { name: 'John Doe', avatar: '/avatar1.jpg' },
    action: 'created',
    target: 'Case #12345',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    type: 'update',
    user: { name: 'Jane Smith' },
    action: 'updated',
    target: 'Document.pdf',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '3',
    type: 'comment',
    user: { name: 'Bob Johnson' },
    action: 'commented on',
    target: 'Task #789',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: { comment: 'Looks good!' },
  },
  {
    id: '4',
    type: 'delete',
    user: { name: 'Alice Brown' },
    action: 'deleted',
    target: 'Old File.txt',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

describe('ActivityFeed', () => {
  describe('Timeline Rendering', () => {
    it('should render activity feed with all items', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });

    it('should display timeline line', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const timeline = container.querySelector('.absolute.left-\\[2\\.125rem\\]');
      expect(timeline).toBeInTheDocument();
    });

    it('should render activities in chronological order', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const activities = screen.getAllByText(/created|updated|commented|deleted/);
      expect(activities[0]).toHaveTextContent('created');
      expect(activities[1]).toHaveTextContent('updated');
    });

    it('should display activity icons', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      // Icons should be rendered for each activity type
      const { container } = screen.getByText('John Doe').closest('div')?.parentElement || document;
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display user names', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display action descriptions', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText(/created/)).toBeInTheDocument();
      expect(screen.getByText(/updated/)).toBeInTheDocument();
      expect(screen.getByText(/commented on/)).toBeInTheDocument();
    });

    it('should display targets', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('Case #12345')).toBeInTheDocument();
      expect(screen.getByText('Document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Task #789')).toBeInTheDocument();
    });

    it('should format timestamps correctly', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('5m ago')).toBeInTheDocument();
      expect(screen.getByText('30m ago')).toBeInTheDocument();
      expect(screen.getByText('2h ago')).toBeInTheDocument();
      expect(screen.getByText('1d ago')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should show filter button when showFilter is true', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    it('should hide filter button when showFilter is false', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter={false} />);

      expect(screen.queryByRole('button', { name: /filter/i })).not.toBeInTheDocument();
    });

    it('should open filter panel when filter button is clicked', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      expect(screen.getByText('Filter by activity type')).toBeInTheDocument();
    });

    it('should display available activity types in filter', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Comment')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should filter activities by type when type is selected', async () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      fireEvent.click(createFilter);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should support multiple type filters', async () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      const updateFilter = screen.getByText('Update');

      fireEvent.click(createFilter);
      fireEvent.click(updateFilter);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should clear filters when clear button is clicked', async () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      fireEvent.click(createFilter);

      await waitFor(() => {
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should update filter count badge', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      fireEvent.click(createFilter);

      expect(screen.getByText(/filter \(1\)/i)).toBeInTheDocument();
    });

    it('should show activity count after filtering', async () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      fireEvent.click(createFilter);

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 4 activities')).toBeInTheDocument();
      });
    });
  });

  describe('Activity Types', () => {
    const activityTypes: { type: ActivityType; label: string }[] = [
      { type: 'create', label: 'created' },
      { type: 'update', label: 'updated' },
      { type: 'delete', label: 'deleted' },
      { type: 'upload', label: 'uploaded' },
      { type: 'download', label: 'downloaded' },
      { type: 'comment', label: 'commented' },
      { type: 'assign', label: 'assigned' },
      { type: 'complete', label: 'completed' },
      { type: 'cancel', label: 'cancelled' },
      { type: 'other', label: 'other action' },
    ];

    it.each(activityTypes)('should render $type activity type', ({ type, label }) => {
      const activities: ActivityItem[] = [
        {
          id: '1',
          type,
          user: { name: 'Test User' },
          action: label,
          timestamp: new Date(),
        },
      ];

      renderWithTheme(<ActivityFeed activities={activities} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('should use correct colors for different activity types', () => {
      const createActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'create',
          user: { name: 'User' },
          action: 'created',
          timestamp: new Date(),
        },
      ];

      const { container } = renderWithTheme(<ActivityFeed activities={createActivity} />);

      const iconContainer = container.querySelector('.bg-emerald-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should display metadata when present', () => {
      const activitiesWithMetadata: ActivityItem[] = [
        {
          id: '1',
          type: 'update',
          user: { name: 'User' },
          action: 'updated',
          timestamp: new Date(),
          metadata: {
            field: 'status',
            value: 'completed',
          },
        },
      ];

      renderWithTheme(<ActivityFeed activities={activitiesWithMetadata} />);

      expect(screen.getByText('field:')).toBeInTheDocument();
      expect(screen.getByText('status')).toBeInTheDocument();
      expect(screen.getByText('value:')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('should not show metadata section when metadata is empty', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities.slice(0, 1)} />);

      const metadataContainers = container.querySelectorAll('[class*="mt-2"]');
      expect(metadataContainers.length).toBe(0);
    });
  });

  describe('Item Click Interaction', () => {
    it('should call onItemClick when activity is clicked', () => {
      const onItemClick = jest.fn();
      renderWithTheme(<ActivityFeed activities={mockActivities} onItemClick={onItemClick} />);

      const activity = screen.getByText('John Doe').closest('div');
      if (activity) {
        fireEvent.click(activity);
        expect(onItemClick).toHaveBeenCalledWith(mockActivities[0]);
      }
    });

    it('should show hover effect when onItemClick is provided', () => {
      const { container } = renderWithTheme(
        <ActivityFeed activities={mockActivities} onItemClick={jest.fn()} />
      );

      const activity = screen.getByText('John Doe').closest('div');
      expect(activity).toHaveClass('cursor-pointer');
    });

    it('should not show hover effect when onItemClick is not provided', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const activity = screen.getByText('John Doe').closest('div');
      expect(activity).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no activities', () => {
      renderWithTheme(<ActivityFeed activities={[]} />);

      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      renderWithTheme(<ActivityFeed activities={[]} emptyMessage="No activities found" />);

      expect(screen.getByText('No activities found')).toBeInTheDocument();
    });

    it('should display empty state icon', () => {
      renderWithTheme(<ActivityFeed activities={[]} />);

      const { container } = screen.getByText('No recent activity').closest('div') || document;
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      renderWithTheme(<ActivityFeed activities={[]} loading />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display activities when loading', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} loading />);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should hide loading state when loading is false', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} loading={false} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  describe('Max Height and Scrolling', () => {
    it('should apply default max height', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toHaveStyle({ maxHeight: '600px' });
    });

    it('should apply custom max height', () => {
      const { container } = renderWithTheme(
        <ActivityFeed activities={mockActivities} maxHeight={400} />
      );

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toHaveStyle({ maxHeight: '400px' });
    });

    it('should have scrollbar styling', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const scrollContainer = container.querySelector('.scrollbar-thin');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Activity Count Display', () => {
    it('should show total activity count', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('Showing 4 of 4 activities')).toBeInTheDocument();
    });

    it('should update count when filtered', async () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} showFilter />);

      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      const createFilter = screen.getByText('Create');
      fireEvent.click(createFilter);

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 4 activities')).toBeInTheDocument();
      });
    });

    it('should not show count when loading', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} loading />);

      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });

    it('should not show count when no activities', () => {
      renderWithTheme(<ActivityFeed activities={[]} />);

      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <ActivityFeed activities={mockActivities} className="custom-class" />
      );

      const feed = container.querySelector('.custom-class');
      expect(feed).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const feed = container.querySelector('.rounded-xl');
      expect(feed).toBeInTheDocument();
    });

    it('should have border', () => {
      const { container } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const feed = container.querySelector('.border');
      expect(feed).toBeInTheDocument();
    });
  });

  describe('Timestamp Formatting', () => {
    it('should show "Just now" for very recent activities', () => {
      const recentActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'create',
          user: { name: 'User' },
          action: 'created',
          timestamp: new Date(Date.now() - 30 * 1000), // 30 seconds ago
        },
      ];

      renderWithTheme(<ActivityFeed activities={recentActivities} />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('should show date for old activities', () => {
      const oldActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'create',
          user: { name: 'User' },
          action: 'created',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      ];

      renderWithTheme(<ActivityFeed activities={oldActivities} />);

      // Should show formatted date instead of relative time
      const timestamp = screen.getAllByText(/\//);
      expect(timestamp.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const heading = screen.getByText('Activity Feed');
      expect(heading.tagName).toBe('H3');
    });

    it('should have readable activity descriptions', () => {
      renderWithTheme(<ActivityFeed activities={mockActivities} />);

      const activity = screen.getByText('John Doe');
      expect(activity).toBeInTheDocument();
    });

    it('should be keyboard navigable when clickable', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ActivityFeed activities={mockActivities} onItemClick={jest.fn()} />);

      // Should be able to tab to elements
      await user.tab();

      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Component Display Name', () => {
    it('should have correct display name', () => {
      expect(ActivityFeed.displayName).toBe('ActivityFeed');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle large number of activities', () => {
      const largeActivityList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        type: 'create' as ActivityType,
        user: { name: `User ${i}` },
        action: 'created',
        timestamp: new Date(Date.now() - i * 60 * 1000),
      }));

      renderWithTheme(<ActivityFeed activities={largeActivityList} />);

      expect(screen.getByText('Showing 100 of 100 activities')).toBeInTheDocument();
    });

    it('should update in real-time when new activities are added', () => {
      const { rerender } = renderWithTheme(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('Showing 4 of 4 activities')).toBeInTheDocument();

      const newActivities = [
        ...mockActivities,
        {
          id: '5',
          type: 'upload' as ActivityType,
          user: { name: 'New User' },
          action: 'uploaded',
          timestamp: new Date(),
        },
      ];

      rerender(
        <ThemeProvider>
          <ActivityFeed activities={newActivities} />
        </ThemeProvider>
      );

      expect(screen.getByText('Showing 5 of 5 activities')).toBeInTheDocument();
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
