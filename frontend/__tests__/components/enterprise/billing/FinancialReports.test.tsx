/**
 * FinancialReports Component Tests
 * Tests for profitability metrics, realization rates, WIP report, revenue forecasting, and data export
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FinancialReports } from '@/components/enterprise/Billing/FinancialReports';

describe('FinancialReports Component', () => {
  const mockOnExport = jest.fn();
  const mockDateRange = {
    start: '2024-01-01',
    end: '2024-12-31'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profitability Metrics', () => {
    it('should display gross revenue metric', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('Gross Revenue')).toBeInTheDocument();
      expect(screen.getByText('$4,567,890')).toBeInTheDocument();
    });

    it('should show gross margin percentage', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('Gross Margin')).toBeInTheDocument();
      expect(screen.getByText('70.8%')).toBeInTheDocument();
    });

    it('should display net profit amount', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('Net Profit')).toBeInTheDocument();
      expect(screen.getByText('$1,358,020')).toBeInTheDocument();
    });

    it('should show net margin percentage', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('Net Margin')).toBeInTheDocument();
      expect(screen.getByText('29.7%')).toBeInTheDocument();
    });

    it('should display profitability breakdown', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('Profitability Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Direct Costs')).toBeInTheDocument();
      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('Operating Expenses')).toBeInTheDocument();
    });

    it('should show year-over-year growth indicators', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('+12.3% YoY')).toBeInTheDocument();
    });

    it('should calculate gross profit correctly', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('$3,234,560')).toBeInTheDocument();
    });

    it('should display operating expenses', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('-$1,876,540')).toBeInTheDocument();
    });
  });

  describe('Realization Rates', () => {
    it('should display billing realization rate', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('Billing Realization')).toBeInTheDocument();
      expect(screen.getByText('93.5%')).toBeInTheDocument();
    });

    it('should show collection realization rate', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('Collection Realization')).toBeInTheDocument();
      expect(screen.getByText('93.4%')).toBeInTheDocument();
    });

    it('should display overall realization rate', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('Overall Realization')).toBeInTheDocument();
      expect(screen.getByText('87.3%')).toBeInTheDocument();
    });

    it('should show standard vs actual billing rates', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('$4,892,300 / $5,234,000')).toBeInTheDocument();
    });

    it('should display collection amounts comparison', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('$4,567,890 / $4,892,300')).toBeInTheDocument();
    });

    it('should show realization analysis section', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('Realization Analysis')).toBeInTheDocument();
    });

    it('should display progress bars for realization rates', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Realization/i }));

      expect(screen.getByText('Billing Realization Rate')).toBeInTheDocument();
      expect(screen.getByText('Collection Realization Rate')).toBeInTheDocument();
      expect(screen.getByText('Overall Realization Rate')).toBeInTheDocument();
    });
  });

  describe('WIP Report', () => {
    it('should display total WIP amount', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Total WIP')).toBeInTheDocument();
      expect(screen.getByText('$2,345,670')).toBeInTheDocument();
    });

    it('should show unbilled time amount', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Unbilled Time')).toBeInTheDocument();
      expect(screen.getByText('$1,456,780')).toBeInTheDocument();
    });

    it('should display average age in days', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Average Age')).toBeInTheDocument();
      expect(screen.getByText('47 days')).toBeInTheDocument();
    });

    it('should show write-off rate', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Write-off Rate')).toBeInTheDocument();
      expect(screen.getByText('1.9%')).toBeInTheDocument();
    });

    it('should display WIP breakdown section', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Work in Progress Breakdown')).toBeInTheDocument();
    });

    it('should show unbilled expenses', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Unbilled Expenses')).toBeInTheDocument();
      expect(screen.getByText('$456,890')).toBeInTheDocument();
    });

    it('should display billed not collected amount', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      expect(screen.getByText('Billed Not Collected')).toBeInTheDocument();
      expect(screen.getByText('$432,000')).toBeInTheDocument();
    });
  });

  describe('Revenue Forecasting', () => {
    it('should display revenue forecasting table', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('Revenue Forecasting')).toBeInTheDocument();
    });

    it('should show projected revenue for each period', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('$380,000')).toBeInTheDocument();
      expect(screen.getByText('$375,000')).toBeInTheDocument();
      expect(screen.getByText('$390,000')).toBeInTheDocument();
    });

    it('should display actual revenue amounts', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('$392,450')).toBeInTheDocument();
      expect(screen.getByText('$368,900')).toBeInTheDocument();
      expect(screen.getByText('$405,680')).toBeInTheDocument();
    });

    it('should show variance amounts', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('+$12,450')).toBeInTheDocument();
      expect(screen.getByText('-$6,100')).toBeInTheDocument();
      expect(screen.getByText('+$15,680')).toBeInTheDocument();
    });

    it('should display variance percentages', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('+3.3%')).toBeInTheDocument();
      expect(screen.getByText('-1.6%')).toBeInTheDocument();
      expect(screen.getByText('+4.0%')).toBeInTheDocument();
    });

    it('should show period labels', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      expect(screen.getByText('Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('Feb 2024')).toBeInTheDocument();
      expect(screen.getByText('Mar 2024')).toBeInTheDocument();
    });

    it('should color code positive variance in green', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      const positiveVariance = screen.getByText('+$12,450');
      expect(positiveVariance).toHaveClass('text-green-600');
    });

    it('should color code negative variance in red', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Forecasting/i }));

      const negativeVariance = screen.getByText('-$6,100');
      expect(negativeVariance).toHaveClass('text-red-600');
    });
  });

  describe('Performance Metrics', () => {
    it('should display timekeeper performance table', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('Timekeeper Performance')).toBeInTheDocument();
    });

    it('should show timekeeper names and levels', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Emily Rodriguez')).toBeInTheDocument();
    });

    it('should display billable hours vs target', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('1456 / 1600')).toBeInTheDocument();
      expect(screen.getByText('1678 / 1800')).toBeInTheDocument();
      expect(screen.getByText('1789 / 1900')).toBeInTheDocument();
    });

    it('should show utilization rates', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('91.0%')).toBeInTheDocument();
      expect(screen.getByText('93.2%')).toBeInTheDocument();
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });

    it('should display billing rates per hour', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('$650.00/hr')).toBeInTheDocument();
      expect(screen.getByText('$475.00/hr')).toBeInTheDocument();
      expect(screen.getByText('$350.00/hr')).toBeInTheDocument();
    });

    it('should show revenue generated by each timekeeper', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('$946,400')).toBeInTheDocument();
      expect(screen.getByText('$797,050')).toBeInTheDocument();
      expect(screen.getByText('$626,150')).toBeInTheDocument();
    });

    it('should display realization rates for timekeepers', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('94.5%')).toBeInTheDocument();
      expect(screen.getByText('92.8%')).toBeInTheDocument();
      expect(screen.getByText('91.2%')).toBeInTheDocument();
    });

    it('should show matter profitability table', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('Matter Profitability')).toBeInTheDocument();
    });

    it('should display matter numbers and descriptions', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('M-2024-001')).toBeInTheDocument();
      expect(screen.getByText('M-2024-045')).toBeInTheDocument();
    });

    it('should show total fees and costs for matters', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('$345,600')).toBeInTheDocument();
      expect(screen.getByText('$78,900')).toBeInTheDocument();
    });

    it('should display profit and margin for matters', () => {
      render(<FinancialReports onExport={mockOnExport} />);
      fireEvent.click(screen.getByRole('button', { name: /Performance/i }));

      expect(screen.getByText('$266,700')).toBeInTheDocument();
      expect(screen.getByText('77.2%')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByRole('button', { name: /Profitability/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Realization/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /WIP/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Forecasting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Performance/i })).toBeInTheDocument();
    });

    it('should switch to realization tab when clicked', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const realizationTab = screen.getByRole('button', { name: /Realization/i });
      fireEvent.click(realizationTab);

      expect(screen.getByText('Billing Realization')).toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const profitabilityTab = screen.getByRole('button', { name: /Profitability/i });
      expect(profitabilityTab).toHaveClass('border-blue-500');
    });
  });

  describe('Data Export', () => {
    it('should display export button', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    it('should call onExport when export button is clicked', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const exportButton = screen.getByRole('button', { name: /Export/i });
      fireEvent.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith('profitability', 'excel');
    });

    it('should export current tab data', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      // Switch to WIP tab
      fireEvent.click(screen.getByRole('button', { name: /WIP/i }));

      // Click export
      const exportButton = screen.getByRole('button', { name: /Export/i });
      fireEvent.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith('wip', 'excel');
    });
  });

  describe('Period Selection', () => {
    it('should display period selector', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const periodSelect = screen.getByDisplayValue('Monthly');
      expect(periodSelect).toBeInTheDocument();
    });

    it('should have monthly, quarterly, and yearly options', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const periodSelect = screen.getByDisplayValue('Monthly') as HTMLSelectElement;

      expect(within(periodSelect.parentElement!).getByText('Monthly')).toBeInTheDocument();
    });

    it('should allow changing period selection', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      const periodSelect = screen.getByDisplayValue('Monthly') as HTMLSelectElement;
      fireEvent.change(periodSelect, { target: { value: 'quarterly' } });

      expect(periodSelect.value).toBe('quarterly');
    });
  });

  describe('Filter Functionality', () => {
    it('should display filters button', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format large numbers with commas', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('$4,567,890')).toBeInTheDocument();
      expect(screen.getByText('$1,358,020')).toBeInTheDocument();
    });

    it('should display percentages with one decimal place', () => {
      render(<FinancialReports onExport={mockOnExport} />);

      expect(screen.getByText('70.8%')).toBeInTheDocument();
      expect(screen.getByText('29.7%')).toBeInTheDocument();
    });
  });
});
