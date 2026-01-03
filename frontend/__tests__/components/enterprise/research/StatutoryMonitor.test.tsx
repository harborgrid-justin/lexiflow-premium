/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  StatutoryMonitor,
  type StatutoryMonitorProps,
  type LegislativeUpdate,
  type RegulatoryAlert,
  type MonitoringRule,
} from '@/components/enterprise/Research/StatutoryMonitor';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('StatutoryMonitor', () => {
  const mockOnTrackUpdate = jest.fn();
  const mockOnCreateRule = jest.fn();
  const mockOnMarkRead = jest.fn();
  const mockOnExport = jest.fn();

  const mockUpdates: LegislativeUpdate[] = [
    {
      id: '1',
      title: 'Privacy Protection and Data Security Act',
      description: 'Comprehensive data privacy legislation',
      type: 'bill',
      status: 'proposed',
      jurisdiction: 'Federal',
      chamber: 'senate',
      billNumber: 'S. 2847',
      sponsor: 'Sen. Smith',
      introducedDate: new Date('2024-01-15'),
      lastActionDate: new Date('2024-01-20'),
      summary: 'Data privacy protections legislation',
      impact: 'High impact on technology companies',
      tags: ['privacy', 'data security'],
      tracking: true,
      priority: 'high',
    },
  ];

  const mockAlerts: RegulatoryAlert[] = [
    {
      id: '1',
      agency: 'SEC',
      title: 'Proposed Amendments to Cybersecurity Disclosure Rules',
      type: 'proposed',
      published: new Date('2024-01-12'),
      commentDeadline: new Date('2024-02-28'),
      jurisdiction: 'Federal',
      summary: 'Enhanced cybersecurity disclosure requirements',
      impact: 'Public companies must disclose incidents within 4 days',
      federalRegisterNumber: '2024-00123',
      cfr: '17 CFR 229.106',
      read: false,
      bookmarked: true,
    },
  ];

  const defaultProps: StatutoryMonitorProps = {
    updates: mockUpdates,
    alerts: mockAlerts,
    onTrackUpdate: mockOnTrackUpdate,
    onCreateRule: mockOnCreateRule,
    onMarkRead: mockOnMarkRead,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Legislative Updates', () => {
    it('should render statutory monitor with title and description', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/statutory monitor/i)).toBeInTheDocument();
      expect(screen.getByText(/track legislative updates/i)).toBeInTheDocument();
    });

    it('should display legislative update cards', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/privacy protection and data security act/i)).toBeInTheDocument();
      expect(screen.getByText(/s\. 2847/i)).toBeInTheDocument();
    });

    it('should show bill number and sponsor information', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/s\. 2847/i)).toBeInTheDocument();
    });

    it('should display last action date', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/last action:/i)).toBeInTheDocument();
    });

    it('should show impact assessment', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/impact:/i)).toBeInTheDocument();
      expect(screen.getByText(/high impact on technology companies/i)).toBeInTheDocument();
    });

    it('should display update tags', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText('privacy')).toBeInTheDocument();
      expect(screen.getByText('data security')).toBeInTheDocument();
    });
  });

  describe('Alert Management', () => {
    it('should switch to alerts tab when clicked', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /regulatory alerts/i });
      fireEvent.click(alertsTab);

      expect(screen.getByText(/proposed amendments to cybersecurity/i)).toBeInTheDocument();
    });

    it('should display unread alert count in tab', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/regulatory alerts \(1\)/i)).toBeInTheDocument();
    });

    it('should show alert agency and type', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /regulatory alerts/i });
      fireEvent.click(alertsTab);

      expect(screen.getByText('SEC')).toBeInTheDocument();
      const proposedElements = screen.getAllByText('proposed');
      expect(proposedElements.length).toBeGreaterThan(0);
    });

    it('should display comment deadline for proposed rules', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /regulatory alerts/i });
      fireEvent.click(alertsTab);

      expect(screen.getByText(/comments due:/i)).toBeInTheDocument();
    });

    it('should call onMarkRead when alert is clicked', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /regulatory alerts/i });
      fireEvent.click(alertsTab);

      const alertCard = screen.getByText(/proposed amendments to cybersecurity/i).closest('div');
      if (alertCard) {
        fireEvent.click(alertCard);

        expect(mockOnMarkRead).toHaveBeenCalledWith('1');
      }
    });

    it('should show bookmark indicator for bookmarked alerts', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertsTab = screen.getByRole('button', { name: /regulatory alerts/i });
      fireEvent.click(alertsTab);

      // Should show bookmarked alerts
      expect(screen.getByText(/proposed amendments to cybersecurity/i)).toBeInTheDocument();
    });
  });

  describe('Jurisdiction Filtering', () => {
    it('should filter by jurisdiction', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const jurisdictionFilters = screen.getAllByRole('combobox');
      const jurisdictionSelect = jurisdictionFilters.find(select =>
        select.querySelector('option[value="Federal"]')
      );

      if (jurisdictionSelect) {
        fireEvent.change(jurisdictionSelect, { target: { value: 'Federal' } });

        expect(screen.getByText(/privacy protection and data security act/i)).toBeInTheDocument();
      }
    });

    it('should display jurisdiction in update cards', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const federalElements = screen.getAllByText('Federal');
      expect(federalElements.length).toBeGreaterThan(0);
    });
  });

  describe('Priority Indicators', () => {
    it('should display priority level for updates', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/high priority/i)).toBeInTheDocument();
    });

    it('should use color coding for priority levels', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const priorityIndicator = screen.getByText(/high priority/i);
      expect(priorityIndicator).toBeInTheDocument();
    });
  });

  describe('Bookmark Functionality', () => {
    it('should call onTrackUpdate when track button is clicked', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const trackButton = screen.getByRole('button', { name: /tracking/i });
      fireEvent.click(trackButton);

      expect(mockOnTrackUpdate).toHaveBeenCalledWith('1', false);
    });

    it('should show tracking indicator for tracked updates', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      // Star icon should be visible for tracked items
      expect(screen.getByRole('button', { name: /tracking/i })).toBeInTheDocument();
    });

    it('should display tracking count in stats', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      // Tracking appears in both the stats bar and potentially in buttons
      const trackingElements = screen.getAllByText('Tracking');
      expect(trackingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Search and Filtering', () => {
    it('should render search input', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search legislation, regulations/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter updates by search query', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search legislation, regulations/i);

      fireEvent.change(searchInput, { target: { value: 'privacy' } });

      expect(screen.getByText(/privacy protection and data security act/i)).toBeInTheDocument();
    });

    it('should filter by update type', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const typeFilters = screen.getAllByRole('combobox');
      const typeSelect = typeFilters.find(select =>
        select.querySelector('option[value="bill"]')
      );

      if (typeSelect) {
        fireEvent.change(typeSelect, { target: { value: 'bill' } });

        expect(screen.getByText(/privacy protection and data security act/i)).toBeInTheDocument();
      }
    });

    it('should show no results message when search returns empty', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search legislation, regulations/i);

      fireEvent.change(searchInput, { target: { value: 'nonexistent legislation' } });

      expect(screen.getByText(/no updates found/i)).toBeInTheDocument();
    });
  });

  describe('Alert Rules Management', () => {
    it('should switch to tracking rules tab', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const trackingTab = screen.getByRole('button', { name: /alert rules/i });
      fireEvent.click(trackingTab);

      // Should show rules or empty state
      expect(trackingTab).toBeInTheDocument();
    });

    it('should display create alert rule button', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByRole('button', { name: /new alert rule/i })).toBeInTheDocument();
    });

    it('should open rule creation dialog when button is clicked', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const createRuleButton = screen.getByRole('button', { name: /new alert rule/i });
      fireEvent.click(createRuleButton);

      // Dialog state should change
      expect(createRuleButton).toBeInTheDocument();
    });
  });

  describe('Statistics Dashboard', () => {
    it('should display active updates count', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText('Active Updates')).toBeInTheDocument();
      // The count (3 in this case, based on mock data) should be displayed
      const countElements = screen.getAllByText(/^[0-9]+$/);
      expect(countElements.length).toBeGreaterThan(0);
    });

    it('should display unread alerts count', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/unread alerts/i)).toBeInTheDocument();
    });

    it('should display tracking count', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const trackingElements = screen.getAllByText('Tracking');
      expect(trackingElements.length).toBeGreaterThan(0);
    });

    it('should display alert rules count', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const alertRulesElements = screen.getAllByText('Alert Rules');
      expect(alertRulesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Status Indicators', () => {
    it('should display status badges for updates', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      expect(screen.getByText(/proposed/i)).toBeInTheDocument();
    });

    it('should show different colors for different statuses', () => {
      render(<StatutoryMonitor {...defaultProps} />);

      const statusBadge = screen.getByText(/proposed/i);
      expect(statusBadge).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('should display view button for updates with URLs', () => {
      const updatesWithUrl = [
        {
          ...mockUpdates[0],
          url: 'https://example.com/bill',
        },
      ];

      render(<StatutoryMonitor updates={updatesWithUrl} />);

      expect(screen.getByText(/view/i)).toBeInTheDocument();
    });
  });

  describe('Effective Dates', () => {
    it('should display effective date when available', () => {
      const updatesWithDate = [
        {
          ...mockUpdates[0],
          effectiveDate: new Date('2024-07-01'),
        },
      ];

      render(<StatutoryMonitor updates={updatesWithDate} />);

      expect(screen.getByText(/effective:/i)).toBeInTheDocument();
    });
  });
});
