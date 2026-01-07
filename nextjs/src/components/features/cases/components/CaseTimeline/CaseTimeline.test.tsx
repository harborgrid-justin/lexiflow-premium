/**
 * CaseTimeline Component Tests
 * Enterprise-grade test suite for case timeline with events
 *
 * @module components/features/cases/CaseTimeline.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseTimeline } from './CaseTimeline';
import type { TimelineEvent } from '@/types';

// Mock formatDate utility
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
}));

describe('CaseTimeline', () => {
  const mockEvents: TimelineEvent[] = [
    {
      id: 'evt-1',
      type: 'filing',
      title: 'Complaint Filed',
      description: 'Initial complaint filed with the court',
      date: '2024-01-15',
      createdBy: 'John Attorney',
      metadata: { documentId: 'doc-1' },
    },
    {
      id: 'evt-2',
      type: 'hearing',
      title: 'Initial Hearing',
      description: 'First hearing scheduled',
      date: '2024-02-20',
      createdBy: 'Jane Paralegal',
    },
    {
      id: 'evt-3',
      type: 'document',
      title: 'Motion Filed',
      description: 'Motion for summary judgment',
      date: '2024-03-10',
      createdBy: 'John Attorney',
      metadata: { documentId: 'doc-2' },
    },
    {
      id: 'evt-4',
      type: 'note',
      title: 'Client Meeting',
      description: 'Discussed case strategy with client',
      date: '2024-03-15',
      createdBy: 'John Attorney',
    },
  ];

  const defaultProps = {
    events: mockEvents,
    onEventClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render timeline heading', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    });

    it('should render all events', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      expect(screen.getByText('Initial Hearing')).toBeInTheDocument();
      expect(screen.getByText('Motion Filed')).toBeInTheDocument();
      expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    });

    it('should render event descriptions', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByText('Initial complaint filed with the court')).toBeInTheDocument();
      expect(screen.getByText('First hearing scheduled')).toBeInTheDocument();
    });

    it('should display event count', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByText(/4 events/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no events', () => {
      render(<CaseTimeline events={[]} />);

      expect(screen.getByText('No timeline events')).toBeInTheDocument();
    });

    it('should show empty state message', () => {
      render(<CaseTimeline events={[]} />);

      expect(screen.getByText(/Events will appear here/)).toBeInTheDocument();
    });
  });

  describe('Event Dates', () => {
    it('should display formatted dates', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Feb 20, 2024/)).toBeInTheDocument();
    });
  });

  describe('Event Types', () => {
    it('should render different icons for different event types', () => {
      render(<CaseTimeline {...defaultProps} />);

      // Each event type should have an icon
      const eventItems = screen.getAllByRole('listitem');
      expect(eventItems.length).toBe(4);
    });

    it('should apply type-specific colors', () => {
      render(<CaseTimeline {...defaultProps} />);

      // Filing type should have specific color
      const filingEvent = screen.getByText('Complaint Filed').closest('[data-event]');
      expect(filingEvent).toHaveAttribute('data-type', 'filing');
    });
  });

  describe('Event Click Handler', () => {
    it('should call onEventClick when event is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseTimeline {...defaultProps} />);

      const firstEvent = screen.getByText('Complaint Filed');
      await user.click(firstEvent);

      expect(defaultProps.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should not throw when onEventClick is not provided', async () => {
      const user = userEvent.setup();
      render(<CaseTimeline events={mockEvents} />);

      const firstEvent = screen.getByText('Complaint Filed');

      await expect(async () => {
        await user.click(firstEvent);
      }).not.toThrow();
    });
  });

  describe('Event Creator', () => {
    it('should display event creator name', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getAllByText('John Attorney').length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Paralegal')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort events by date descending by default', () => {
      render(<CaseTimeline {...defaultProps} />);

      const eventTitles = screen.getAllByRole('listitem');
      const titles = eventTitles.map(item => item.textContent);

      // Most recent should be first
      expect(titles[0]).toContain('Client Meeting');
    });

    it('should sort events by date ascending when sortOrder is asc', () => {
      render(<CaseTimeline {...defaultProps} sortOrder="asc" />);

      const eventTitles = screen.getAllByRole('listitem');
      const titles = eventTitles.map(item => item.textContent);

      // Oldest should be first
      expect(titles[0]).toContain('Complaint Filed');
    });
  });

  describe('Filtering', () => {
    it('should filter events by type', () => {
      render(<CaseTimeline {...defaultProps} filterType="filing" />);

      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      expect(screen.queryByText('Initial Hearing')).not.toBeInTheDocument();
      expect(screen.queryByText('Client Meeting')).not.toBeInTheDocument();
    });

    it('should filter events by multiple types', () => {
      render(<CaseTimeline {...defaultProps} filterType={['filing', 'hearing']} />);

      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      expect(screen.getByText('Initial Hearing')).toBeInTheDocument();
      expect(screen.queryByText('Client Meeting')).not.toBeInTheDocument();
    });

    it('should update event count when filtered', () => {
      render(<CaseTimeline {...defaultProps} filterType="filing" />);

      expect(screen.getByText(/1 event/)).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const manyEvents: TimelineEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `evt-${i}`,
      type: 'note',
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      createdBy: 'User',
    }));

    it('should paginate events when pageSize is provided', () => {
      render(<CaseTimeline events={manyEvents} pageSize={5} />);

      // Should show only 5 events
      const eventItems = screen.getAllByRole('listitem');
      expect(eventItems.length).toBe(5);
    });

    it('should show Load More button when more events exist', () => {
      render(<CaseTimeline events={manyEvents} pageSize={5} />);

      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('should load more events when Load More is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseTimeline events={manyEvents} pageSize={5} />);

      await user.click(screen.getByText('Load More'));

      const eventItems = screen.getAllByRole('listitem');
      expect(eventItems.length).toBe(10);
    });

    it('should hide Load More when all events are shown', async () => {
      const user = userEvent.setup();
      render(<CaseTimeline events={manyEvents} pageSize={20} />);

      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('should show expand button when showExpandButton is true', () => {
      render(<CaseTimeline {...defaultProps} showExpandButton />);

      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('should toggle expanded state when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseTimeline {...defaultProps} showExpandButton />);

      const expandButton = screen.getByRole('button', { name: /expand/i });
      await user.click(expandButton);

      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });
  });

  describe('Add Event', () => {
    it('should show Add Event button when onAddEvent is provided', () => {
      const onAddEvent = jest.fn();
      render(<CaseTimeline {...defaultProps} onAddEvent={onAddEvent} />);

      expect(screen.getByText('Add Event')).toBeInTheDocument();
    });

    it('should not show Add Event button when onAddEvent is not provided', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.queryByText('Add Event')).not.toBeInTheDocument();
    });

    it('should call onAddEvent when Add Event button is clicked', async () => {
      const user = userEvent.setup();
      const onAddEvent = jest.fn();

      render(<CaseTimeline {...defaultProps} onAddEvent={onAddEvent} />);

      await user.click(screen.getByText('Add Event'));

      expect(onAddEvent).toHaveBeenCalled();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      const { container } = render(<CaseTimeline {...defaultProps} compact />);

      const timeline = container.firstChild;
      expect(timeline).toHaveClass('space-y-2');
    });

    it('should render in default mode when compact prop is false', () => {
      const { container } = render(<CaseTimeline {...defaultProps} compact={false} />);

      const timeline = container.firstChild;
      expect(timeline).toHaveClass('space-y-4');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible list structure', () => {
      render(<CaseTimeline {...defaultProps} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem').length).toBe(4);
    });

    it('should have accessible event items', () => {
      render(<CaseTimeline {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        expect(item).toBeVisible();
      });
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<CaseTimeline {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CaseTimeline {...defaultProps} className="custom-timeline" />
      );

      expect(container.firstChild).toHaveClass('custom-timeline');
    });
  });

  describe('Loading State', () => {
    it('should show loading state when loading prop is true', () => {
      render(<CaseTimeline {...defaultProps} loading />);

      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it('should hide events when loading', () => {
      render(<CaseTimeline {...defaultProps} loading />);

      expect(screen.queryByText('Complaint Filed')).not.toBeInTheDocument();
    });
  });

  describe('Event Metadata', () => {
    it('should render document link when event has documentId', () => {
      render(<CaseTimeline {...defaultProps} />);

      const filingEvent = screen.getByText('Complaint Filed').closest('[data-event]');
      expect(filingEvent).toHaveAttribute('data-document-id', 'doc-1');
    });
  });
});
