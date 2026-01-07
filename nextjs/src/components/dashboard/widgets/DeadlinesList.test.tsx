/**
 * @jest-environment jsdom
 * DeadlinesList Component Tests
 * Enterprise-grade tests for dashboard deadlines widget
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeadlinesList, DeadlinesListProps, Deadline } from './DeadlinesList';

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
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM') return 'Jun';
    if (formatStr === 'd') return '18';
    return date.toString();
  }),
  formatDistanceToNow: jest.fn(() => 'in 3 days'),
  isPast: jest.fn(() => false),
  isToday: jest.fn(() => false),
  isTomorrow: jest.fn(() => false),
  isThisWeek: jest.fn(() => true),
}));

const createMockDeadline = (overrides: Partial<Deadline> = {}): Deadline => ({
  id: 'deadline-1',
  title: 'Court Filing',
  description: 'Submit motion papers',
  date: '2024-06-18T14:00:00Z',
  type: 'filing',
  priority: 'high',
  ...overrides,
});

const defaultProps: DeadlinesListProps = {
  deadlines: [],
};

describe('DeadlinesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders deadline title', () => {
      const deadlines = [createMockDeadline({ title: 'Important Filing' })];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Important Filing')).toBeInTheDocument();
    });

    it('renders deadline description', () => {
      const deadlines = [createMockDeadline({ description: 'Submit documents' })];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Submit documents')).toBeInTheDocument();
    });

    it('renders date badge with month and day', () => {
      const deadlines = [createMockDeadline()];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Jun')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('renders case name when provided', () => {
      const deadlines = [createMockDeadline({ caseName: 'Smith v. Jones' })];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });

    it('renders deadline type', () => {
      const deadlines = [createMockDeadline({ type: 'hearing' })];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('hearing')).toBeInTheDocument();
    });

    it('renders assignee name when provided', () => {
      const deadlines = [createMockDeadline({
        assignee: { id: 'user-1', name: 'John Doe' }
      })];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      const { container } = render(<DeadlinesList {...defaultProps} isLoading={true} />);

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows 5 skeleton items', () => {
      const { container } = render(<DeadlinesList {...defaultProps} isLoading={true} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(5);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no deadlines', () => {
      render(<DeadlinesList {...defaultProps} deadlines={[]} />);

      expect(screen.getByText('No upcoming deadlines')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      render(
        <DeadlinesList
          {...defaultProps}
          deadlines={[]}
          emptyMessage="All caught up!"
        />
      );

      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });
  });

  describe('Priority Styling', () => {
    it('applies critical priority styling', () => {
      const deadlines = [createMockDeadline({ priority: 'critical' })];

      const { container } = render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(container.querySelector('.border-red-200')).toBeInTheDocument();
    });

    it('applies high priority styling', () => {
      const deadlines = [createMockDeadline({ priority: 'high' })];

      const { container } = render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(container.querySelector('.border-orange-200')).toBeInTheDocument();
    });

    it('applies medium priority styling', () => {
      const deadlines = [createMockDeadline({ priority: 'medium' })];

      const { container } = render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
    });

    it('applies low priority styling', () => {
      const deadlines = [createMockDeadline({ priority: 'low' })];

      const { container } = render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
    });

    it('shows priority dot indicator', () => {
      const deadlines = [createMockDeadline({ priority: 'critical' })];

      const { container } = render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(container.querySelector('.rounded-full.bg-red-500')).toBeInTheDocument();
    });
  });

  describe('Status Handling', () => {
    it('shows overdue status for past dates', () => {
      const { isPast } = require('date-fns');
      isPast.mockReturnValue(true);

      const deadlines = [createMockDeadline()];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('shows Today for today dates', () => {
      const { isPast, isToday } = require('date-fns');
      isPast.mockReturnValue(false);
      isToday.mockReturnValue(true);

      const deadlines = [createMockDeadline()];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('shows Tomorrow for tomorrow dates', () => {
      const { isPast, isToday, isTomorrow } = require('date-fns');
      isPast.mockReturnValue(false);
      isToday.mockReturnValue(false);
      isTomorrow.mockReturnValue(true);

      const deadlines = [createMockDeadline()];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('shows This Week for dates within the week', () => {
      const { isPast, isToday, isTomorrow, isThisWeek } = require('date-fns');
      isPast.mockReturnValue(false);
      isToday.mockReturnValue(false);
      isTomorrow.mockReturnValue(false);
      isThisWeek.mockReturnValue(true);

      const deadlines = [createMockDeadline()];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    it('shows completed status icon for completed deadlines', () => {
      const deadlines = [createMockDeadline({ status: 'completed' })];

      const { container } = render(
        <DeadlinesList
          {...defaultProps}
          deadlines={deadlines}
          showCompleted={true}
        />
      );

      expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
    });

    it('applies reduced opacity for completed deadlines', () => {
      const deadlines = [createMockDeadline({ status: 'completed' })];

      const { container } = render(
        <DeadlinesList
          {...defaultProps}
          deadlines={deadlines}
          showCompleted={true}
        />
      );

      expect(container.querySelector('.opacity-60')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('hides completed deadlines by default', () => {
      const deadlines = [
        createMockDeadline({ id: '1', title: 'Pending', status: 'pending' }),
        createMockDeadline({ id: '2', title: 'Completed', status: 'completed' }),
      ];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });

    it('shows completed deadlines when showCompleted is true', () => {
      const deadlines = [
        createMockDeadline({ id: '1', title: 'Pending', status: 'pending' }),
        createMockDeadline({ id: '2', title: 'Completed', status: 'completed' }),
      ];

      render(
        <DeadlinesList
          {...defaultProps}
          deadlines={deadlines}
          showCompleted={true}
        />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Max Items', () => {
    it('limits displayed items to maxItems', () => {
      const deadlines = Array.from({ length: 15 }, (_, i) =>
        createMockDeadline({ id: String(i), title: `Deadline ${i}` })
      );

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} maxItems={5} />);

      expect(screen.getByText('Deadline 0')).toBeInTheDocument();
      expect(screen.getByText('Deadline 4')).toBeInTheDocument();
      expect(screen.queryByText('Deadline 5')).not.toBeInTheDocument();
    });

    it('defaults to 10 max items', () => {
      const deadlines = Array.from({ length: 15 }, (_, i) =>
        createMockDeadline({ id: String(i), title: `Deadline ${i}` })
      );

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      expect(screen.getByText('Deadline 9')).toBeInTheDocument();
      expect(screen.queryByText('Deadline 10')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by date (earliest first)', () => {
      const deadlines = [
        createMockDeadline({ id: '1', title: 'Later', date: '2024-06-25T14:00:00Z' }),
        createMockDeadline({ id: '2', title: 'Earlier', date: '2024-06-15T14:00:00Z' }),
      ];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      const titles = screen.getAllByRole('heading', { level: 4 });
      expect(titles[0]).toHaveTextContent('Earlier');
      expect(titles[1]).toHaveTextContent('Later');
    });

    it('sorts by priority when dates are equal', () => {
      const deadlines = [
        createMockDeadline({ id: '1', title: 'Low', priority: 'low', date: '2024-06-15T14:00:00Z' }),
        createMockDeadline({ id: '2', title: 'Critical', priority: 'critical', date: '2024-06-15T14:00:00Z' }),
      ];

      render(<DeadlinesList {...defaultProps} deadlines={deadlines} />);

      const titles = screen.getAllByRole('heading', { level: 4 });
      expect(titles[0]).toHaveTextContent('Critical');
      expect(titles[1]).toHaveTextContent('Low');
    });
  });

  describe('Click Handler', () => {
    it('calls onDeadlineClick when deadline clicked', async () => {
      const user = userEvent.setup();
      const onDeadlineClick = jest.fn();
      const deadline = createMockDeadline();

      render(
        <DeadlinesList
          {...defaultProps}
          deadlines={[deadline]}
          onDeadlineClick={onDeadlineClick}
        />
      );

      await user.click(screen.getByText('Court Filing'));

      expect(onDeadlineClick).toHaveBeenCalledWith(deadline);
    });

    it('applies cursor-pointer when onDeadlineClick provided', () => {
      const deadlines = [createMockDeadline()];

      const { container } = render(
        <DeadlinesList
          {...defaultProps}
          deadlines={deadlines}
          onDeadlineClick={jest.fn()}
        />
      );

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });

    it('applies hover effects when clickable', () => {
      const deadlines = [createMockDeadline()];

      const { container } = render(
        <DeadlinesList
          {...defaultProps}
          deadlines={deadlines}
          onDeadlineClick={jest.fn()}
        />
      );

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DeadlinesList
          {...defaultProps}
          deadlines={[createMockDeadline()]}
          className="custom-deadlines"
        />
      );

      expect(container.firstChild).toHaveClass('custom-deadlines');
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(DeadlinesList.displayName).toBe('DeadlinesList');
    });
  });
});
