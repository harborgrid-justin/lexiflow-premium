/**
 * @fileoverview Enterprise-grade tests for CourtDatesList component
 * @module components/court-dates/CourtDatesList.test
 *
 * Tests court date listing, view switching, preparation status badges.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourtDatesList } from './CourtDatesList';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockCourtDates = [
  {
    id: '1',
    court: 'Superior Court of California',
    caseNumber: 'CV-2024-001234',
    hearingType: 'Motion Hearing',
    judge: 'Hon. Sarah Johnson',
    dateTime: '2024-02-15T09:00:00',
    preparationStatus: 'ready' as const,
    notes: 'All documents filed',
  },
  {
    id: '2',
    court: 'Federal District Court',
    caseNumber: 'FD-2024-00567',
    hearingType: 'Pretrial Conference',
    judge: 'Hon. Michael Chen',
    dateTime: '2024-02-20T14:30:00',
    preparationStatus: 'in-progress' as const,
    notes: 'Witness list pending',
  },
  {
    id: '3',
    court: 'Municipal Court',
    caseNumber: 'MC-2024-00089',
    hearingType: 'Status Conference',
    judge: 'Hon. Emily Williams',
    dateTime: '2024-03-01T10:00:00',
    preparationStatus: 'not-started' as const,
  },
];

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CourtDatesList', () => {
  describe('Header', () => {
    it('renders the Court Dates title', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByRole('heading', { name: /court dates/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VIEW TOGGLE TESTS
  // ============================================================================

  describe('View Toggle', () => {
    it('renders List View button', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument();
    });

    it('renders Calendar View button', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByRole('button', { name: /calendar view/i })).toBeInTheDocument();
    });

    it('defaults to List View', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      const listButton = screen.getByRole('button', { name: /list view/i });
      expect(listButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('switches to Calendar View when clicked', async () => {
      const user = userEvent.setup();
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      await user.click(screen.getByRole('button', { name: /calendar view/i }));

      const calendarButton = screen.getByRole('button', { name: /calendar view/i });
      expect(calendarButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('shows calendar placeholder in Calendar View', async () => {
      const user = userEvent.setup();
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      await user.click(screen.getByRole('button', { name: /calendar view/i }));

      expect(screen.getByText(/calendar view - coming soon/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TABLE HEADERS TESTS
  // ============================================================================

  describe('Table Headers', () => {
    it('renders Date & Time header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/date & time/i)).toBeInTheDocument();
    });

    it('renders Court header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/^court$/i)).toBeInTheDocument();
    });

    it('renders Case header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/^case$/i)).toBeInTheDocument();
    });

    it('renders Hearing Type header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/hearing type/i)).toBeInTheDocument();
    });

    it('renders Judge header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/^judge$/i)).toBeInTheDocument();
    });

    it('renders Preparation header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByText(/preparation/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COURT DATE DATA TESTS
  // ============================================================================

  describe('Court Date Data', () => {
    it('renders court names', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      expect(screen.getByText('Superior Court of California')).toBeInTheDocument();
      expect(screen.getByText('Federal District Court')).toBeInTheDocument();
      expect(screen.getByText('Municipal Court')).toBeInTheDocument();
    });

    it('renders case numbers', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      expect(screen.getByText('CV-2024-001234')).toBeInTheDocument();
      expect(screen.getByText('FD-2024-00567')).toBeInTheDocument();
      expect(screen.getByText('MC-2024-00089')).toBeInTheDocument();
    });

    it('renders hearing types', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      expect(screen.getByText('Motion Hearing')).toBeInTheDocument();
      expect(screen.getByText('Pretrial Conference')).toBeInTheDocument();
      expect(screen.getByText('Status Conference')).toBeInTheDocument();
    });

    it('renders judge names', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      expect(screen.getByText('Hon. Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Hon. Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Hon. Emily Williams')).toBeInTheDocument();
    });

    it('renders formatted dates', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      // Dates are formatted via toLocaleString
      const dateElements = screen.getAllByRole('cell').filter(
        cell => cell.textContent?.includes('2024')
      );
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PREPARATION STATUS TESTS
  // ============================================================================

  describe('Preparation Status', () => {
    it('renders ready status with green styling', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const readyBadge = screen.getByText('ready');
      expect(readyBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders in-progress status with yellow styling', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const inProgressBadge = screen.getByText('in-progress');
      expect(inProgressBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders not-started status with red styling', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const notStartedBadge = screen.getByText('not-started');
      expect(notStartedBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('applies pill styling to all status badges', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const badges = ['ready', 'in-progress', 'not-started'].map(status =>
        screen.getByText(status)
      );

      badges.forEach(badge => {
        expect(badge).toHaveClass('px-2', 'text-xs', 'leading-5', 'font-semibold', 'rounded-full');
      });
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('shows empty state when no court dates', () => {
      render(<CourtDatesList initialCourtDates={[]} />);

      expect(screen.getByText(/no upcoming court dates/i)).toBeInTheDocument();
    });

    it('spans all columns for empty state', () => {
      render(<CourtDatesList initialCourtDates={[]} />);

      const emptyCell = screen.getByText(/no upcoming court dates/i).closest('td');
      expect(emptyCell).toHaveAttribute('colspan', '6');
    });
  });

  // ============================================================================
  // TABLE STRUCTURE TESTS
  // ============================================================================

  describe('Table Structure', () => {
    it('renders table element', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has proper table rows', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows.length).toBe(4);
    });

    it('rows are hoverable', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const dataRows = screen.getAllByRole('row').slice(1);
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const title = screen.getByRole('heading', { name: /court dates/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to table header', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const thead = screen.getByRole('table').querySelector('thead');
      expect(thead).toHaveClass('dark:bg-gray-900');
    });

    it('applies dark mode classes to table body', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toHaveClass('dark:bg-gray-800');
    });

    it('applies dark mode classes to status badges', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const readyBadge = screen.getByText('ready');
      expect(readyBadge).toHaveClass('dark:bg-green-900', 'dark:text-green-200');
    });

    it('applies dark mode classes to view buttons', () => {
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      const calendarButton = screen.getByRole('button', { name: /calendar view/i });
      expect(calendarButton).toHaveClass('dark:bg-gray-700', 'dark:text-gray-300');
    });
  });

  // ============================================================================
  // SINGLE COURT DATE TEST
  // ============================================================================

  describe('Single Court Date', () => {
    it('renders correctly with single court date', () => {
      const single = [mockCourtDates[0]];
      render(<CourtDatesList initialCourtDates={single} />);

      expect(screen.getByText('Superior Court of California')).toBeInTheDocument();
      expect(screen.queryByText('Federal District Court')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CALENDAR VIEW TESTS
  // ============================================================================

  describe('Calendar View', () => {
    it('hides table in calendar view', async () => {
      const user = userEvent.setup();
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      await user.click(screen.getByRole('button', { name: /calendar view/i }));

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows placeholder message in calendar view', async () => {
      const user = userEvent.setup();
      render(<CourtDatesList initialCourtDates={mockCourtDates} />);

      await user.click(screen.getByRole('button', { name: /calendar view/i }));

      expect(screen.getByText(/calendar view - coming soon/i)).toBeInTheDocument();
    });
  });
});
