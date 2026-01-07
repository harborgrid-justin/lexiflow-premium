/**
 * DocumentList Component Tests
 * Enterprise-grade test suite for document list with sorting, filtering, and pagination
 *
 * @module components/features/documents/DocumentList.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentList } from './DocumentList';
import type { LegalDocument } from '@/types/documents';

// Mock child components
jest.mock('./DocumentCard', () => ({
  DocumentCard: ({ document, selected, onSelect, onDelete, onDownload }: any) => (
    <div data-testid={`doc-card-${document.id}`} data-selected={selected}>
      <span>{document.title}</span>
      {onSelect && <input type="checkbox" onChange={() => onSelect(document.id)} checked={selected} />}
      {onDownload && <button onClick={() => onDownload(document.id)}>Download</button>}
      {onDelete && <button onClick={() => onDelete(document.id)}>Delete</button>}
    </div>
  ),
}));

jest.mock('./DocumentRow', () => ({
  DocumentRow: ({ document, selected, onSelect, onDelete, onDownload }: any) => (
    <tr data-testid={`doc-row-${document.id}`} data-selected={selected}>
      <td>{document.title}</td>
      <td>{document.type}</td>
      <td>{document.status}</td>
      {onSelect && <td><input type="checkbox" onChange={() => onSelect(document.id)} checked={selected} /></td>}
      {onDownload && <td><button onClick={() => onDownload(document.id)}>Download</button></td>}
      {onDelete && <td><button onClick={() => onDelete(document.id)}>Delete</button></td>}
    </tr>
  ),
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
window.confirm = mockConfirm;

describe('DocumentList', () => {
  const mockDocuments: LegalDocument[] = [
    {
      id: 'doc-1',
      title: 'Contract Agreement',
      type: 'Contract',
      status: 'Final',
      fileSize: '2.5 MB',
      uploadDate: '2024-01-15',
      lastModified: '2024-01-20',
      tags: [],
    },
    {
      id: 'doc-2',
      title: 'Motion Brief',
      type: 'Brief',
      status: 'Draft',
      fileSize: '1.2 MB',
      uploadDate: '2024-02-01',
      lastModified: '2024-02-10',
      tags: [],
    },
    {
      id: 'doc-3',
      title: 'Evidence Exhibit',
      type: 'Evidence',
      status: 'Review',
      fileSize: '500 KB',
      uploadDate: '2024-01-25',
      lastModified: '2024-02-05',
      tags: [],
    },
  ];

  const defaultProps = {
    documents: mockDocuments,
    onDelete: jest.fn(),
    onDownload: jest.fn(),
    onBulkDelete: jest.fn(),
    onBulkDownload: jest.fn(),
    onViewModeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render document count', () => {
      render(<DocumentList {...defaultProps} />);

      expect(screen.getByText('3 documents')).toBeInTheDocument();
    });

    it('should render singular document text for single document', () => {
      render(<DocumentList {...defaultProps} documents={[mockDocuments[0]]} />);

      expect(screen.getByText('1 document')).toBeInTheDocument();
    });

    it('should render all documents in grid view by default', () => {
      render(<DocumentList {...defaultProps} />);

      expect(screen.getByTestId('doc-card-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('doc-card-doc-2')).toBeInTheDocument();
      expect(screen.getByTestId('doc-card-doc-3')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no documents', () => {
      render(<DocumentList documents={[]} />);

      expect(screen.getByText('No documents found')).toBeInTheDocument();
    });

    it('should show helpful message in empty state', () => {
      render(<DocumentList documents={[]} />);

      expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      const { container } = render(<DocumentList {...defaultProps} loading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show documents when loading', () => {
      render(<DocumentList {...defaultProps} loading />);

      expect(screen.queryByTestId('doc-card-doc-1')).not.toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should render grid view by default', () => {
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      expect(screen.getByTestId('doc-card-doc-1')).toBeInTheDocument();
    });

    it('should render list view when viewMode is list', () => {
      render(<DocumentList {...defaultProps} viewMode="list" />);

      expect(screen.getByTestId('doc-row-doc-1')).toBeInTheDocument();
    });

    it('should show view toggle buttons when onViewModeChange is provided', () => {
      render(<DocumentList {...defaultProps} />);

      // Grid and List view buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should call onViewModeChange when grid button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="list" />);

      // Find grid toggle button (first in the view toggle group)
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(defaultProps.onViewModeChange).toHaveBeenCalled();
    });

    it('should not show view toggle when onViewModeChange is not provided', () => {
      const propsWithoutViewToggle = { ...defaultProps, onViewModeChange: undefined };
      const { container } = render(<DocumentList {...propsWithoutViewToggle} />);

      const viewToggle = container.querySelector('.bg-gray-100.rounded-lg.p-1');
      expect(viewToggle).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by lastModified descending by default', () => {
      render(<DocumentList {...defaultProps} viewMode="list" />);

      const rows = screen.getAllByTestId(/doc-row/);
      // Most recently modified should be first
      expect(rows[0]).toHaveTextContent('Motion Brief');
    });

    it('should sort by title when Title header is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="list" />);

      const titleHeader = screen.getByRole('button', { name: /Title/ });
      await user.click(titleHeader);

      const rows = screen.getAllByTestId(/doc-row/);
      // Alphabetically first
      expect(rows[0]).toHaveTextContent('Contract Agreement');
    });

    it('should toggle sort direction on second click', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="list" />);

      const titleHeader = screen.getByRole('button', { name: /Title/ });
      await user.click(titleHeader);
      await user.click(titleHeader);

      const rows = screen.getAllByTestId(/doc-row/);
      // Alphabetically last when descending
      expect(rows[0]).toHaveTextContent('Motion Brief');
    });
  });

  describe('Selection', () => {
    it('should track selected documents', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox);

      expect(screen.getByTestId('doc-card-doc-1')).toHaveAttribute('data-selected', 'true');
    });

    it('should show selection count when documents are selected', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox1 = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox1);

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('should toggle select all in list view', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="list" />);

      // Get select all checkbox (in table header)
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      const rows = screen.getAllByTestId(/doc-row/);
      rows.forEach(row => {
        expect(row).toHaveAttribute('data-selected', 'true');
      });
    });

    it('should deselect all when all selected and select all is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="list" />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox); // Select all
      await user.click(selectAllCheckbox); // Deselect all

      const rows = screen.getAllByTestId(/doc-row/);
      rows.forEach(row => {
        expect(row).toHaveAttribute('data-selected', 'false');
      });
    });
  });

  describe('Bulk Actions', () => {
    it('should show bulk action buttons when documents are selected', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox);

      expect(screen.getByText('Download Selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });

    it('should not show bulk action buttons when no documents selected', () => {
      render(<DocumentList {...defaultProps} />);

      expect(screen.queryByText('Download Selected')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Selected')).not.toBeInTheDocument();
    });

    it('should call onBulkDownload with selected ids', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox1 = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      const checkbox2 = within(screen.getByTestId('doc-card-doc-2')).getByRole('checkbox');
      await user.click(checkbox1);
      await user.click(checkbox2);

      await user.click(screen.getByText('Download Selected'));

      expect(defaultProps.onBulkDownload).toHaveBeenCalledWith(['doc-1', 'doc-2']);
    });

    it('should call onBulkDelete with selected ids after confirmation', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox);

      await user.click(screen.getByText('Delete Selected'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(defaultProps.onBulkDelete).toHaveBeenCalledWith(['doc-1']);
    });

    it('should not call onBulkDelete when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false);
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox);

      await user.click(screen.getByText('Delete Selected'));

      expect(defaultProps.onBulkDelete).not.toHaveBeenCalled();
    });

    it('should clear selection after bulk delete', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const checkbox = within(screen.getByTestId('doc-card-doc-1')).getByRole('checkbox');
      await user.click(checkbox);
      await user.click(screen.getByText('Delete Selected'));

      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const manyDocuments: LegalDocument[] = Array.from({ length: 25 }, (_, i) => ({
      id: `doc-${i}`,
      title: `Document ${i}`,
      type: 'Document',
      uploadDate: '2024-01-01',
      lastModified: '2024-01-01',
      tags: [],
    }));

    it('should paginate documents in grid view', () => {
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      // Grid view shows 12 per page
      const cards = screen.getAllByTestId(/doc-card/);
      expect(cards.length).toBe(12);
    });

    it('should paginate documents in list view', () => {
      render(<DocumentList documents={manyDocuments} viewMode="list" />);

      // List view shows 20 per page
      const rows = screen.getAllByTestId(/doc-row/);
      expect(rows.length).toBe(20);
    });

    it('should show pagination info', () => {
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      expect(screen.getByText(/Showing 1 to 12 of 25 results/)).toBeInTheDocument();
    });

    it('should show Next button when more pages exist', () => {
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      await user.click(screen.getByText('Next'));

      expect(screen.getByText(/Showing 13 to 24/)).toBeInTheDocument();
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Previous'));

      expect(screen.getByText(/Showing 1 to 12/)).toBeInTheDocument();
    });

    it('should disable Previous on first page', () => {
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      expect(screen.getByText('Previous')).toBeDisabled();
    });

    it('should disable Next on last page', async () => {
      const user = userEvent.setup();
      render(<DocumentList documents={manyDocuments} viewMode="grid" />);

      await user.click(screen.getByText('Next'));
      await user.click(screen.getByText('Next'));

      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('should not show pagination when all documents fit on one page', () => {
      render(<DocumentList {...defaultProps} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Individual Actions', () => {
    it('should call onDelete for individual document', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const deleteButton = within(screen.getByTestId('doc-card-doc-1')).getByText('Delete');
      await user.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('doc-1');
    });

    it('should call onDownload for individual document', async () => {
      const user = userEvent.setup();
      render(<DocumentList {...defaultProps} viewMode="grid" />);

      const downloadButton = within(screen.getByTestId('doc-card-doc-1')).getByText('Download');
      await user.click(downloadButton);

      expect(defaultProps.onDownload).toHaveBeenCalledWith('doc-1');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure in list view', () => {
      render(<DocumentList {...defaultProps} viewMode="list" />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
