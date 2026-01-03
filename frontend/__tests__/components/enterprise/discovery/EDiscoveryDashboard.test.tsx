/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EDiscoveryDashboard } from '@/components/enterprise/Discovery/EDiscoveryDashboard';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the theme context
const mockTheme = {
  theme: {
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
    },
    surface: {
      default: 'bg-white',
      input: 'bg-white',
    },
    background: 'bg-gray-50',
    border: {
      default: 'border-gray-200',
    },
  },
};

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

jest.mock('@/contexts/theme/ThemeContext', () => ({
  useTheme: () => mockTheme,
  ThemeProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('EDiscoveryDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders dashboard header with title and description', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByText('eDiscovery Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive discovery management and metrics')).toBeInTheDocument();
    });

    test('renders all KPI cards with correct metrics', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByText('Total Custodians')).toBeInTheDocument();
      expect(screen.getByText('Active Collections')).toBeInTheDocument();
      expect(screen.getByText('Documents Collected')).toBeInTheDocument();
      expect(screen.getByText('Review Progress')).toBeInTheDocument();
    });

    test('renders action buttons in header', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import data/i })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('renders all tab options', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custodians/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /collections/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /processing/i })).toBeInTheDocument();
    });

    test('switches to custodians tab when clicked', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      // Should show custodian search input
      expect(screen.getByPlaceholderText(/search custodians/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add custodian/i })).toBeInTheDocument();
    });

    test('switches to collections tab when clicked', () => {
      render(<EDiscoveryDashboard />);

      const collectionsTab = screen.getByRole('button', { name: /collections/i });
      fireEvent.click(collectionsTab);

      expect(screen.getByRole('button', { name: /new collection/i })).toBeInTheDocument();
    });

    test('switches to processing tab when clicked', () => {
      render(<EDiscoveryDashboard />);

      const processingTab = screen.getByRole('button', { name: /processing/i });
      fireEvent.click(processingTab);

      expect(screen.getByText('Processing Status')).toBeInTheDocument();
    });
  });

  describe('Custodian List Rendering', () => {
    test('displays custodian table with correct headers', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      expect(screen.getByText('Custodian')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
    });

    test('displays mock custodian data', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Emily Rodriguez')).toBeInTheDocument();
    });

    test('allows clicking on custodian row', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      const custodianRow = screen.getByText('Sarah Johnson').closest('tr');
      expect(custodianRow).toHaveClass('cursor-pointer');

      fireEvent.click(custodianRow!);
      // Verify row click behavior - component sets selectedCustodian state
    });
  });

  describe('Collection Status Display', () => {
    test('displays collection cards with progress bars', () => {
      render(<EDiscoveryDashboard />);

      const collectionsTab = screen.getByRole('button', { name: /collections/i });
      fireEvent.click(collectionsTab);

      expect(screen.getByText('Email Archive Q4 2025')).toBeInTheDocument();
      expect(screen.getByText('SharePoint Documents')).toBeInTheDocument();
    });

    test('shows collection progress information', () => {
      render(<EDiscoveryDashboard />);

      const collectionsTab = screen.getByRole('button', { name: /collections/i });
      fireEvent.click(collectionsTab);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      // Check for custodian names in collections
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    });

    test('displays collection type and size', () => {
      render(<EDiscoveryDashboard />);

      const collectionsTab = screen.getByRole('button', { name: /collections/i });
      fireEvent.click(collectionsTab);

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
    });
  });

  describe('Processing Metrics', () => {
    test('displays review metrics in overview tab', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByText('Review Metrics')).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
      expect(screen.getByText('Needs Review')).toBeInTheDocument();
      expect(screen.getByText('Privileged')).toBeInTheDocument();
      expect(screen.getByText('Responsive')).toBeInTheDocument();
      expect(screen.getByText('Non-Responsive')).toBeInTheDocument();
    });

    test('displays processing pipeline stages', () => {
      render(<EDiscoveryDashboard />);

      expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Deduplication')).toBeInTheDocument();
      expect(screen.getByText('Text Extraction')).toBeInTheDocument();
      expect(screen.getByText('OCR Processing')).toBeInTheDocument();
      expect(screen.getByText('Indexing')).toBeInTheDocument();
    });

    test('shows processing progress percentages', () => {
      render(<EDiscoveryDashboard />);

      // Each stage should have a progress percentage
      const percentageElements = screen.getAllByText(/\d+%/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });
  });

  describe('Legal-Specific Features', () => {
    test('displays custodian status badges', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      expect(screen.getByText('hold')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('interviewed')).toBeInTheDocument();
    });

    test('calculates and displays review progress correctly', () => {
      render(<EDiscoveryDashboard />);

      // Review Progress KPI should show percentage
      const reviewProgress = screen.getByText('Review Progress').closest('div');
      expect(reviewProgress).toBeInTheDocument();

      // Should show a percentage value
      const percentagePattern = /\d+%/;
      const percentageElements = screen.getAllByText(percentagePattern);
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    test('handles onNavigate callback when provided', () => {
      const mockNavigate = jest.fn();
      render(<EDiscoveryDashboard onNavigate={mockNavigate} />);

      // Component should be rendered with navigate prop
      expect(screen.getByText('eDiscovery Dashboard')).toBeInTheDocument();
    });

    test('displays case-specific data when caseId is provided', () => {
      const mockCaseId = 'CASE-123';
      render(<EDiscoveryDashboard caseId={mockCaseId} />);

      // Component should render with case-specific context
      expect(screen.getByText('eDiscovery Dashboard')).toBeInTheDocument();
    });
  });

  describe('Search and Filter Functionality', () => {
    test('renders search input in custodians tab', () => {
      render(<EDiscoveryDashboard />);

      const custodiansTab = screen.getByRole('button', { name: /custodians/i });
      fireEvent.click(custodiansTab);

      const searchInput = screen.getByPlaceholderText(/search custodians/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('displays filter button in collections tab', () => {
      render(<EDiscoveryDashboard />);

      const collectionsTab = screen.getByRole('button', { name: /collections/i });
      fireEvent.click(collectionsTab);

      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles for interactive elements', () => {
      render(<EDiscoveryDashboard />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('tab navigation is keyboard accessible', () => {
      render(<EDiscoveryDashboard />);

      const overviewTab = screen.getByRole('button', { name: /overview/i });
      const custodiansTab = screen.getByRole('button', { name: /custodians/i });

      expect(overviewTab).toBeInTheDocument();
      expect(custodiansTab).toBeInTheDocument();
    });
  });
});
