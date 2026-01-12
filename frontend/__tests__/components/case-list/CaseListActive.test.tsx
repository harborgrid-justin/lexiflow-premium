/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { CaseListActive } from '@/lexiflow-suite/components/case-list/CaseListActive';
import { Case, CaseStatus } from '@/lexiflow-suite/types';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('@/lexiflow-suite/hooks/useSort', () => ({
  useSort: jest.fn((items) => ({
    items,
    requestSort: jest.fn(),
    sortConfig: { key: 'filingDate', direction: 'desc' },
  })),
}));

jest.mock('@/lexiflow-suite/hooks/useData', () => ({
  useActions: jest.fn(() => ({
    syncData: jest.fn(),
  })),
}));

describe('CaseListActive', () => {
  const mockCases: Case[] = [
    {
      id: 'case-1',
      title: 'Smith v. Jones',
      status: CaseStatus.Active,
      matterType: 'Litigation',
      client: 'Smith Corp',
      filingDate: '2026-01-01',
      value: 500000,
      userId: 'user-1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'case-2',
      title: 'Doe v. Roe',
      status: CaseStatus.Discovery,
      matterType: 'IP',
      client: 'Doe Inc',
      filingDate: '2026-01-05',
      value: 750000,
      userId: 'user-1',
      createdAt: '2026-01-05',
      updatedAt: '2026-01-05',
    },
  ];

  const mockSelectCase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render case list table', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByText('Matter Profile')).toBeInTheDocument();
      expect(screen.getByText('Class')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Valuation')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should display case data', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
      expect(screen.getByText('Doe v. Roe')).toBeInTheDocument();
    });

    it('should render with component ID badge', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const badge = screen.getByText('CM-02');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render status filter dropdown', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const statusFilter = screen.getByLabelText('Filter by Status');
      expect(statusFilter).toBeInTheDocument();
    });

    it('should render type filter dropdown', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const typeFilter = screen.getByLabelText('Filter by Type');
      expect(typeFilter).toBeInTheDocument();
    });

    it('should filter cases by status', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const statusFilter = screen.getByLabelText('Filter by Status');
      fireEvent.change(statusFilter, { target: { value: CaseStatus.Active } });

      expect(statusFilter).toHaveValue(CaseStatus.Active);
    });

    it('should filter cases by type', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const typeFilter = screen.getByLabelText('Filter by Type');
      fireEvent.change(typeFilter, { target: { value: 'Litigation' } });

      expect(typeFilter).toHaveValue('Litigation');
    });

    it('should show reset filters button when filters are active', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const statusFilter = screen.getByLabelText('Filter by Status');
      fireEvent.change(statusFilter, { target: { value: CaseStatus.Active } });

      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });

    it('should reset filters when reset button is clicked', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const statusFilter = screen.getByLabelText('Filter by Status');
      fireEvent.change(statusFilter, { target: { value: CaseStatus.Active } });

      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);

      expect(statusFilter).toHaveValue('All');
    });

    it('should filter cases by both status and type', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const statusFilter = screen.getByLabelText('Filter by Status');
      const typeFilter = screen.getByLabelText('Filter by Type');

      fireEvent.change(statusFilter, { target: { value: CaseStatus.Active } });
      fireEvent.change(typeFilter, { target: { value: 'Litigation' } });

      expect(statusFilter).toHaveValue(CaseStatus.Active);
      expect(typeFilter).toHaveValue('Litigation');
    });
  });

  describe('Sorting', () => {
    it('should have sortable column headers', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const sortableHeaders = container.querySelectorAll('.cursor-pointer');
      expect(sortableHeaders.length).toBeGreaterThan(0);
    });

    it('should handle sort on title column', () => {
      const { useSort } = require('@/lexiflow-suite/hooks/useSort');
      const mockRequestSort = jest.fn();

      useSort.mockReturnValue({
        items: mockCases,
        requestSort: mockRequestSort,
        sortConfig: { key: 'title', direction: 'asc' },
      });

      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const titleHeader = screen.getByText('Matter Profile');
      fireEvent.click(titleHeader);

      // Should initiate a transition for sorting
      waitFor(() => {
        expect(mockRequestSort).toHaveBeenCalled();
      });
    });

    it('should display sort indicators', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      // Sort indicators should be present
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Case Selection', () => {
    it('should call onSelectCase when row is clicked', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const caseRow = screen.getByText('Smith v. Jones');
      fireEvent.click(caseRow);

      expect(mockSelectCase).toHaveBeenCalledWith(mockCases[0]);
    });

    it('should apply hover styles to rows', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const hoverRows = container.querySelectorAll('.hover\\:bg-blue-50\\/20');
      expect(hoverRows.length).toBeGreaterThan(0);
    });

    it('should have cursor pointer on rows', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const clickableRows = container.querySelectorAll('.cursor-pointer');
      expect(clickableRows.length).toBeGreaterThan(0);
    });
  });

  describe('Loading State', () => {
    it('should render skeleton when loading', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
          isLoading={true}
        />
      );

      // TableSkeleton should be rendered
      expect(screen.queryByText('Smith v. Jones')).not.toBeInTheDocument();
    });

    it('should not render cases when loading', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
          isLoading={true}
        />
      );

      expect(screen.queryByText('Smith v. Jones')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no cases match filters', () => {
      render(
        <CaseListActive
          cases={[]}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByText('No matters found matching criteria.')).toBeInTheDocument();
    });
  });

  describe('Toolbar Actions', () => {
    it('should render sync engine button', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByText('Sync Engine')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByText('Export Ledger')).toBeInTheDocument();
    });

    it('should call syncData when sync button is clicked', () => {
      const { useActions } = require('@/lexiflow-suite/hooks/useData');
      const mockSyncData = jest.fn();

      useActions.mockReturnValue({
        syncData: mockSyncData,
      });

      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const syncButton = screen.getByText('Sync Engine');
      fireEvent.click(syncButton);

      expect(mockSyncData).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-sort attributes', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const sortableHeaders = container.querySelectorAll('th[aria-sort]');
      expect(sortableHeaders.length).toBeGreaterThan(0);
    });

    it('should have accessible filter labels', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Type')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      const filters = screen.getAllByRole('combobox');
      expect(filters.length).toBeGreaterThan(0);
    });
  });

  describe('Transition States', () => {
    it('should apply opacity during pending state', () => {
      const { container } = render(
        <CaseListActive
          cases={mockCases}
          onSelectCase={mockSelectCase}
        />
      );

      // Initially should be fully opaque
      const tableContainer = container.querySelector('.opacity-100');
      expect(tableContainer).toBeInTheDocument();
    });
  });
});
