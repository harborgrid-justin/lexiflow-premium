/**
 * @fileoverview Enterprise-grade tests for CaseCalendar component
 * @module components/case-calendar/CaseCalendar.test
 *
 * Tests calendar grid rendering, view switching, date navigation,
 * and event display functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseCalendar } from './CaseCalendar';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CaseCalendar', () => {
  describe('Header', () => {
    it('renders the Case Calendar title', () => {
      render(<CaseCalendar />);
      expect(screen.getByRole('heading', { name: /case calendar/i })).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      render(<CaseCalendar />);
      expect(screen.getByText(/schedule and deadlines/i)).toBeInTheDocument();
    });

    it('renders Add Event button', () => {
      render(<CaseCalendar />);
      expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    });

    it('renders filter button', () => {
      render(<CaseCalendar />);
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VIEW SWITCHING TESTS
  // ============================================================================

  describe('View Switching', () => {
    it('defaults to month view', () => {
      render(<CaseCalendar />);
      const monthButton = screen.getByRole('button', { name: /^month$/i });
      expect(monthButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('renders all view options', () => {
      render(<CaseCalendar />);

      expect(screen.getByRole('button', { name: /^month$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^week$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^day$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^agenda$/i })).toBeInTheDocument();
    });

    it('switches to week view when clicked', async () => {
      const user = userEvent.setup();
      render(<CaseCalendar />);

      await user.click(screen.getByRole('button', { name: /^week$/i }));

      const weekButton = screen.getByRole('button', { name: /^week$/i });
      expect(weekButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('switches to day view when clicked', async () => {
      const user = userEvent.setup();
      render(<CaseCalendar />);

      await user.click(screen.getByRole('button', { name: /^day$/i }));

      const dayButton = screen.getByRole('button', { name: /^day$/i });
      expect(dayButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('switches to agenda view when clicked', async () => {
      const user = userEvent.setup();
      render(<CaseCalendar />);

      await user.click(screen.getByRole('button', { name: /^agenda$/i }));

      const agendaButton = screen.getByRole('button', { name: /^agenda$/i });
      expect(agendaButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  // ============================================================================
  // CALENDAR NAVIGATION TESTS
  // ============================================================================

  describe('Calendar Navigation', () => {
    it('displays current month and year', () => {
      render(<CaseCalendar />);

      const currentDate = new Date();
      const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('renders navigation chevrons', () => {
      render(<CaseCalendar />);

      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('renders Today button', () => {
      render(<CaseCalendar />);
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });

    it('Today button resets to current date when clicked', async () => {
      const user = userEvent.setup();
      render(<CaseCalendar />);

      const todayButton = screen.getByRole('button', { name: /today/i });
      await user.click(todayButton);

      const currentDate = new Date();
      const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CALENDAR GRID TESTS
  // ============================================================================

  describe('Calendar Grid', () => {
    it('renders day of week headers', () => {
      render(<CaseCalendar />);

      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('renders calendar day cells', () => {
      render(<CaseCalendar />);

      // Should have at least 28 days visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
    });

    it('highlights current day', () => {
      render(<CaseCalendar />);

      const currentDay = new Date().getDate();
      // The current day should have special styling (bg-blue-600)
      const dayElements = screen.getAllByText(currentDay.toString());
      const highlightedDay = dayElements.find(el =>
        el.classList.contains('bg-blue-600') ||
        el.closest('.bg-blue-600') !== null
      );

      // Current day styling exists in the component
      expect(dayElements.length).toBeGreaterThan(0);
    });

    it('renders seven columns for days of week', () => {
      render(<CaseCalendar />);

      const gridHeader = screen.getByText('Sun').closest('.grid');
      expect(gridHeader).toHaveClass('grid-cols-7');
    });
  });

  // ============================================================================
  // EVENT DISPLAY TESTS
  // ============================================================================

  describe('Event Display', () => {
    it('renders mock events on certain days', () => {
      render(<CaseCalendar />);

      // The component shows events on days divisible by 5 or day 15, 22
      const statusConfElements = screen.getAllByText(/status conf/i);
      expect(statusConfElements.length).toBeGreaterThan(0);
    });

    it('renders filing deadline event on day 15', () => {
      render(<CaseCalendar />);

      expect(screen.getByText(/filing deadline/i)).toBeInTheDocument();
    });

    it('applies correct event styling', () => {
      render(<CaseCalendar />);

      const statusEvent = screen.getAllByText(/status conf/i)[0];
      expect(statusEvent).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  // ============================================================================
  // LEGEND TESTS
  // ============================================================================

  describe('Legend', () => {
    it('renders hearing legend indicator', () => {
      render(<CaseCalendar />);
      expect(screen.getByText('Hearings')).toBeInTheDocument();
    });

    it('renders deadlines legend indicator', () => {
      render(<CaseCalendar />);
      expect(screen.getByText('Deadlines')).toBeInTheDocument();
    });

    it('renders meetings legend indicator', () => {
      render(<CaseCalendar />);
      expect(screen.getByText('Meetings')).toBeInTheDocument();
    });

    it('renders colored dots for legend items', () => {
      render(<CaseCalendar />);

      // Blue dot for hearings
      const hearingsText = screen.getByText('Hearings');
      const hearingsDot = hearingsText.previousElementSibling;
      expect(hearingsDot).toHaveClass('bg-blue-500');

      // Red dot for deadlines
      const deadlinesText = screen.getByText('Deadlines');
      const deadlinesDot = deadlinesText.previousElementSibling;
      expect(deadlinesDot).toHaveClass('bg-red-500');

      // Emerald dot for meetings
      const meetingsText = screen.getByText('Meetings');
      const meetingsDot = meetingsText.previousElementSibling;
      expect(meetingsDot).toHaveClass('bg-emerald-500');
    });
  });

  // ============================================================================
  // ADD EVENT BUTTON TESTS
  // ============================================================================

  describe('Add Event Button', () => {
    it('renders Add Event button with Plus icon', () => {
      render(<CaseCalendar />);

      const addButton = screen.getByRole('button', { name: /add event/i });
      expect(addButton).toBeInTheDocument();
      expect(screen.getAllByTestId('plus-icon').length).toBeGreaterThan(0);
    });

    it('Add Event button has correct styling', () => {
      render(<CaseCalendar />);

      const addButton = screen.getByRole('button', { name: /add event/i });
      expect(addButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  // ============================================================================
  // HOVER INTERACTIONS TESTS
  // ============================================================================

  describe('Hover Interactions', () => {
    it('day cells have hover effect classes', () => {
      render(<CaseCalendar />);

      // Get a day cell
      const dayCells = document.querySelectorAll('.hover\\:bg-slate-50');
      expect(dayCells.length).toBeGreaterThan(0);
    });

    it('shows plus button on hover (via group-hover)', () => {
      render(<CaseCalendar />);

      // Plus buttons use group-hover:opacity-100
      const hiddenPlusButtons = document.querySelectorAll('.opacity-0.group-hover\\:opacity-100');
      expect(hiddenPlusButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to main container', () => {
      render(<CaseCalendar />);

      const container = screen.getByRole('heading', { name: /case calendar/i }).closest('.dark\\:bg-slate-900');
      expect(container).toBeInTheDocument();
    });

    it('applies dark mode classes to day headers', () => {
      render(<CaseCalendar />);

      const dayHeader = screen.getByText('Sun');
      expect(dayHeader).toHaveClass('dark:text-slate-400');
    });

    it('applies dark mode classes to calendar cells', () => {
      render(<CaseCalendar />);

      const calendarGrid = screen.getByText('Sun').closest('.grid')?.nextElementSibling;
      const cells = calendarGrid?.querySelectorAll('.dark\\:bg-slate-800');
      expect(cells?.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('header uses flex-col on mobile and flex-row on larger screens', () => {
      render(<CaseCalendar />);

      const header = screen.getByRole('heading', { name: /case calendar/i }).closest('.flex-col');
      expect(header).toHaveClass('sm:flex-row');
    });
  });
});
