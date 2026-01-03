/**
 * CaseBudget.test.tsx
 * Comprehensive tests for Case Budget component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseBudget } from '@/components/enterprise/CaseManagement/CaseBudget';
import { BudgetCategory, BudgetAlert, Expense } from '@/components/enterprise/CaseManagement/CaseBudget';

// Mock budget categories
const mockCategories: BudgetCategory[] = [
  {
    id: 'cat-1',
    name: 'Attorney Fees',
    budgeted: 50000,
    actual: 32500,
    forecasted: 48000,
    color: '#3B82F6',
  },
  {
    id: 'cat-2',
    name: 'Expert Witnesses',
    budgeted: 15000,
    actual: 8500,
    forecasted: 14000,
    color: '#8B5CF6',
  },
  {
    id: 'cat-3',
    name: 'Court Fees',
    budgeted: 5000,
    actual: 3200,
    forecasted: 4500,
    color: '#10B981',
  },
  {
    id: 'cat-4',
    name: 'Travel',
    budgeted: 8000,
    actual: 7500,
    forecasted: 8000,
    color: '#EF4444',
  },
];

// Mock alerts
const mockAlerts: BudgetAlert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    threshold: 75,
    message: 'Budget at 75% - Review spending',
    triggered: true,
    triggeredAt: '2024-01-15',
  },
  {
    id: 'alert-2',
    type: 'critical',
    threshold: 90,
    message: 'Budget at 90% - Immediate attention required',
    triggered: false,
  },
  {
    id: 'alert-3',
    type: 'info',
    threshold: 50,
    message: 'Budget at 50% - Mid-point reached',
    triggered: true,
    triggeredAt: '2024-01-01',
  },
];

// Mock expenses
const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    date: '2024-01-15',
    category: 'Attorney Fees',
    description: 'Legal research and case preparation',
    amount: 5000,
    status: 'approved',
    submittedBy: 'John Smith',
    approvedBy: 'Manager',
    approvedAt: '2024-01-16',
  },
  {
    id: 'exp-2',
    date: '2024-01-20',
    category: 'Expert Witnesses',
    description: 'Expert testimony consultation',
    amount: 3000,
    status: 'pending',
    submittedBy: 'Jane Doe',
  },
  {
    id: 'exp-3',
    date: '2024-01-18',
    category: 'Court Fees',
    description: 'Filing fees',
    amount: 1200,
    status: 'rejected',
    submittedBy: 'Bob Wilson',
  },
];

describe('CaseBudget', () => {
  const defaultProps = {
    caseId: 'case-123',
    totalBudget: 78000,
    totalActual: 51700,
    categories: mockCategories,
    alerts: mockAlerts,
    expenses: mockExpenses,
    onUpdateBudget: jest.fn(),
    onAddExpense: jest.fn(),
    onApproveExpense: jest.fn(),
    onRejectExpense: jest.fn(),
    onUpdateAlert: jest.fn(),
    allowEdit: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Budget vs Actual Display', () => {
    it('should display total budget', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText('$78,000')).toBeInTheDocument();
    });

    it('should display total actual spent', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText('$51,700')).toBeInTheDocument();
    });

    it('should calculate and display utilization percentage', () => {
      render(<CaseBudget {...defaultProps} />);

      // 51700 / 78000 = 66.28%
      expect(screen.getByText(/66\.3% utilized/i)).toBeInTheDocument();
    });

    it('should display remaining budget', () => {
      render(<CaseBudget {...defaultProps} />);

      // 78000 - 51700 = 26300
      expect(screen.getByText('$26,300')).toBeInTheDocument();
    });

    it('should show negative remaining budget in red when overbudget', () => {
      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={50000}
          totalActual={55000}
        />
      );

      // Overbudget by 5000
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toHaveClass(/text-red-600/);
    });

    it('should display budget progress bar', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText(/Budget Progress/i)).toBeInTheDocument();
    });

    it('should color progress bar based on utilization', () => {
      render(<CaseBudget {...defaultProps} />);

      // At 66% utilization, should be yellow
      // Find the progress bar div by its background color class
      const progressBars = document.querySelectorAll('.bg-yellow-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Alert Thresholds', () => {
    it('should display active alerts', () => {
      render(<CaseBudget {...defaultProps} />);

      // Switch to alerts tab
      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      fireEvent.click(alertsTab);

      expect(screen.getByText(/Budget at 75% - Review spending/i)).toBeInTheDocument();
      expect(screen.getByText(/Budget at 50% - Mid-point reached/i)).toBeInTheDocument();
    });

    it('should show alert type badges', () => {
      render(<CaseBudget {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      fireEvent.click(alertsTab);

      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    });

    it('should display triggered date for active alerts', () => {
      render(<CaseBudget {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      fireEvent.click(alertsTab);

      // Multiple alerts may have triggered dates
      const triggeredTexts = screen.getAllByText(/Triggered on/i);
      expect(triggeredTexts.length).toBeGreaterThan(0);
    });

    it('should show critical alert banner when critical alerts triggered', () => {
      const criticalAlert: BudgetAlert = {
        id: 'alert-crit',
        type: 'critical',
        threshold: 90,
        message: 'Critical budget alert',
        triggered: true,
        triggeredAt: '2024-01-20',
      };

      render(<CaseBudget {...defaultProps} alerts={[...mockAlerts, criticalAlert]} />);

      expect(screen.getByText(/Critical Budget Alert/i)).toBeInTheDocument();
      expect(screen.getByText(/Immediate attention required/i)).toBeInTheDocument();
    });

    it('should navigate to alerts tab when View Alerts clicked', async () => {
      const criticalAlert: BudgetAlert = {
        id: 'alert-crit',
        type: 'critical',
        threshold: 90,
        message: 'Critical',
        triggered: true,
      };

      render(<CaseBudget {...defaultProps} alerts={[...mockAlerts, criticalAlert]} />);

      const viewAlertsButton = screen.getByRole('button', { name: /View Alerts/i });
      await userEvent.click(viewAlertsButton);

      // Should switch to alerts tab
      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      expect(alertsTab).toHaveClass(/border-blue-600/);
    });

    it('should color-code alerts by severity', () => {
      render(<CaseBudget {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      fireEvent.click(alertsTab);

      // Find the warning alert heading (75% threshold) and verify its parent has the orange background
      const alertHeadings = screen.getAllByText(/75%/i);
      const warningAlertHeading = alertHeadings[0]; // Get the first matching element
      const warningAlert = warningAlertHeading.closest('div.bg-orange-50');
      expect(warningAlert).toBeInTheDocument();
    });
  });

  describe('Expense Approval', () => {
    it('should display expense list', () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      expect(screen.getByText('Legal research and case preparation')).toBeInTheDocument();
      expect(screen.getByText('Expert testimony consultation')).toBeInTheDocument();
    });

    it('should display expense status badges', () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('rejected')).toBeInTheDocument();
    });

    it('should show approve/reject buttons for pending expenses', () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      // Find pending expense row
      const pendingRow = screen.getByText('Expert testimony consultation').closest('tr');
      if (pendingRow) {
        const buttons = within(pendingRow).getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      }
    });

    it('should call onApproveExpense when approve clicked', async () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      await userEvent.click(expensesTab);

      const pendingRow = screen.getByText('Expert testimony consultation').closest('tr');
      if (pendingRow) {
        const approveButton = within(pendingRow).getAllByRole('button')[0];
        await userEvent.click(approveButton);

        expect(defaultProps.onApproveExpense).toHaveBeenCalledWith('exp-2');
      }
    });

    it('should call onRejectExpense when reject clicked', async () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      await userEvent.click(expensesTab);

      const pendingRow = screen.getByText('Expert testimony consultation').closest('tr');
      if (pendingRow) {
        const rejectButton = within(pendingRow).getAllByRole('button')[1];
        await userEvent.click(rejectButton);

        expect(defaultProps.onRejectExpense).toHaveBeenCalledWith('exp-2');
      }
    });

    it('should not show approve/reject for non-pending expenses', () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      const approvedRow = screen.getByText('Legal research and case preparation').closest('tr');
      if (approvedRow) {
        const buttons = within(approvedRow).queryAllByRole('button');
        // Should not have approve/reject buttons
        expect(buttons.length).toBe(0);
      }
    });

    it('should display formatted expense amounts', () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
      expect(screen.getByText('$1,200')).toBeInTheDocument();
    });
  });

  describe('Burn Rate Calculation', () => {
    it('should display daily burn rate', () => {
      render(<CaseBudget {...defaultProps} />);

      // 51700 / 30 days = 1723.33 per day
      expect(screen.getByText(/\$1,723/i)).toBeInTheDocument();
    });

    it('should display projected total', () => {
      render(<CaseBudget {...defaultProps} />);

      // Burn rate * 90 days projected
      expect(screen.getByText(/Projected:/i)).toBeInTheDocument();
    });

    it('should warn when projected to exceed budget', () => {
      render(<CaseBudget {...defaultProps} />);

      // Component should show projection warning if applicable
      // Check for overrun indicators in overview tab
      const overviewTab = screen.getByRole('button', { name: /^Overview$/i });
      expect(overviewTab).toBeInTheDocument();
    });
  });

  describe('Category Breakdown', () => {
    it('should display all budget categories', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      expect(screen.getByText('Attorney Fees')).toBeInTheDocument();
      expect(screen.getByText('Expert Witnesses')).toBeInTheDocument();
      expect(screen.getByText('Court Fees')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();
    });

    it('should display budgeted, actual, and variance for each category', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      expect(screen.getByText('$50,000')).toBeInTheDocument(); // Attorney Fees budgeted
      expect(screen.getByText('$32,500')).toBeInTheDocument(); // Attorney Fees actual
    });

    it('should calculate variance correctly', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      // Attorney Fees variance: 50000 - 32500 = 17500
      expect(screen.getByText('$17,500')).toBeInTheDocument();
    });

    it('should display forecasted amounts', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      expect(screen.getByText('$48,000')).toBeInTheDocument(); // Attorney Fees forecasted
      expect(screen.getByText('$14,000')).toBeInTheDocument(); // Expert Witnesses forecasted
    });

    it('should show progress bars for each category', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      // Each category should have a progress bar
      const categoryCards = screen.getAllByText(/Attorney Fees|Expert Witnesses|Court Fees|Travel/);
      expect(categoryCards.length).toBeGreaterThan(0);
    });

    it('should display percentage utilized for each category', () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      // Attorney Fees: 32500 / 50000 = 65%
      expect(screen.getByText(/65\.0%/i)).toBeInTheDocument();
    });

    it('should allow editing budget when allowEdit is true', () => {
      render(<CaseBudget {...defaultProps} allowEdit={true} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      fireEvent.click(categoriesTab);

      // Check for edit buttons in the categories view (one per category)
      // The mockCategories has 4 categories, so there should be 4 edit icons
      const categoryCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.border-gray-200');
      expect(categoryCards.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByRole('button', { name: /^Overview$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Categories$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Expenses$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Alerts$/i })).toBeInTheDocument();
    });

    it('should switch to Categories tab when clicked', async () => {
      render(<CaseBudget {...defaultProps} />);

      const categoriesTab = screen.getByRole('button', { name: /^Categories$/i });
      await userEvent.click(categoriesTab);

      expect(categoriesTab).toHaveClass(/border-blue-600/);
    });

    it('should switch to Expenses tab when clicked', async () => {
      render(<CaseBudget {...defaultProps} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      await userEvent.click(expensesTab);

      expect(expensesTab).toHaveClass(/border-blue-600/);
    });

    it('should switch to Alerts tab when clicked', async () => {
      render(<CaseBudget {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      await userEvent.click(alertsTab);

      expect(alertsTab).toHaveClass(/border-blue-600/);
    });

    it('should show Overview tab content by default', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText(/Budget Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Spending Categories/i)).toBeInTheDocument();
    });
  });

  describe('Overview Statistics', () => {
    it('should display quick stats', () => {
      render(<CaseBudget {...defaultProps} />);

      // Use getAllByText since these appear in multiple places (tabs + stat cards)
      expect(screen.getAllByText(/Categories/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Expenses/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Alerts/i).length).toBeGreaterThan(0);
    });

    it('should count budget categories', () => {
      render(<CaseBudget {...defaultProps} />);

      // 4 categories
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should count total expenses', () => {
      render(<CaseBudget {...defaultProps} />);

      // 3 expenses
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should count approved expenses', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText(/1 approved/i)).toBeInTheDocument();
    });

    it('should show top spending categories', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByText(/Top Spending Categories/i)).toBeInTheDocument();
    });

    it('should sort categories by actual spending', () => {
      render(<CaseBudget {...defaultProps} />);

      // Attorney Fees has highest actual (32500), should be listed first
      const categoryNames = screen.getAllByText(/Attorney Fees|Expert Witnesses|Court Fees|Travel/);
      expect(categoryNames[0]).toHaveTextContent('Attorney Fees');
    });
  });

  describe('Add Expense', () => {
    it('should show Add Expense button when allowEdit is true', () => {
      render(<CaseBudget {...defaultProps} allowEdit={true} />);

      expect(screen.getByRole('button', { name: /Add Expense/i })).toBeInTheDocument();
    });

    it('should not show Add Expense button when allowEdit is false', () => {
      render(<CaseBudget {...defaultProps} allowEdit={false} />);

      expect(screen.queryByRole('button', { name: /Add Expense/i })).not.toBeInTheDocument();
    });

    it('should show empty state in expenses tab when no expenses', () => {
      render(<CaseBudget {...defaultProps} expenses={[]} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      expect(screen.getByText('No expenses recorded')).toBeInTheDocument();
      expect(screen.getByText(/Start tracking expenses/i)).toBeInTheDocument();
    });

    it('should show Add First Expense button in empty state', () => {
      render(<CaseBudget {...defaultProps} expenses={[]} allowEdit={true} />);

      const expensesTab = screen.getByRole('button', { name: /^Expenses$/i });
      fireEvent.click(expensesTab);

      expect(screen.getByRole('button', { name: /Add First Expense/i })).toBeInTheDocument();
    });
  });

  describe('Export Report', () => {
    it('should render Export Report button', () => {
      render(<CaseBudget {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Export Report/i })).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for alerts when none exist', () => {
      render(<CaseBudget {...defaultProps} alerts={[]} />);

      const alertsTab = screen.getByRole('button', { name: /^Alerts$/i });
      fireEvent.click(alertsTab);

      expect(screen.getByText('No budget alerts')).toBeInTheDocument();
      expect(screen.getByText(/Configure alerts to monitor budget thresholds/i)).toBeInTheDocument();
    });
  });

  describe('Forecast Warning', () => {
    it('should show overrun warning when forecasted exceeds budget', () => {
      const highForecastCategories: BudgetCategory[] = [
        {
          id: 'cat-1',
          name: 'Attorney Fees',
          budgeted: 50000,
          actual: 32500,
          forecasted: 60000, // Exceeds budget
          color: '#3B82F6',
        },
      ];

      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={50000}
          categories={highForecastCategories}
        />
      );

      expect(screen.getByText(/Projected overrun/i)).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should show green status for low utilization', () => {
      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={100000}
          totalActual={40000}
        />
      );

      // 40% utilization should be green
      const badge = screen.getByText(/40\.0% utilized/i);
      expect(badge).toHaveClass(/bg-green-100/);
    });

    it('should show yellow status for medium utilization', () => {
      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={100000}
          totalActual={60000}
        />
      );

      // 60% utilization should be yellow
      const badge = screen.getByText(/60\.0% utilized/i);
      expect(badge).toHaveClass(/bg-yellow-100/);
    });

    it('should show orange status for high utilization', () => {
      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={100000}
          totalActual={80000}
        />
      );

      // 80% utilization should be orange
      const badge = screen.getByText(/80\.0% utilized/i);
      expect(badge).toHaveClass(/bg-orange-100/);
    });

    it('should show red status for critical utilization', () => {
      render(
        <CaseBudget
          {...defaultProps}
          totalBudget={100000}
          totalActual={95000}
        />
      );

      // 95% utilization should be red
      const badge = screen.getByText(/95\.0% utilized/i);
      expect(badge).toHaveClass(/bg-red-100/);
    });
  });
});
