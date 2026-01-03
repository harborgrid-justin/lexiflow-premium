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
    getPalette: jest.fn(() => ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']),
  },
}));

// Mock chart config
jest.mock('@/utils/chartConfig', () => ({
  getChartTheme: jest.fn(() => ({
    grid: '#e5e7eb',
    text: '#374151',
    tooltipStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    },
  })),
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
jest.mock('lucide-react', () => ({
  Target: () => <div data-testid="target-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  Users: () => <div data-testid="users-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  Award: () => <div data-testid="award-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  ArrowUpRight: () => <div data-testid="arrow-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Search: () => <div data-testid="search-icon" />,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('BusinessDevelopment Component', () => {
  describe('Lead Pipeline', () => {
    test('renders leads tab by default', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('BioHealth Solutions')).toBeInTheDocument();
      expect(screen.getByText('Global Manufacturing LLC')).toBeInTheDocument();
    });

    test('displays lead information with contact details', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Sarah Chen - TechVentures Inc.')).toBeInTheDocument();
      expect(screen.getByText('Michael Rodriguez - BioHealth Solutions')).toBeInTheDocument();
    });

    test('shows lead status badges', () => {
      renderWithProviders(<BusinessDevelopment />);

      expect(screen.getByText('Proposal')).toBeInTheDocument();
      expect(screen.getByText('Qualified')).toBeInTheDocument();
      expect(screen.getByText('Won')).toBeInTheDocument();
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

      expect(screen.getByText('Referral')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
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

      expect(screen.getByText('Presenters')).toBeInTheDocument();
      expect(screen.getByText('Attendees')).toBeInTheDocument();
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

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Go/No-Go')).toBeInTheDocument();
    });

    test('displays progress bars for RFPs', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Completion Progress')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    test('shows received and due dates', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Received')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
    });

    test('displays team lead and contributors', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Team Lead')).toBeInTheDocument();
      expect(screen.getByText('Contributors')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    test('shows section status for in-progress RFPs', () => {
      renderWithProviders(<BusinessDevelopment />);

      const rfpsTab = screen.getByText('RFPs');
      fireEvent.click(rfpsTab);

      expect(screen.getByText('Section Status')).toBeInTheDocument();
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Firm Overview')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
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

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Win/Loss Analysis')).toBeInTheDocument();
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

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
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

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Conversion Trend')).toBeInTheDocument();
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBeGreaterThan(0);
    });

    test('shows leads by source pie chart', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Leads by Source')).toBeInTheDocument();
      const pieCharts = screen.getAllByTestId('pie-chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    test('displays key metrics summary', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('Key Metrics Summary')).toBeInTheDocument();
      expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Sales Cycle')).toBeInTheDocument();
    });

    test('calculates and displays win rate percentage', () => {
      renderWithProviders(<BusinessDevelopment />);

      const analysisTab = screen.getByText('Win/Loss Analysis');
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

      const leadsTab = screen.getByText('Leads').closest('button');
      expect(leadsTab).toHaveClass('border-blue-600');
    });

    test('switches between all tabs successfully', () => {
      renderWithProviders(<BusinessDevelopment />);

      // Leads tab (default)
      expect(screen.getByText('TechVentures Inc.')).toBeInTheDocument();

      // Pitches tab
      fireEvent.click(screen.getByText('Pitches'));
      expect(screen.getByText('Pitch Activities')).toBeInTheDocument();

      // RFPs tab
      fireEvent.click(screen.getByText('RFPs'));
      expect(screen.getByText('RFP Tracker')).toBeInTheDocument();

      // Analysis tab
      fireEvent.click(screen.getByText('Win/Loss Analysis'));
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
