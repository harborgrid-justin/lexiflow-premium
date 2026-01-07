/**
 * @jest-environment jsdom
 * DeadlineList Component Tests
 * Enterprise-grade tests for deadline list with priority indicators
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeadlineList, DeadlineListProps } from './DeadlineList';
import type { CalendarEvent } from '@/api/workflow/calendar-api';

// Mock date-fns
const mockNow = new Date('2024-06-15T10:00:00Z');
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => 'in 3 days'),
  differenceInDays: jest.fn((date) => {
    const targetDate = new Date(date);
    const now = new Date('2024-06-15T10:00:00Z');
    return Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }),
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM d, yyyy') return 'Jun 18, 2024';
    if (formatStr === 'h:mm a') return '2:00 PM';
    return date.toString();
  }),
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
window.confirm = mockConfirm;

const createMockEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'event-1',
  title: 'Court Filing Deadline',
  description: 'Submit motion to dismiss',
  startDate: '2024-06-18T14:00:00Z',
  endDate: '2024-06-18T15:00:00Z',
  eventType: 'FILING_DEADLINE',
  completed: false,
  ...overrides,
});

const defaultProps: DeadlineListProps = {
  events: [],
};

describe('DeadlineList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the Deadlines header with count', () => {
      const events = [createMockEvent()];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Deadlines (1)');
    });

    it('renders sort dropdown', () => {
      const events = [createMockEvent()];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Sort by Date')).toBeInTheDocument();
    });

    it('renders event title', () => {
      const events = [createMockEvent({ title: 'Important Deadline' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Important Deadline')).toBeInTheDocument();
    });

    it('renders event description', () => {
      const events = [createMockEvent({ description: 'File documents with court' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('File documents with court')).toBeInTheDocument();
    });

    it('renders event date', () => {
      const events = [createMockEvent()];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Jun 18, 2024')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM')).toBeInTheDocument();
    });

    it('renders event type badge', () => {
      const events = [createMockEvent({ eventType: 'COURT_HEARING' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('COURT HEARING')).toBeInTheDocument();
    });

    it('renders location when provided', () => {
      const events = [createMockEvent({ location: 'Federal Courthouse, Room 302' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Federal Courthouse, Room 302')).toBeInTheDocument();
    });

    it('renders case ID when provided', () => {
      const events = [createMockEvent({ caseId: 'CASE-2024-001' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Case: CASE-2024-001')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no events', () => {
      render(<DeadlineList {...defaultProps} events={[]} />);

      expect(screen.getByText('No deadlines found')).toBeInTheDocument();
    });

    it('shows empty state when all events filtered out', () => {
      const events = [createMockEvent({ completed: true })];

      render(<DeadlineList {...defaultProps} events={events} showCompleted={false} />);

      expect(screen.getByText('No deadlines found')).toBeInTheDocument();
    });
  });

  describe('Event Type Icons', () => {
    it('renders correct icon for COURT_HEARING', () => {
      const events = [createMockEvent({ eventType: 'COURT_HEARING' })];
      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      // Should have scales icon (represented by SVG)
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correct icon for FILING_DEADLINE', () => {
      const events = [createMockEvent({ eventType: 'FILING_DEADLINE' })];
      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correct icon for DISCOVERY_DEADLINE', () => {
      const events = [createMockEvent({ eventType: 'DISCOVERY_DEADLINE' })];
      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correct icon for STATUTE_OF_LIMITATIONS', () => {
      const events = [createMockEvent({ eventType: 'STATUTE_OF_LIMITATIONS' })];
      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correct icon for REMINDER', () => {
      const events = [createMockEvent({ eventType: 'REMINDER' })];
      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Priority Colors', () => {
    it('applies red styling for overdue events', () => {
      const events = [createMockEvent({
        startDate: '2024-06-10T14:00:00Z', // Past date
        completed: false,
      })];

      // Update mock for this test
      require('date-fns').differenceInDays.mockReturnValueOnce(-5);

      const { container } = render(<DeadlineList {...defaultProps} events={events} />);

      expect(container.querySelector('.text-red-700')).toBeInTheDocument();
    });

    it('shows Overdue badge for past events', () => {
      const events = [createMockEvent({
        startDate: '2024-06-10T14:00:00Z',
        completed: false,
      })];

      require('date-fns').differenceInDays.mockReturnValueOnce(-5);

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('shows Today badge for today events', () => {
      const events = [createMockEvent({
        startDate: '2024-06-15T14:00:00Z', // Same day as mock now
        completed: false,
      })];

      require('date-fns').differenceInDays.mockReturnValueOnce(0);

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('hides completed events by default', () => {
      const events = [
        createMockEvent({ id: '1', title: 'Incomplete', completed: false }),
        createMockEvent({ id: '2', title: 'Completed', completed: true }),
      ];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('Incomplete')).toBeInTheDocument();
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });

    it('shows completed events when showCompleted is true', () => {
      const events = [
        createMockEvent({ id: '1', title: 'Incomplete', completed: false }),
        createMockEvent({ id: '2', title: 'Completed', completed: true }),
      ];

      render(<DeadlineList {...defaultProps} events={events} showCompleted={true} />);

      expect(screen.getByText('Incomplete')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('filters by upcoming events', () => {
      const events = [
        createMockEvent({ id: '1', title: 'Future', startDate: '2024-06-20T14:00:00Z' }),
        createMockEvent({ id: '2', title: 'Past', startDate: '2024-06-10T14:00:00Z' }),
      ];

      render(<DeadlineList {...defaultProps} events={events} filter="upcoming" />);

      expect(screen.getByText('Future')).toBeInTheDocument();
      expect(screen.queryByText('Past')).not.toBeInTheDocument();
    });

    it('filters by overdue events', () => {
      const events = [
        createMockEvent({ id: '1', title: 'Future', startDate: '2024-06-20T14:00:00Z' }),
        createMockEvent({ id: '2', title: 'Overdue', startDate: '2024-06-10T14:00:00Z', completed: false }),
      ];

      render(<DeadlineList {...defaultProps} events={events} filter="overdue" />);

      expect(screen.queryByText('Future')).not.toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by date by default', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const events = [
        createMockEvent({ id: '1', title: 'Later', startDate: '2024-06-25T14:00:00Z' }),
        createMockEvent({ id: '2', title: 'Earlier', startDate: '2024-06-18T14:00:00Z' }),
      ];

      render(<DeadlineList {...defaultProps} events={events} />);

      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings[0]).toHaveTextContent('Earlier');
      expect(headings[1]).toHaveTextContent('Later');
    });

    it('can sort by priority', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const events = [
        createMockEvent({ id: '1', title: 'Low', metadata: { priority: 'low' } }),
        createMockEvent({ id: '2', title: 'Urgent', metadata: { priority: 'urgent' } }),
      ];

      render(<DeadlineList {...defaultProps} events={events} />);

      await user.selectOptions(screen.getByRole('combobox'), 'priority');

      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings[0]).toHaveTextContent('Urgent');
      expect(headings[1]).toHaveTextContent('Low');
    });

    it('can sort by type', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const events = [
        createMockEvent({ id: '1', title: 'Reminder', eventType: 'REMINDER' }),
        createMockEvent({ id: '2', title: 'Court', eventType: 'COURT_HEARING' }),
      ];

      render(<DeadlineList {...defaultProps} events={events} />);

      await user.selectOptions(screen.getByRole('combobox'), 'type');

      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings[0]).toHaveTextContent('Court');
      expect(headings[1]).toHaveTextContent('Reminder');
    });
  });

  describe('Actions', () => {
    it('calls onEventClick when event clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onEventClick = jest.fn();
      const event = createMockEvent();

      render(<DeadlineList {...defaultProps} events={[event]} onEventClick={onEventClick} />);

      await user.click(screen.getByText('Court Filing Deadline'));

      expect(onEventClick).toHaveBeenCalledWith(event);
    });

    it('shows complete button for incomplete events when onComplete provided', () => {
      const events = [createMockEvent({ completed: false })];

      render(<DeadlineList {...defaultProps} events={events} onComplete={jest.fn()} />);

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      expect(screen.getByTitle('Mark as complete')).toBeInTheDocument();
    });

    it('calls onComplete when complete button clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onComplete = jest.fn();
      const event = createMockEvent({ completed: false });

      render(<DeadlineList {...defaultProps} events={[event]} onComplete={onComplete} />);

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      await user.click(screen.getByTitle('Mark as complete'));

      expect(onComplete).toHaveBeenCalledWith(event);
    });

    it('hides complete button for completed events', () => {
      const events = [createMockEvent({ completed: true })];

      render(
        <DeadlineList
          {...defaultProps}
          events={events}
          showCompleted={true}
          onComplete={jest.fn()}
        />
      );

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      expect(screen.queryByTitle('Mark as complete')).not.toBeInTheDocument();
    });

    it('shows delete button when onDelete provided', () => {
      const events = [createMockEvent()];

      render(<DeadlineList {...defaultProps} events={events} onDelete={jest.fn()} />);

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('calls onDelete with confirmation when delete button clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDelete = jest.fn();
      const event = createMockEvent();

      render(<DeadlineList {...defaultProps} events={[event]} onDelete={onDelete} />);

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      await user.click(screen.getByTitle('Delete'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(onDelete).toHaveBeenCalledWith(event);
    });

    it('does not call onDelete when confirmation cancelled', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDelete = jest.fn();
      mockConfirm.mockReturnValueOnce(false);
      const event = createMockEvent();

      render(<DeadlineList {...defaultProps} events={[event]} onDelete={onDelete} />);

      const eventItem = screen.getByText('Court Filing Deadline').closest('.group');
      fireEvent.mouseEnter(eventItem!);

      await user.click(screen.getByTitle('Delete'));

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Completed Events', () => {
    it('shows completed checkmark for completed events', () => {
      const events = [createMockEvent({ completed: true })];

      const { container } = render(
        <DeadlineList {...defaultProps} events={events} showCompleted={true} />
      );

      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('applies strikethrough to completed event title', () => {
      const events = [createMockEvent({ completed: true })];

      render(<DeadlineList {...defaultProps} events={events} showCompleted={true} />);

      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toHaveClass('line-through');
    });

    it('applies reduced opacity to completed events', () => {
      const events = [createMockEvent({ completed: true })];

      const { container } = render(
        <DeadlineList {...defaultProps} events={events} showCompleted={true} />
      );

      expect(container.querySelector('.opacity-60')).toBeInTheDocument();
    });
  });

  describe('Reminder Indicator', () => {
    it('shows reminder indicator when reminder is set', () => {
      const events = [createMockEvent({ reminder: '1 day before' })];

      render(<DeadlineList {...defaultProps} events={events} />);

      expect(screen.getByText('1 day before')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DeadlineList {...defaultProps} events={[createMockEvent()]} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
