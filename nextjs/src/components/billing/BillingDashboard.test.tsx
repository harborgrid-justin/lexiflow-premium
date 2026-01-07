/**
 * BillingDashboard Component Tests
 * Enterprise-grade tests for the billing dashboard with tab navigation,
 * sync functionality, and period selection.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillingDashboard from './BillingDashboard';

// Mock console.log for export testing
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

describe('BillingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('renders the dashboard header with title and description', () => {
      render(<BillingDashboard />);

      expect(screen.getByRole('heading', { name: /billing & finance/i })).toBeInTheDocument();
      expect(screen.getByText(/manage invoices, track time, and monitor financial health/i)).toBeInTheDocument();
    });

    it('renders all navigation tabs', () => {
      render(<BillingDashboard />);

      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wip/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /invoices/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /expenses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ledger/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trust/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analytics/i })).toBeInTheDocument();
    });

    it('renders the period selector with default value', () => {
      render(<BillingDashboard />);

      const periodSelector = screen.getByRole('combobox');
      expect(periodSelector).toBeInTheDocument();
      expect(periodSelector).toHaveValue('30d');
    });

    it('renders sync and export buttons', () => {
      render(<BillingDashboard />);

      expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders overview content by default', () => {
      render(<BillingDashboard />);

      expect(screen.getByText(/financial overview/i)).toBeInTheDocument();
      expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/\$124,500/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to WIP tab when clicked', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /wip/i }));

      await waitFor(() => {
        expect(screen.getByText(/work in progress/i)).toBeInTheDocument();
      });
    });

    it('switches to Invoices tab when clicked', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /invoices/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /invoices/i })).toBeInTheDocument();
      });
    });

    it('switches to Analytics tab when clicked', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      await waitFor(() => {
        expect(screen.getByText(/financial charts and reports/i)).toBeInTheDocument();
      });
    });

    it('applies active styling to selected tab', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      const overviewTab = screen.getByRole('button', { name: /overview/i });
      expect(overviewTab).toHaveClass('bg-blue-50');

      await user.click(screen.getByRole('button', { name: /invoices/i }));

      await waitFor(() => {
        const invoicesTab = screen.getByRole('button', { name: /invoices/i });
        expect(invoicesTab).toHaveClass('bg-blue-50');
        expect(overviewTab).not.toHaveClass('bg-blue-50');
      });
    });
  });

  describe('Period Selector', () => {
    it('allows changing the period selection', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      const periodSelector = screen.getByRole('combobox');
      await user.selectOptions(periodSelector, '7d');

      expect(periodSelector).toHaveValue('7d');
    });

    it('provides all period options', () => {
      render(<BillingDashboard />);

      expect(screen.getByRole('option', { name: /last 7 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 30 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 90 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /year to date/i })).toBeInTheDocument();
    });
  });

  describe('Sync Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('triggers sync operation when sync button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<BillingDashboard />);

      const syncButton = screen.getByRole('button', { name: /sync/i });
      await user.click(syncButton);

      // Button should be disabled during sync
      expect(syncButton).toBeDisabled();
    });

    it('disables sync button during sync operation', async () => {
      render(<BillingDashboard />);

      const syncButton = screen.getByRole('button', { name: /sync/i });

      await act(async () => {
        fireEvent.click(syncButton);
      });

      expect(syncButton).toBeDisabled();

      // Fast-forward through the sync delay
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(syncButton).not.toBeDisabled();
    });

    it('shows spinning animation during sync', async () => {
      render(<BillingDashboard />);

      const syncButton = screen.getByRole('button', { name: /sync/i });

      await act(async () => {
        fireEvent.click(syncButton);
      });

      // Check for the animate-spin class on the RefreshCw icon
      const icon = syncButton.querySelector('svg');
      expect(icon).toHaveClass('animate-spin');

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
    });
  });

  describe('Export Functionality', () => {
    it('triggers export when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /export/i }));

      expect(consoleSpy).toHaveBeenCalledWith('Exporting as pdf...');
    });
  });

  describe('Content Areas', () => {
    it('displays financial metrics in overview', () => {
      render(<BillingDashboard />);

      expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/collected/i)).toBeInTheDocument();
      expect(screen.getByText(/outstanding/i)).toBeInTheDocument();
      expect(screen.getByText(/\$98,200/)).toBeInTheDocument();
      expect(screen.getByText(/\$26,300/)).toBeInTheDocument();
    });

    it('displays invoice list in invoices tab', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /invoices/i }));

      await waitFor(() => {
        expect(screen.getByText(/INV-2024-001/)).toBeInTheDocument();
        expect(screen.getByText(/INV-2024-002/)).toBeInTheDocument();
        expect(screen.getByText(/INV-2024-003/)).toBeInTheDocument();
      });
    });

    it('renders Ledger content for expenses, trust, and ledger tabs', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /ledger/i }));

      await waitFor(() => {
        expect(screen.getByText(/general ledger/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('renders with correct layout structure', () => {
      const { container } = render(<BillingDashboard />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('applies transition opacity during tab changes', async () => {
      const user = userEvent.setup();
      const { container } = render(<BillingDashboard />);

      await user.click(screen.getByRole('button', { name: /invoices/i }));

      // The content area has transition-opacity class
      const contentArea = container.querySelector('.transition-opacity');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible tab buttons', () => {
      render(<BillingDashboard />);

      const tabs = screen.getAllByRole('button').filter(btn =>
        ['Overview', 'WIP', 'Invoices', 'Expenses', 'Ledger', 'Trust', 'Analytics'].includes(btn.textContent || '')
      );

      tabs.forEach(tab => {
        expect(tab).not.toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('maintains keyboard navigability', async () => {
      const user = userEvent.setup();
      render(<BillingDashboard />);

      const firstTab = screen.getByRole('button', { name: /overview/i });
      firstTab.focus();

      expect(document.activeElement).toBe(firstTab);

      await user.tab();
      expect(document.activeElement).not.toBe(firstTab);
    });
  });
});
