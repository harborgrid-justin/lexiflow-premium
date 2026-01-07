/**
 * @fileoverview Enterprise-grade tests for DocketManager component
 * @module components/docket/DocketManager.test
 *
 * Tests docket sheet, calendar view, analytics, and ECF/PACER sync.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocketManager from './DocketManager';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart2: () => <svg data-testid="bar-chart-icon" />,
  BookOpen: () => <svg data-testid="book-open-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  Gavel: () => <svg data-testid="gavel-icon" />,
  List: () => <svg data-testid="list-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('DocketManager', () => {
  describe('Header', () => {
    it('renders the Docket & Filings title', () => {
      render(<DocketManager />);
      expect(screen.getByRole('heading', { name: /docket & filings/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<DocketManager />);
      expect(screen.getByText(/court docket management with ecf\/pacer integration/i)).toBeInTheDocument();
    });

    it('renders Sync ECF/PACER button', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /sync ecf\/pacer/i })).toBeInTheDocument();
    });

    it('renders Batch Export button', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /batch export/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PARENT TAB NAVIGATION TESTS
  // ============================================================================

  describe('Parent Tab Navigation', () => {
    it('renders Docket Sheet tab', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /docket sheet/i })).toBeInTheDocument();
    });

    it('renders Deadlines tab', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /deadlines/i })).toBeInTheDocument();
    });

    it('renders Analytics tab', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /analytics/i })).toBeInTheDocument();
    });

    it('renders Settings tab', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('defaults to Docket Sheet tab', () => {
      render(<DocketManager />);
      const docketTab = screen.getByRole('button', { name: /docket sheet/i });
      expect(docketTab).toHaveClass('border-blue-600', 'text-blue-600');
    });
  });

  // ============================================================================
  // SUB-TAB NAVIGATION TESTS
  // ============================================================================

  describe('Sub-Tab Navigation', () => {
    it('renders All Entries sub-tab for Docket Sheet', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /all entries/i })).toBeInTheDocument();
    });

    it('renders Filings sub-tab for Docket Sheet', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /^filings$/i })).toBeInTheDocument();
    });

    it('renders Orders sub-tab for Docket Sheet', () => {
      render(<DocketManager />);
      expect(screen.getByRole('button', { name: /orders/i })).toBeInTheDocument();
    });

    it('changes sub-tabs when parent tab changes', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /deadlines/i }));

      expect(screen.getByRole('button', { name: /calendar view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upcoming/i })).toBeInTheDocument();
    });

    it('shows Statistics sub-tab for Analytics', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByRole('button', { name: /statistics/i })).toBeInTheDocument();
    });

    it('shows ECF/PACER sub-tab for Settings', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByRole('button', { name: /ecf\/pacer/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DOCKET SHEET CONTENT TESTS
  // ============================================================================

  describe('Docket Sheet Content', () => {
    it('renders Docket Sheet heading', () => {
      render(<DocketManager />);
      expect(screen.getByRole('heading', { name: /docket sheet: all/i })).toBeInTheDocument();
    });

    it('renders docket entries', () => {
      render(<DocketManager />);

      // Mock entries with Document #101, #102, #103
      expect(screen.getByText(/document #101/i)).toBeInTheDocument();
      expect(screen.getByText(/document #102/i)).toBeInTheDocument();
      expect(screen.getByText(/document #103/i)).toBeInTheDocument();
    });

    it('renders filed status badges', () => {
      render(<DocketManager />);

      const filedBadges = screen.getAllByText('Filed');
      expect(filedBadges.length).toBe(3);
    });

    it('renders filing dates', () => {
      render(<DocketManager />);

      expect(screen.getByText(/filed on jan 1/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FILINGS SUB-TAB TESTS
  // ============================================================================

  describe('Filings Sub-Tab', () => {
    it('changes heading to filings filter', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /^filings$/i }));

      expect(screen.getByRole('heading', { name: /docket sheet: filings/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ORDERS SUB-TAB TESTS
  // ============================================================================

  describe('Orders Sub-Tab', () => {
    it('changes heading to orders filter', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /orders/i }));

      expect(screen.getByRole('heading', { name: /docket sheet: orders/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CALENDAR VIEW TESTS
  // ============================================================================

  describe('Calendar View', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<DocketManager />);
      await user.click(screen.getByRole('button', { name: /deadlines/i }));
    });

    it('renders Docket Calendar heading', () => {
      expect(screen.getByRole('heading', { name: /docket calendar/i })).toBeInTheDocument();
    });

    it('renders calendar grid with 31 days', () => {
      const dayElements = screen.getAllByText(/^[1-9]$|^[12][0-9]$|^3[01]$/);
      expect(dayElements.length).toBe(31);
    });
  });

  // ============================================================================
  // ANALYTICS VIEW TESTS
  // ============================================================================

  describe('Analytics View', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<DocketManager />);
      await user.click(screen.getByRole('button', { name: /analytics/i }));
    });

    it('renders Analytics heading', () => {
      expect(screen.getByRole('heading', { name: /analytics/i })).toBeInTheDocument();
    });

    it('renders Filings stat', () => {
      expect(screen.getByText('Filings')).toBeInTheDocument();
    });

    it('renders Orders stat', () => {
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    it('renders Motions stat', () => {
      expect(screen.getByText('Motions')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SETTINGS VIEW TESTS
  // ============================================================================

  describe('Settings View', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<DocketManager />);
      await user.click(screen.getByRole('button', { name: /settings/i }));
    });

    it('renders Settings & Sync heading', () => {
      expect(screen.getByRole('heading', { name: /settings & sync/i })).toBeInTheDocument();
    });

    it('renders ECF/PACER Sync section', () => {
      expect(screen.getByText(/ecf\/pacer sync/i)).toBeInTheDocument();
    });

    it('renders last synced info', () => {
      expect(screen.getByText(/last synced: 2 hours ago/i)).toBeInTheDocument();
    });

    it('renders Sync Now button', () => {
      expect(screen.getByRole('button', { name: /sync now/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INITIAL TAB PROP TESTS
  // ============================================================================

  describe('Initial Tab Prop', () => {
    it('starts on specified tab', () => {
      render(<DocketManager initialTab="calendar" />);
      expect(screen.getByRole('heading', { name: /docket calendar/i })).toBeInTheDocument();
    });

    it('starts on stats tab when specified', () => {
      render(<DocketManager initialTab="stats" />);
      expect(screen.getByRole('heading', { name: /analytics/i })).toBeInTheDocument();
    });

    it('starts on sync tab when specified', () => {
      render(<DocketManager initialTab="sync" />);
      expect(screen.getByRole('heading', { name: /settings & sync/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FILED STATUS BADGE STYLING TESTS
  // ============================================================================

  describe('Filed Status Badge Styling', () => {
    it('applies green styling to Filed badges', () => {
      render(<DocketManager />);

      const filedBadges = screen.getAllByText('Filed');
      filedBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-700');
      });
    });
  });

  // ============================================================================
  // BUTTON STYLING TESTS
  // ============================================================================

  describe('Button Styling', () => {
    it('Sync ECF/PACER button has white background', () => {
      render(<DocketManager />);

      const syncButton = screen.getByRole('button', { name: /sync ecf\/pacer/i });
      expect(syncButton).toHaveClass('bg-white');
    });

    it('Batch Export button has blue background', () => {
      render(<DocketManager />);

      const exportButton = screen.getByRole('button', { name: /batch export/i });
      expect(exportButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  // ============================================================================
  // SUB-TAB ACTIVE STATE TESTS
  // ============================================================================

  describe('Sub-Tab Active State', () => {
    it('defaults to All Entries active', () => {
      render(<DocketManager />);

      const allEntriesTab = screen.getByRole('button', { name: /all entries/i });
      expect(allEntriesTab).toHaveClass('bg-slate-100', 'text-blue-700');
    });

    it('changes active state when sub-tab clicked', async () => {
      const user = userEvent.setup();
      render(<DocketManager />);

      await user.click(screen.getByRole('button', { name: /^filings$/i }));

      const filingsTab = screen.getByRole('button', { name: /^filings$/i });
      expect(filingsTab).toHaveClass('bg-slate-100', 'text-blue-700');
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('hides parent tabs on mobile', () => {
      render(<DocketManager />);

      const parentNav = screen.getByRole('button', { name: /docket sheet/i }).closest('.hidden');
      expect(parentNav).toHaveClass('md:flex');
    });
  });

  // ============================================================================
  // TAB ICONS TESTS
  // ============================================================================

  describe('Tab Icons', () => {
    it('renders BookOpen icon for Docket Sheet', () => {
      render(<DocketManager />);
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    it('renders Calendar icon for Deadlines', () => {
      render(<DocketManager />);
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      expect(calendarIcons.length).toBeGreaterThan(0);
    });

    it('renders BarChart icon for Analytics', () => {
      render(<DocketManager />);
      const chartIcons = screen.getAllByTestId('bar-chart-icon');
      expect(chartIcons.length).toBeGreaterThan(0);
    });

    it('renders Settings icon for Settings', () => {
      render(<DocketManager />);
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });
  });
});
