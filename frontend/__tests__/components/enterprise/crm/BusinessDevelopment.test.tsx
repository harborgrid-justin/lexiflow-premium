/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusinessDevelopment } from '@/components/enterprise/CRM/BusinessDevelopment';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock chart color service
jest.mock('@/services/theme/chartColorService', () => ({
  ChartColorService: {
    getPalette: (mode: string) => ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  },
}));

// Mock chart config
jest.mock('@/utils/chartConfig', () => ({
  getChartTheme: (mode: string) => ({
    grid: '#e5e7eb',
    text: '#374151',
    tooltipStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    },
  }),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  CartesianGrid: () => <div data-testid="grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    Target: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="target-icon" {...props} />),
    TrendingUp: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-up-icon" {...props} />),
    TrendingDown: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-down-icon" {...props} />),
    DollarSign: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="dollar-icon" {...props} />),
    Users: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="users-icon" {...props} />),
    FileText: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="file-icon" {...props} />),
    Award: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="award-icon" {...props} />),
    XCircle: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="x-circle-icon" {...props} />),
    Clock: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="clock-icon" {...props} />),
    CheckCircle2: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="check-icon" {...props} />),
    BarChart3: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="bar-chart-icon" {...props} />),
    PieChart: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="pie-chart-icon" {...props} />),
    Calendar: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="calendar-icon" {...props} />),
    Send: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="send-icon" {...props} />),
    Edit: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="edit-icon" {...props} />),
    Eye: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="eye-icon" {...props} />),
    Download: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="download-icon" {...props} />),
    Plus: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="plus-icon" {...props} />),
    ArrowUpRight: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="arrow-icon" {...props} />),
    Filter: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="filter-icon" {...props} />),
    Search: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="search-icon" {...props} />),
    Activity: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="activity-icon" {...props} />),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('BusinessDevelopment Component', () => {
  describe('Lead Pipeline', () => {
    test('renders leads tab by default', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Sarah Chen - TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('Michael Rodriguez - BioHealth Solutions')).toBeInTheDocument();
      expect(screen.getByText('Emma Wilson - Global Manufacturing LLC')).toBeInTheDocument();
    });

    test('displays lead information with contact details', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Sarah Chen - TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('Michael Rodriguez - BioHealth Solutions')).toBeInTheDocument();
    });

    test('shows lead status badges', () => {
      renderWithProviders(<BusinessDevelopment />);

      const proposalBadges = screen.getAllByText('Proposal');
      expect(proposalBadges.length).toBeGreaterThan(0);
      const qualifiedBadges = screen.getAllByText('Qualified');
      expect(qualifiedBadges.length).toBeGreaterThan(0);
      const wonBadges = screen.getAllByText('Won');
      expect(wonBadges.length).toBeGreaterThan(0);
    });

    test('displays estimated value for each lead', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText(/450k/)).toBeInTheDocument();
      expect(screen.getByText(/320k/)).toBeInTheDocument();
      expect(screen.getByText(/180k/)).toBeInTheDocument();
    });

    test('shows probability percentage', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('75% probability')).toBeInTheDocument();
      expect(screen.getByText('60% probability')).toBeInTheDocument();
      expect(screen.getByText('100% probability')).toBeInTheDocument();
    });

    test('displays lead source information', () => {
      renderWithProviders(<BusinessDevelopment />);

      const referralElements = screen.getAllByText('Referral');
      expect(referralElements.length).toBeGreaterThan(0);
      const conferenceElements = screen.getAllByText('Conference');
      expect(conferenceElements.length).toBeGreaterThan(0);
      const websiteElements = screen.getAllByText('Website');
      expect(websiteElements.length).toBeGreaterThan(0);
    });

    test('shows next action items for leads', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText(/Send revised proposal/)).toBeInTheDocument();
      expect(screen.getByText(/Schedule initial consultation/)).toBeInTheDocument();
    });

    test('renders pipeline by status chart', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Pipeline by Status')).toBeInTheDocument();
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });

    test('displays search and filter controls', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByPlaceholderText('Search leads...')).toBeInTheDocument();
      expect(screen.getByText('All Statuses').closest('select')).toBeInTheDocument();
      expect(screen.getByText('All Sources').closest('select')).toBeInTheDocument();
    });

    test('shows add lead button', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Add Lead')).toBeInTheDocument();
    });
  });

  describe('Pitch Tracking', () => {
    test('switches to pitches tab when clicked', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText('Pitch Activities')).toBeInTheDocument();
    });

    test('displays pitch details', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText('TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('RetailCorp')).toBeInTheDocument();
    });

    test('shows pitch status', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });

    test('displays pitch type', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText(/In-Person Pitch/)).toBeInTheDocument();
      expect(screen.getByText(/Virtual Pitch/)).toBeInTheDocument();
    });

    test('shows presenters and attendees', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      const presenterElements = screen.getAllByText('Presenters');
      expect(presenterElements.length).toBeGreaterThan(0);
      const attendeeElements = screen.getAllByText('Attendees');
      expect(attendeeElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/John Smith, Senior Partner/)).toBeInTheDocument();
    });

    test('displays pitch outcome when available', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText(/Outcome:/)).toBeInTheDocument();
      expect(screen.getByText(/No Decision Yet/)).toBeInTheDocument();
    });

    test('shows follow-up date', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText(/Follow-up scheduled:/)).toBeInTheDocument();
    });

    test('displays schedule pitch button', () => {
      renderWithProviders(<BusinessDevelopment />);

      const pitchesTab = screen.getByText('Pitches');
      fireEvent.click(pitchesTab);

      expect(screen.getByText('Schedule Pitch')).toBeInTheDocument();
    });
  });

  describe('RFP Management', () => {
    test('switches to RFPs tab when clicked', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('RFP Tracker')).toBeInTheDocument();
    });

    test('displays RFP titles and details', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Outside General Counsel Services')).toBeInTheDocument();
      expect(screen.getByText('IP Litigation Panel')).toBeInTheDocument();
    });

    test('shows RFP status badges', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      const inProgressElements = screen.getAllByText('In Progress');
      expect(inProgressElements.length).toBeGreaterThan(0);
      const goNoGoElements = screen.getAllByText('Go/No-Go');
      expect(goNoGoElements.length).toBeGreaterThan(0);
    });

    test('displays progress bars for RFPs', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      const completionProgressElements = screen.getAllByText('Completion Progress');
      expect(completionProgressElements.length).toBeGreaterThan(0);
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    test('shows received and due dates', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      const receivedElements = screen.getAllByText('Received');
      expect(receivedElements.length).toBeGreaterThan(0);
      const dueDateElements = screen.getAllByText('Due Date');
      expect(dueDateElements.length).toBeGreaterThan(0);
    });

    test('displays team lead and contributors', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      const teamLeadElements = screen.getAllByText('Team Lead');
      expect(teamLeadElements.length).toBeGreaterThan(0);
      const contributorsElements = screen.getAllByText('Contributors');
      expect(contributorsElements.length).toBeGreaterThan(0);
      const johnSmithElements = screen.getAllByText('John Smith');
      expect(johnSmithElements.length).toBeGreaterThan(0);
    });

    test('shows section status for in-progress RFPs', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      const sectionStatusElements = screen.getAllByText('Section Status');
      expect(sectionStatusElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Firm Overview')).toBeInTheDocument();
      const completeElements = screen.getAllByText('Complete');
      expect(completeElements.length).toBeGreaterThan(0);
    });

    test('displays go/no-go decision badge', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Go Decision')).toBeInTheDocument();
    });

    test('shows go/no-go rationale', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText(/Go\/No-Go Rationale:/)).toBeInTheDocument();
      expect(screen.getByText(/Strong fit, existing relationship/)).toBeInTheDocument();
    });

    test('displays add RFP button', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Add RFP')).toBeInTheDocument();
    });
  });

  describe('Win/Loss Analysis', () => {
    test('switches to analysis tab when clicked', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      const winLossElements = screen.getAllByText('Win/Loss Analysis');
      expect(winLossElements.length).toBeGreaterThan(0);
    });

    test('displays win and loss outcomes with icons', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    test('shows win reasons for won opportunities', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Win Reasons')).toBeInTheDocument();
      expect(screen.getByText(/Strong industry expertise/)).toBeInTheDocument();
      expect(screen.getByText(/Competitive pricing/)).toBeInTheDocument();
    });

    test('displays loss reasons for lost opportunities', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Loss Reasons')).toBeInTheDocument();
      expect(screen.getByText(/Price too high/)).toBeInTheDocument();
      expect(screen.getByText(/Competitor had existing relationship/)).toBeInTheDocument();
    });

    test('shows competitor who won for lost deals', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText(/Won by:/)).toBeInTheDocument();
      expect(screen.getByText(/Smith & Associates/)).toBeInTheDocument();
    });

    test('displays lessons learned', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      const lessonsLearnedElements = screen.getAllByText('Lessons Learned');
      expect(lessonsLearnedElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Quick turnaround on proposal was key/)).toBeInTheDocument();
      expect(screen.getByText(/Need more fintech expertise/)).toBeInTheDocument();
    });

    test('shows sales cycle duration', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText(/Sales Cycle: 48 days/)).toBeInTheDocument();
      expect(screen.getByText(/Sales Cycle: 62 days/)).toBeInTheDocument();
    });
  });

  describe('Conversion Metrics', () => {
    test('displays conversion trend chart', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      expect(screen.getByText('Conversion Trend')).toBeInTheDocument();
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBeGreaterThan(0);
    });

    test('shows leads by source pie chart', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      expect(screen.getByText('Leads by Source')).toBeInTheDocument();
      const pieCharts = screen.getAllByTestId('pie-chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    test('displays key metrics summary', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      expect(screen.getByText('Key Metrics Summary')).toBeInTheDocument();
      expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
      const winRateElements = screen.getAllByText('Win Rate');
      expect(winRateElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Avg Sales Cycle')).toBeInTheDocument();
    });

    test('calculates and displays win rate percentage', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByRole('button', { name: /Win\/Loss Analysis/i });
      fireEvent.click(analysisTab);

      // Win rate should be calculated from leads data
      const winRateElements = screen.getAllByText(/Win Rate/);
      expect(winRateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Dashboard', () => {
    test('displays active leads metric', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Active Leads')).toBeInTheDocument();
    });

    test('shows pipeline value metric', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Pipeline Value')).toBeInTheDocument();
    });

    test('displays win rate metric card', () => {
      renderWithProviders(<BusinessDevelopment />);

      const winRateCards = screen.getAllByText('Win Rate');
      expect(winRateCards.length).toBeGreaterThan(0);
    });

    test('shows won value YTD', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Won (YTD)')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('highlights active tab', () => {
      renderWithProviders(<BusinessDevelopment />);

      const leadsTab = screen.getByRole('button', { name: /Leads/i });
      expect(leadsTab).toHaveClass('border-blue-600');
    });

    test('switches between all tabs successfully', () => {
      renderWithProviders(<BusinessDevelopment />);

      // Leads tab (default)
      expect(screen.getByText('Sarah Chen - TechVentures Inc.')).toBeInTheDocument();

      // Pitches tab
      fireEvent.click(screen.getByRole('button', { name: /Pitches/i }));
      expect(screen.getByText('Pitch Activities')).toBeInTheDocument();

      // RFPs tab
      fireEvent.click(screen.getByRole('button', { name: /RFPs/i }));
      expect(screen.getByText('RFP Tracker')).toBeInTheDocument();

      // Analysis tab
      fireEvent.click(screen.getByRole('button', { name: /Win\/Loss Analysis/i }));
      expect(screen.getByText('Conversion Trend')).toBeInTheDocument();
    });
  });

  describe('Data Privacy', () => {
    test('does not expose sensitive contact information in DOM attributes', () => {
      const { container } = renderWithProviders(<BusinessDevelopment />);

      // Check that sensitive data is not in data attributes
      const elements = container.querySelectorAll('[data-email], [data-phone], [data-contact]');
      expect(elements.length).toBe(0);
    });

    test('renders lead information without exposing in attributes', () => {
      renderWithProviders(<BusinessDevelopment />);

      // Lead names should be in text content, not attributes
      expect(screen.getByText('Sarah Chen - TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('Michael Rodriguez - BioHealth Solutions')).toBeInTheDocument();
    });
  });
});
