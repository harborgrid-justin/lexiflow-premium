/**
 * @fileoverview Enterprise-grade tests for DocumentVersionsList component
 * @module components/document-versions/DocumentVersionsList.test
 *
 * Tests version history display, version badges, and empty states.
 */

import { render, screen } from '@testing-library/react';
import { DocumentVersionsList } from './DocumentVersionsList';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockVersions = [
  {
    id: '1',
    documentName: 'Settlement Agreement Draft',
    currentVersion: '3.2',
    totalVersions: 8,
    lastModifiedBy: 'John Attorney',
    lastModifiedAt: '2024-01-15T14:30:00',
  },
  {
    id: '2',
    documentName: 'Motion to Compel',
    currentVersion: '1.0',
    totalVersions: 1,
    lastModifiedBy: 'Emily Associate',
    lastModifiedAt: '2024-01-14T10:00:00',
  },
  {
    id: '3',
    documentName: 'Client Brief',
    currentVersion: '5.1',
    totalVersions: 12,
    lastModifiedBy: 'David Paralegal',
    lastModifiedAt: '2024-01-13T16:45:00',
  },
];

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('DocumentVersionsList', () => {
  describe('Header', () => {
    it('renders the Document Versions title', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByRole('heading', { name: /document versions/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TABLE HEADERS TESTS
  // ============================================================================

  describe('Table Headers', () => {
    it('renders Document Name header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByText(/document name/i)).toBeInTheDocument();
    });

    it('renders Current Version header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByText(/current version/i)).toBeInTheDocument();
    });

    it('renders Total Versions header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByText(/total versions/i)).toBeInTheDocument();
    });

    it('renders Last Modified By header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByText(/last modified by/i)).toBeInTheDocument();
    });

    it('renders Last Modified header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByText(/^last modified$/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VERSION DATA TESTS
  // ============================================================================

  describe('Version Data', () => {
    it('renders document names', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      expect(screen.getByText('Settlement Agreement Draft')).toBeInTheDocument();
      expect(screen.getByText('Motion to Compel')).toBeInTheDocument();
      expect(screen.getByText('Client Brief')).toBeInTheDocument();
    });

    it('renders version numbers with v prefix', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      expect(screen.getByText('v3.2')).toBeInTheDocument();
      expect(screen.getByText('v1.0')).toBeInTheDocument();
      expect(screen.getByText('v5.1')).toBeInTheDocument();
    });

    it('renders total version counts', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders last modified by names', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      expect(screen.getByText('John Attorney')).toBeInTheDocument();
      expect(screen.getByText('Emily Associate')).toBeInTheDocument();
      expect(screen.getByText('David Paralegal')).toBeInTheDocument();
    });

    it('renders formatted dates', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      // Dates are formatted using toLocaleDateString
      const dateElements = screen.getAllByRole('cell').filter(
        cell => cell.textContent?.includes('/') || cell.textContent?.includes('2024')
      );
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // VERSION BADGE TESTS
  // ============================================================================

  describe('Version Badge', () => {
    it('applies blue styling to version badges', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const versionBadge = screen.getByText('v3.2');
      expect(versionBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('applies pill styling to version badges', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const badges = ['v3.2', 'v1.0', 'v5.1'].map(version =>
        screen.getByText(version)
      );

      badges.forEach(badge => {
        expect(badge).toHaveClass('px-2', 'py-1', 'text-xs', 'font-semibold', 'rounded');
      });
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('shows empty state when no versions', () => {
      render(<DocumentVersionsList initialVersions={[]} />);

      expect(screen.getByText(/no document versions available/i)).toBeInTheDocument();
    });

    it('spans all columns for empty state', () => {
      render(<DocumentVersionsList initialVersions={[]} />);

      const emptyCell = screen.getByText(/no document versions available/i).closest('td');
      expect(emptyCell).toHaveAttribute('colspan', '5');
    });

    it('centers empty state text', () => {
      render(<DocumentVersionsList initialVersions={[]} />);

      const emptyCell = screen.getByText(/no document versions available/i).closest('td');
      expect(emptyCell).toHaveClass('text-center');
    });
  });

  // ============================================================================
  // TABLE STRUCTURE TESTS
  // ============================================================================

  describe('Table Structure', () => {
    it('renders table element', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has proper table rows', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows.length).toBe(4);
    });

    it('rows are hoverable', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const dataRows = screen.getAllByRole('row').slice(1);
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const title = screen.getByRole('heading', { name: /document versions/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to table header', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const thead = screen.getByRole('table').querySelector('thead');
      expect(thead).toHaveClass('dark:bg-gray-900');
    });

    it('applies dark mode classes to table body', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toHaveClass('dark:bg-gray-800');
    });

    it('applies dark mode classes to version badges', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const versionBadge = screen.getByText('v3.2');
      expect(versionBadge).toHaveClass('dark:bg-blue-900', 'dark:text-blue-200');
    });

    it('applies dark mode classes to row hover', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const dataRows = screen.getAllByRole('row').slice(1);
      dataRows.forEach(row => {
        expect(row).toHaveClass('dark:hover:bg-gray-700');
      });
    });
  });

  // ============================================================================
  // SINGLE VERSION TEST
  // ============================================================================

  describe('Single Version', () => {
    it('renders correctly with single version entry', () => {
      const single = [mockVersions[0]];
      render(<DocumentVersionsList initialVersions={single} />);

      expect(screen.getByText('Settlement Agreement Draft')).toBeInTheDocument();
      expect(screen.queryByText('Motion to Compel')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // BORDER AND STYLING TESTS
  // ============================================================================

  describe('Border and Styling', () => {
    it('table container has rounded borders', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const container = screen.getByRole('table').closest('.rounded-lg');
      expect(container).toBeInTheDocument();
    });

    it('table container has overflow hidden', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const container = screen.getByRole('table').closest('.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('table container has border', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      const container = screen.getByRole('table').closest('.border');
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATE FORMATTING TESTS
  // ============================================================================

  describe('Date Formatting', () => {
    it('formats dates using toLocaleDateString', () => {
      render(<DocumentVersionsList initialVersions={mockVersions} />);

      // Check that the dates are rendered (exact format depends on locale)
      const dateCell = screen.getAllByRole('row')[1].querySelectorAll('td')[4];
      expect(dateCell.textContent).toBeTruthy();
    });
  });
});
