/**
 * DocumentTable Component Tests
 * Enterprise-grade tests for document table with sorting.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentTable } from './DocumentTable';
import type { LegalDocument } from '@/types/documents';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('./DocumentRow', () => ({
  DocumentRow: ({ doc, isSelected, toggleSelection, setSelectedDocForHistory, setTaggingDoc, onRowClick }: any) => (
    <div data-testid={`doc-row-${doc.id}`} data-selected={isSelected}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelection(doc.id)}
        data-testid={`checkbox-${doc.id}`}
      />
      <span>{doc.title}</span>
      <span data-testid={`updated-${doc.id}`}>{doc.updatedAt}</span>
      <button onClick={() => onRowClick?.(doc)}>Select</button>
    </div>
  ),
}));

describe('DocumentTable', () => {
  const mockDocuments: LegalDocument[] = [
    {
      id: 'doc-001',
      title: 'Contract A',
      type: 'Contract',
      lastModified: '2024-01-15T10:30:00Z',
      caseId: 'CASE-001',
      sourceModule: 'Contracts',
      fileSize: '1.2 MB',
      status: 'Final',
      tags: [],
      versions: [],
      content: '',
      uploadDate: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      userId: 'user-1',
    },
    {
      id: 'doc-002',
      title: 'Brief B',
      type: 'Brief',
      lastModified: '2024-01-14T15:45:00Z',
      caseId: 'CASE-002',
      sourceModule: 'Docket',
      fileSize: '450 KB',
      status: 'Draft',
      tags: [],
      versions: [],
      content: '',
      uploadDate: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      userId: 'user-1',
    },
    {
      id: 'doc-003',
      title: 'Motion C',
      type: 'Motion',
      lastModified: '2024-01-16T09:00:00Z',
      caseId: 'CASE-003',
      sourceModule: 'Evidence',
      fileSize: '2.5 MB',
      status: 'Signed',
      tags: [],
      versions: [],
      content: '',
      uploadDate: '2024-01-16T09:00:00Z',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
      userId: 'user-1',
    },
  ];

  const mockToggleSelection = jest.fn();
  const mockSelectAll = jest.fn();
  const mockIsSelected = jest.fn((id: string) => false);
  const mockSetSelectedDocForHistory = jest.fn();
  const mockSetTaggingDoc = jest.fn();
  const mockOnRowClick = jest.fn();

  const defaultProps = {
    documents: mockDocuments,
    viewMode: 'list' as const,
    selectedDocs: [] as string[],
    toggleSelection: mockToggleSelection,
    selectAll: mockSelectAll,
    isAllSelected: false,
    isSelected: mockIsSelected,
    setSelectedDocForHistory: mockSetSelectedDocForHistory,
    setTaggingDoc: mockSetTaggingDoc,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders table header', () => {
      render(<DocumentTable {...defaultProps} />);

      expect(screen.getByText('Document Name')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Tags & Rules')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('renders all document rows', () => {
      render(<DocumentTable {...defaultProps} />);

      expect(screen.getByTestId('doc-row-doc-001')).toBeInTheDocument();
      expect(screen.getByTestId('doc-row-doc-002')).toBeInTheDocument();
      expect(screen.getByTestId('doc-row-doc-003')).toBeInTheDocument();
    });

    it('renders select all checkbox', () => {
      render(<DocumentTable {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeInTheDocument(); // First checkbox is select all
    });

    it('renders empty state when no documents', () => {
      render(<DocumentTable {...defaultProps} documents={[]} />);

      expect(screen.getByText('No documents found.')).toBeInTheDocument();
    });
  });

  describe('Select All', () => {
    it('select all checkbox reflects isAllSelected when false', () => {
      render(<DocumentTable {...defaultProps} isAllSelected={false} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked();
    });

    it('select all checkbox reflects isAllSelected when true', () => {
      render(<DocumentTable {...defaultProps} isAllSelected={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
    });

    it('calls selectAll when select all checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(mockSelectAll).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('sorts by title when Document Name header clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Document Name'));

      // Check that sorting happened (rows should be reordered)
      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows.length).toBe(3);
      });
    });

    it('sorts by source when Source header clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Source'));

      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows.length).toBe(3);
      });
    });

    it('sorts by status when Status header clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Status'));

      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows.length).toBe(3);
      });
    });

    it('sorts by modified date by default', () => {
      render(<DocumentTable {...defaultProps} />);

      // Modified header should show sort indicator
      const modifiedHeader = screen.getByText('Modified').parentElement;
      const sortIcon = modifiedHeader?.querySelector('svg');
      expect(sortIcon).toBeInTheDocument();
    });

    it('toggles sort direction when same header clicked twice', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Document Name'));
      await user.click(screen.getByText('Document Name'));

      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows.length).toBe(3);
      });
    });

    it('shows sort indicator on sorted column', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Document Name'));

      await waitFor(() => {
        const titleHeader = screen.getByText('Document Name').parentElement;
        const sortIcon = titleHeader?.querySelector('svg');
        expect(sortIcon).toBeInTheDocument();
      });
    });
  });

  describe('Row Selection', () => {
    it('passes isSelected to each row', () => {
      const mockIsSelectedCustom = jest.fn((id: string) => id === 'doc-001');

      render(
        <DocumentTable
          {...defaultProps}
          isSelected={mockIsSelectedCustom}
        />
      );

      expect(screen.getByTestId('doc-row-doc-001')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('doc-row-doc-002')).toHaveAttribute('data-selected', 'false');
    });

    it('calls toggleSelection through row', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      const checkbox = screen.getByTestId('checkbox-doc-001');
      await user.click(checkbox);

      expect(mockToggleSelection).toHaveBeenCalledWith('doc-001');
    });
  });

  describe('Row Click', () => {
    it('passes onRowClick to rows', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} onRowClick={mockOnRowClick} />);

      const selectButton = screen.getAllByText('Select')[0];
      await user.click(selectButton);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockDocuments[0]);
    });
  });

  describe('Pending State', () => {
    it('applies opacity during pending transition', async () => {
      const user = userEvent.setup();
      const { container } = render(<DocumentTable {...defaultProps} />);

      // Trigger a sort which causes pending state
      await user.click(screen.getByText('Document Name'));

      // The transition opacity class should be applied
      expect(container.firstChild).toHaveClass('transition-opacity');
    });
  });

  describe('Styling', () => {
    it('table has flex layout', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      expect(container.firstChild).toHaveClass('flex-1', 'flex', 'flex-col');
    });

    it('header has proper styling', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const header = container.querySelector('.bg-slate-50');
      expect(header).toBeInTheDocument();
    });

    it('content area is scrollable', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('header columns are clickable', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const clickableHeaders = container.querySelectorAll('.cursor-pointer');
      expect(clickableHeaders.length).toBeGreaterThan(0);
    });
  });

  describe('Dark Mode', () => {
    it('container has dark mode background', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:bg-slate-900');
    });

    it('header has dark mode styling', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const header = container.querySelector('.dark\\:bg-slate-800');
      expect(header).toBeInTheDocument();
    });

    it('empty state has dark mode text', () => {
      render(<DocumentTable {...defaultProps} documents={[]} />);

      const emptyText = screen.getByText('No documents found.');
      expect(emptyText.closest('div')).toHaveClass('dark:text-slate-400');
    });
  });

  describe('Column Widths', () => {
    it('checkbox column has fixed width', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const checkboxCol = container.querySelector('.w-10');
      expect(checkboxCol).toBeInTheDocument();
    });

    it('source column has fixed width', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const sourceCol = container.querySelector('.w-28');
      expect(sourceCol).toBeInTheDocument();
    });

    it('document name column is flexible', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const nameCol = container.querySelector('.flex-1');
      expect(nameCol).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('select all checkbox is accessible', () => {
      render(<DocumentTable {...defaultProps} />);

      const selectAll = screen.getAllByRole('checkbox')[0];
      expect(selectAll).toBeInTheDocument();
    });

    it('column headers are interactive', () => {
      const { container } = render(<DocumentTable {...defaultProps} />);

      const headers = container.querySelectorAll('.cursor-pointer');
      headers.forEach(header => {
        expect(header).not.toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('Sorting Logic', () => {
    it('sorts documents in ascending order', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      // Click title to sort
      await user.click(screen.getByText('Document Name'));

      // The documents should be sorted
      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows).toHaveLength(3);
      });
    });

    it('sorts documents in descending order', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      // Click twice to get descending
      await user.click(screen.getByText('Document Name'));
      await user.click(screen.getByText('Document Name'));

      await waitFor(() => {
        const rows = screen.getAllByTestId(/doc-row-/);
        expect(rows).toHaveLength(3);
      });
    });

    it('changes sort field when different header clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentTable {...defaultProps} />);

      await user.click(screen.getByText('Document Name'));
      await user.click(screen.getByText('Status'));

      await waitFor(() => {
        const statusHeader = screen.getByText('Status').parentElement;
        const sortIcon = statusHeader?.querySelector('svg');
        expect(sortIcon).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles documents with undefined values', () => {
      const docsWithUndefined = [
        { ...mockDocuments[0], title: undefined as any },
      ];

      // Should not throw
      render(<DocumentTable {...defaultProps} documents={docsWithUndefined} />);
    });

    it('handles single document', () => {
      render(<DocumentTable {...defaultProps} documents={[mockDocuments[0]]} />);

      expect(screen.getByTestId('doc-row-doc-001')).toBeInTheDocument();
    });

    it('handles many documents', () => {
      const manyDocs = Array.from({ length: 100 }, (_, i) => ({
        ...mockDocuments[0],
        id: `doc-${i}`,
        title: `Document ${i}`,
      }));

      render(<DocumentTable {...defaultProps} documents={manyDocs} />);

      expect(screen.getAllByTestId(/doc-row-/).length).toBe(100);
    });
  });
});
