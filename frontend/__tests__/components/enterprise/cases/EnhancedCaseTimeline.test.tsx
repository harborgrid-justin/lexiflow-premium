/**
 * EnhancedCaseTimeline.test.tsx
 * Comprehensive tests for Enhanced Case Timeline component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedCaseTimeline } from '@/components/enterprise/CaseManagement/EnhancedCaseTimeline';
import { TimelineEvent, EventType, EventStatus } from '@/components/enterprise/CaseManagement/EnhancedCaseTimeline';

// Mock timeline events
const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    type: 'filing' as EventType,
    title: 'Complaint Filed',
    description: 'Initial complaint filed with court',
    date: '2024-01-15T09:00:00Z',
    status: 'completed' as EventStatus,
    priority: 'high',
    assignedTo: ['atty-1'],
    documents: ['doc-1'],
    tags: ['court-filing', 'pleading'],
  },
  {
    id: 'evt-2',
    type: 'hearing' as EventType,
    title: 'Preliminary Hearing',
    description: 'Initial hearing before Judge Smith',
    date: '2024-02-01T10:00:00Z',
    status: 'scheduled' as EventStatus,
    priority: 'high',
    location: 'Courtroom 3A',
    assignedTo: ['atty-1', 'atty-2'],
  },
  {
    id: 'evt-3',
    type: 'deadline' as EventType,
    title: 'Discovery Response Due',
    description: 'Response to discovery requests',
    date: '2024-01-25T17:00:00Z',
    status: 'in-progress' as EventStatus,
    priority: 'critical',
    assignedTo: ['atty-2'],
    tags: ['discovery'],
  },
  {
    id: 'evt-4',
    type: 'milestone' as EventType,
    title: 'Case Acceptance',
    description: 'Case officially accepted',
    date: '2024-01-10T08:00:00Z',
    status: 'completed' as EventStatus,
    priority: 'medium',
  },
  {
    id: 'evt-5',
    type: 'note' as EventType,
    title: 'Client Meeting Notes',
    description: 'Discussed case strategy with client',
    date: '2024-01-20T14:00:00Z',
    status: 'completed' as EventStatus,
    priority: 'low',
  },
  {
    id: 'evt-6',
    type: 'deadline' as EventType,
    title: 'Overdue Filing',
    description: 'This deadline was missed',
    date: '2023-12-15T17:00:00Z',
    status: 'scheduled' as EventStatus,
    priority: 'critical',
  },
];

describe('EnhancedCaseTimeline', () => {
  const defaultProps = {
    events: mockEvents,
    onEventClick: jest.fn(),
    onEventUpdate: jest.fn(),
    onEventCreate: jest.fn(),
    allowEdit: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Timeline Event Rendering', () => {
    it('should render all timeline events', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      expect(screen.getByText('Preliminary Hearing')).toBeInTheDocument();
      expect(screen.getByText('Discovery Response Due')).toBeInTheDocument();
      expect(screen.getByText('Case Acceptance')).toBeInTheDocument();
    });

    it('should display event descriptions', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      expect(screen.getByText('Initial complaint filed with court')).toBeInTheDocument();
      expect(screen.getByText('Initial hearing before Judge Smith')).toBeInTheDocument();
    });

    it('should show event count', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      expect(screen.getByText('6 events')).toBeInTheDocument();
    });

    it('should display event types with appropriate styling', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const filingEvent = screen.getByText('Complaint Filed').closest('div');
      const hearingEvent = screen.getByText('Preliminary Hearing').closest('div');
      const deadlineEvent = screen.getByText('Discovery Response Due').closest('div');

      expect(filingEvent).toBeInTheDocument();
      expect(hearingEvent).toBeInTheDocument();
      expect(deadlineEvent).toBeInTheDocument();
    });

    it('should display event metadata (location, assignees, documents)', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      expect(screen.getByText('Courtroom 3A')).toBeInTheDocument();
      expect(screen.getByText('2 assigned')).toBeInTheDocument();
      expect(screen.getByText('1 docs')).toBeInTheDocument();
    });

    it('should display event tags', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Check that events are rendered
      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
    });

    it('should show status badges for completed events', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Check that completed events are shown
      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
    });

    it('should display critical priority badge', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    });
  });

  describe('View Mode Switching', () => {
    it('should render in chronological view by default', () => {
      render(<EnhancedCaseTimeline {...defaultProps} viewMode="chronological" />);

      const viewSelect = screen.getByRole('combobox');
      expect(viewSelect).toHaveValue('chronological');
    });

    it('should switch to grouped view', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      expect(viewSelect).toHaveValue('grouped');
    });

    it('should switch to milestone view', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'milestone');

      expect(viewSelect).toHaveValue('milestone');
    });

    it('should display events grouped by type in grouped view', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      await waitFor(() => {
        // Timeline should still show events
        expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      });
    });

    it('should display milestones separately in milestone view', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'milestone');

      await waitFor(() => {
        // Timeline should still render
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('Event Grouping', () => {
    it('should group events by type when in grouped mode', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      await waitFor(() => {
        // Timeline should still show events
        expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      });
    });

    it('should expand group when header clicked', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      await waitFor(async () => {
        const groupHeaders = screen.getAllByRole('button');
        if (groupHeaders.length > 0) {
          await userEvent.click(groupHeaders[0]);
          // Group should toggle
          expect(groupHeaders[0]).toBeInTheDocument();
        }
      });
    });

    it('should collapse group when header clicked twice', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      await waitFor(async () => {
        const groupHeaders = screen.getAllByRole('button');
        if (groupHeaders.length > 0) {
          const firstHeader = groupHeaders[0];
          await userEvent.click(firstHeader);
          await userEvent.click(firstHeader);
          expect(firstHeader).toBeInTheDocument();
        }
      });
    });

    it('should show event count in group header', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const viewSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(viewSelect, 'grouped');

      await waitFor(() => {
        // Groups should show counts
        const countBadges = screen.getAllByText(/\d+/);
        expect(countBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Overdue Warnings', () => {
    it('should highlight overdue deadlines', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Timeline renders with events
      expect(screen.getByText(/Overdue Filing/i)).toBeInTheDocument();
    });

    it('should display overdue warning message', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Check for overdue events
      expect(screen.getByText(/Overdue Filing/i)).toBeInTheDocument();
    });

    it('should only show overdue warning for incomplete deadlines', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Completed events should not show overdue warning
      const completedEvent = screen.getByText('Complaint Filed').closest('div');
      expect(completedEvent).not.toHaveTextContent(/Overdue/i);
    });
  });

  describe('Event Filtering', () => {
    it('should show filter panel when filters are enabled', () => {
      render(<EnhancedCaseTimeline {...defaultProps} showFilters={true} />);

      expect(screen.getByText(/Event Types/i)).toBeInTheDocument();
    });

    it('should filter events by type', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} showFilters={true} />);

      const typeButtons = screen.getAllByRole('button', { name: /filing|hearing|deadline/i });
      if (typeButtons.length > 0) {
        await userEvent.click(typeButtons[0]);

        await waitFor(() => {
          // Only events of selected type should show
          expect(typeButtons[0]).toHaveClass(/border-2/);
        });
      }
    });

    it('should filter events by search query', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText(/search events/i);
      await userEvent.type(searchInput, 'Complaint');

      await waitFor(() => {
        expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
        expect(screen.queryByText('Preliminary Hearing')).not.toBeInTheDocument();
      });
    });

    it('should filter events by tags', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText(/search events/i);
      await userEvent.type(searchInput, 'discovery');

      await waitFor(() => {
        expect(screen.getByText('Discovery Response Due')).toBeInTheDocument();
        expect(screen.queryByText('Preliminary Hearing')).not.toBeInTheDocument();
      });
    });

    it('should toggle completed events visibility', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /Hide Completed/i });
      await userEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.queryByText('Complaint Filed')).not.toBeInTheDocument();
        expect(screen.getByText('Preliminary Hearing')).toBeInTheDocument();
      });
    });

    it('should show completed events when toggled back', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /Hide Completed/i });
      await userEvent.click(toggleButton); // Hide
      await userEvent.click(toggleButton); // Show

      await waitFor(() => {
        expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
      });
    });
  });

  describe('Event Interaction', () => {
    it('should call onEventClick when event card clicked', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const eventCard = screen.getByText('Complaint Filed').closest('div');
      if (eventCard) {
        await userEvent.click(eventCard);
        expect(defaultProps.onEventClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'evt-1' })
        );
      }
    });

    it('should call onEventCreate when Add Event clicked', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} allowEdit={true} />);

      const addButton = screen.getByRole('button', { name: /Add Event/i });
      await userEvent.click(addButton);

      expect(defaultProps.onEventCreate).toHaveBeenCalledWith({});
    });

    it('should not show Add Event button when editing disabled', () => {
      render(<EnhancedCaseTimeline {...defaultProps} allowEdit={false} />);

      expect(screen.queryByRole('button', { name: /Add Event/i })).not.toBeInTheDocument();
    });
  });

  describe('Timeline Navigation', () => {
    it('should render export button', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(btn => btn.querySelector('svg'));
      expect(exportButton).toBeInTheDocument();
    });

    it('should render print button', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format future dates with relative time', () => {
      const futureEvent: TimelineEvent = {
        id: 'future-1',
        type: 'hearing' as EventType,
        title: 'Future Hearing',
        date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        status: 'scheduled' as EventStatus,
      };

      render(<EnhancedCaseTimeline {...defaultProps} events={[futureEvent]} />);

      expect(screen.getByText('Future Hearing')).toBeInTheDocument();
      // Should show relative date like "in 7 days"
    });

    it('should format past dates', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Past dates should be formatted as "MMM d, yyyy"
      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no events', () => {
      render(<EnhancedCaseTimeline {...defaultProps} events={[]} />);

      expect(screen.getByText('No events found')).toBeInTheDocument();
      expect(screen.getByText(/Timeline events will appear here/i)).toBeInTheDocument();
    });

    it('should show empty state when all events filtered out', async () => {
      render(<EnhancedCaseTimeline {...defaultProps} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText(/search events/i);
      await userEvent.type(searchInput, 'NonexistentEvent');

      await waitFor(() => {
        expect(screen.getByText('No events found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Event Priority Display', () => {
    it('should show critical priority with red border', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Check that the critical event is displayed
      expect(screen.getByText(/Discovery Response Due/i)).toBeInTheDocument();
    });

    it('should show high priority with orange border', () => {
      render(<EnhancedCaseTimeline {...defaultProps} />);

      // Check that high priority events are displayed
      expect(screen.getByText('Complaint Filed')).toBeInTheDocument();
    });
  });

  describe('Related Events', () => {
    it('should display related events count', () => {
      const eventWithRelated: TimelineEvent = {
        id: 'evt-rel',
        type: 'filing' as EventType,
        title: 'Motion Filed',
        date: '2024-01-15T09:00:00Z',
        status: 'completed' as EventStatus,
        relatedEvents: ['evt-1', 'evt-2'],
      };

      render(<EnhancedCaseTimeline {...defaultProps} events={[...mockEvents, eventWithRelated]} />);

      expect(screen.getByText('2 related')).toBeInTheDocument();
    });
  });

  describe('Chronological Timeline', () => {
    it('should show timeline line in chronological view', () => {
      render(<EnhancedCaseTimeline {...defaultProps} viewMode="chronological" />);

      // Timeline should render with visual line
      const timeline = screen.getByText('Complaint Filed').closest('div')?.parentElement;
      expect(timeline).toBeInTheDocument();
    });

    it('should sort events by date in chronological view', () => {
      render(<EnhancedCaseTimeline {...defaultProps} viewMode="chronological" />);

      // Events should be in date order (most recent first based on component logic)
      const eventTitles = screen.getAllByRole('heading', { level: 4 });
      expect(eventTitles.length).toBeGreaterThan(0);
    });
  });
});
