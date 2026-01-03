/**
 * EnterpriseBilling Component Tests
 * Tests for AR aging display, collection priority sorting, write-off management, tab navigation, and metric calculations
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnterpriseBilling } from '@/components/enterprise/Billing/EnterpriseBilling';

describe('EnterpriseBilling Component', () => {
  const mockOnExportData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Metric Calculations', () => {
    it('should display total outstanding amount correctly', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$1,248,750')).toBeInTheDocument();
    });

    it('should display collection rate with correct formatting', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('94.5%')).toBeInTheDocument();
    });

    it('should display overdue amount and count', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$234,500')).toBeInTheDocument();
      expect(screen.getByText('18 invoices')).toBeInTheDocument();
    });

    it('should display average days to payment', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('32')).toBeInTheDocument();
    });

    it('should calculate and display total receivables', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$3,567,890.5')).toBeInTheDocument();
    });

    it('should display write-offs for current month', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$12,500')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should render all navigation tabs', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Aging/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Collections/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Write-offs/i })).toBeInTheDocument();
    });

    it('should switch to aging tab when clicked', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      const agingTab = screen.getByRole('button', { name: /Aging/i });
      fireEvent.click(agingTab);
      expect(screen.getByText('AR Aging Analysis')).toBeInTheDocument();
    });

    it('should switch to collections tab when clicked', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      const collectionsTab = screen.getByRole('button', { name: /Collections/i });
      fireEvent.click(collectionsTab);
      expect(screen.getByText('Collection Tracking')).toBeInTheDocument();
    });

    it('should switch to write-offs tab when clicked', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      const writeoffsTab = screen.getByRole('button', { name: /Write-offs/i });
      fireEvent.click(writeoffsTab);
      expect(screen.getByText('Write-off Management')).toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      const agingTab = screen.getByRole('button', { name: /Aging/i });
      fireEvent.click(agingTab);
      expect(agingTab).toHaveClass('border-blue-500');
    });
  });

  describe('AR Aging Display', () => {
    it('should display all aging buckets', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Aging/i }));

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('31-60 Days')).toBeInTheDocument();
      expect(screen.getByText('61-90 Days')).toBeInTheDocument();
      expect(screen.getByText('91-120 Days')).toBeInTheDocument();
      expect(screen.getByText('120+ Days')).toBeInTheDocument();
    });

    it('should display aging bucket amounts correctly', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Aging/i }));

      expect(screen.getByText('$567,890')).toBeInTheDocument();
      expect(screen.getByText('$345,670')).toBeInTheDocument();
      expect(screen.getByText('$178,900')).toBeInTheDocument();
    });

    it('should display percentage of total for each bucket', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Aging/i }));

      expect(screen.getByText('45.5% of total')).toBeInTheDocument();
      expect(screen.getByText('27.7% of total')).toBeInTheDocument();
      expect(screen.getByText('14.3% of total')).toBeInTheDocument();
    });

    it('should display invoice count for each bucket', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Aging/i }));

      expect(screen.getByText('45 invoices')).toBeInTheDocument();
      expect(screen.getByText('28 invoices')).toBeInTheDocument();
      expect(screen.getByText('15 invoices')).toBeInTheDocument();
    });
  });

  describe('Collection Priority Sorting', () => {
    it('should display collection items with priority badges', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      const highPriorityBadges = screen.getAllByText('HIGH');
      expect(highPriorityBadges.length).toBeGreaterThan(0);
    });

    it('should show days overdue for collection items', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      expect(screen.getByText('95 days')).toBeInTheDocument();
      expect(screen.getByText('67 days')).toBeInTheDocument();
      expect(screen.getByText('125 days')).toBeInTheDocument();
    });

    it('should display client names for collection items', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('TechStart LLC')).toBeInTheDocument();
      expect(screen.getByText('GlobalTrade Inc')).toBeInTheDocument();
    });

    it('should show assigned staff for collection items', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      expect(screen.getAllByText('Sarah Johnson').length).toBeGreaterThan(0);
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    });

    it('should display collection amounts with proper formatting', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      expect(screen.getByText('$45,600')).toBeInTheDocument();
      expect(screen.getByText('$28,900')).toBeInTheDocument();
      expect(screen.getByText('$67,800')).toBeInTheDocument();
    });

    it('should show status badges for collection items', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Collections/i }));

      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('CONTACTED')).toBeInTheDocument();
      expect(screen.getByText('PAYMENT PLAN')).toBeInTheDocument();
    });
  });

  describe('Write-off Management', () => {
    it('should display write-off requests table', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('Write-off Management')).toBeInTheDocument();
    });

    it('should show original and write-off amounts', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('$15,600')).toBeInTheDocument();
      expect(screen.getByText('$4,500')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
    });

    it('should display write-off reasons', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText(/Client bankruptcy - Chapter 7/i)).toBeInTheDocument();
      expect(screen.getByText(/Settlement - partial payment accepted/i)).toBeInTheDocument();
    });

    it('should show requested by information', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getAllByText('Sarah Johnson').length).toBeGreaterThan(0);
    });

    it('should display status badges for write-off requests', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });

    it('should show approve/reject buttons for pending write-offs', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('should show view button for completed write-offs', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      fireEvent.click(screen.getByRole('button', { name: /Write-offs/i }));

      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should call onExportData when export button is clicked', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      const exportButton = screen.getByRole('button', { name: /Export/i });
      fireEvent.click(exportButton);

      expect(mockOnExportData).toHaveBeenCalledWith('excel');
    });

    it('should render export button with correct text', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('should display quick stats for current month', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);

      expect(screen.getByText('This Month Summary')).toBeInTheDocument();
      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('$892,450')).toBeInTheDocument();
    });

    it('should show quick action buttons', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);

      expect(screen.getByText('Generate AR Report')).toBeInTheDocument();
      expect(screen.getByText('Send Collection Reminders')).toBeInTheDocument();
      expect(screen.getByText('Review Write-off Requests')).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format large numbers with commas', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$1,248,750')).toBeInTheDocument();
    });

    it('should display decimal values correctly', () => {
      render(<EnterpriseBilling onExportData={mockOnExportData} />);
      expect(screen.getByText('$3,567,890.5')).toBeInTheDocument();
    });
  });
});
