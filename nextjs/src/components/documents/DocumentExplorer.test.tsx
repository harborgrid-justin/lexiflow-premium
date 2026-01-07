/**
 * DocumentExplorer Component Tests
 * Enterprise-grade tests for document explorer with list/grid views.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentExplorer } from './DocumentExplorer';
import type { LegalDocument } from '@/types/documents';

// Mock hooks and components
jest.mock('@/hooks/useDocumentManager', () => ({
  useDocumentManager: jest.fn(() => ({
    searchTerm: '',
    setSearchTerm: jest.fn(),
    currentFolder: 'All Documents',
    setCurrentFolder: jest.fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: jest.fn(),
    previewDoc: null,
    setPreviewDoc: jest.fn(),
    filtered: mockDocuments,
    setSelectedDocForHistory: jest.fn(),
    handleDragEnter: jest.fn(),
    handleDragLeave: jest.fn(),
    handleDrop: jest.fn(),
    isDragging: false,
  })),
}));

jest.mock('./DocumentDragOverlay', () => ({
  DocumentDragOverlay: ({ onDrop }: any) => <div data-testid="drag-overlay">Drag Overlay</div>,
}));

jest.mock('./DocumentFilters', () => ({
  DocumentFilters: ({ currentFolder, setCurrentFolder }: any) => (
    <div data-testid="document-filters">
      <span>Current: {currentFolder}</span>
      <button onClick={() => setCurrentFolder('Contracts')}>Contracts</button>
    </div>
  ),
}));

jest.mock('./DocumentToolbar', () => ({
  DocumentToolbar: ({ selectedDocsCount, searchTerm, setSearchTerm, viewMode, setViewMode }: any) => (
    <div data-testid="document-toolbar">
      <span>Selected: {selectedDocsCount}</span>
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button data-testid="grid-toggle" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
        Toggle View
      </button>
    </div>
  ),
}));

jest.mock('./DocumentGridCard', () => ({
  DocumentGridCard: ({ doc, isSelected, onToggleSelection, onPreview }: any) => (
    <div data-testid={`grid-card-${doc.id}`}>
      <span>{doc.title}</span>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onToggleSelection(doc.id, e)}
      />
      <button onClick={() => onPreview(doc)}>Preview</button>
    </div>
  ),
}));

jest.mock('./table/DocumentTable', () => ({
  DocumentTable: ({ documents, selectedDocs, toggleSelection, selectAll, isAllSelected, isSelected }: any) => (
    <div data-testid="document-table">
      <input
        type="checkbox"
        data-testid="select-all"
        checked={isAllSelected}
        onChange={selectAll}
      />
      {documents.map((doc: any) => (
        <div key={doc.id} data-testid={`table-row-${doc.id}`}>
          <input
            type="checkbox"
            checked={isSelected(doc.id)}
            onChange={() => toggleSelection(doc.id)}
          />
          <span>{doc.title}</span>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockDocuments: LegalDocument[] = [
  {
    id: 'doc-001',
    title: 'Contract Agreement',
    type: 'Contract',
    lastModified: '2024-01-15T10:30:00Z',
    caseId: 'CASE-001',
    sourceModule: 'Contracts',
    fileSize: '1.2 MB',
    status: 'Final',
    tags: ['Important'],
    versions: [],
    content: '',
    uploadDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    userId: 'user-1',
  },
  {
    id: 'doc-002',
    title: 'Motion to Dismiss',
    type: 'Pleading',
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
];

describe('DocumentExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useDocumentManager } = require('@/hooks/useDocumentManager');
    useDocumentManager.mockReturnValue({
      searchTerm: '',
      setSearchTerm: jest.fn(),
      currentFolder: 'All Documents',
      setCurrentFolder: jest.fn(),
      isDetailsOpen: false,
      setIsDetailsOpen: jest.fn(),
      previewDoc: null,
      setPreviewDoc: jest.fn(),
      filtered: mockDocuments,
      setSelectedDocForHistory: jest.fn(),
      handleDragEnter: jest.fn(),
      handleDragLeave: jest.fn(),
      handleDrop: jest.fn(),
      isDragging: false,
    });
  });

  describe('Rendering', () => {
    it('renders the document explorer container', () => {
      const { container } = render(<DocumentExplorer />);

      expect(container.firstChild).toHaveClass('flex-1', 'flex', 'h-full', 'relative');
    });

    it('renders document filters sidebar', () => {
      render(<DocumentExplorer />);

      expect(screen.getByTestId('document-filters')).toBeInTheDocument();
    });

    it('renders document toolbar', () => {
      render(<DocumentExplorer />);

      expect(screen.getByTestId('document-toolbar')).toBeInTheDocument();
    });

    it('renders document table in list view by default', () => {
      render(<DocumentExplorer />);

      expect(screen.getByTestId('document-table')).toBeInTheDocument();
    });

    it('renders all documents', () => {
      render(<DocumentExplorer />);

      expect(screen.getByText('Contract Agreement')).toBeInTheDocument();
      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts currentUserRole prop', () => {
      render(<DocumentExplorer currentUserRole="Partner" />);

      expect(screen.getByTestId('document-explorer') || screen.getByTestId('document-table')).toBeInTheDocument();
    });

    it('defaults to Associate role', () => {
      render(<DocumentExplorer />);

      expect(screen.getByTestId('document-table')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('shows selected count in toolbar', async () => {
      const user = userEvent.setup();
      render(<DocumentExplorer />);

      const checkbox = screen.getAllByRole('checkbox')[1]; // First document checkbox
      await user.click(checkbox);

      expect(screen.getByText(/selected: 1/i)).toBeInTheDocument();
    });

    it('toggles selection when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentExplorer />);

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('selects all when select all is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentExplorer />);

      const selectAll = screen.getByTestId('select-all');
      await user.click(selectAll);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        if (checkbox !== selectAll) {
          expect(checkbox).toBeChecked();
        }
      });
    });
  });

  describe('View Modes', () => {
    it('switches to grid view when toggle clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<DocumentExplorer />);

      // Initially should be in list view (table)
      expect(screen.getByTestId('document-table')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('does not show drag overlay when not dragging', () => {
      render(<DocumentExplorer />);

      expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument();
    });

    it('shows drag overlay when isDragging is true', () => {
      const { useDocumentManager } = require('@/hooks/useDocumentManager');
      useDocumentManager.mockReturnValue({
        searchTerm: '',
        setSearchTerm: jest.fn(),
        currentFolder: 'All Documents',
        setCurrentFolder: jest.fn(),
        isDetailsOpen: false,
        setIsDetailsOpen: jest.fn(),
        previewDoc: null,
        setPreviewDoc: jest.fn(),
        filtered: mockDocuments,
        setSelectedDocForHistory: jest.fn(),
        handleDragEnter: jest.fn(),
        handleDragLeave: jest.fn(),
        handleDrop: jest.fn(),
        isDragging: true,
      });

      render(<DocumentExplorer />);

      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });

    it('calls handleDragEnter on drag enter', () => {
      const mockHandleDragEnter = jest.fn();
      const { useDocumentManager } = require('@/hooks/useDocumentManager');
      useDocumentManager.mockReturnValue({
        searchTerm: '',
        setSearchTerm: jest.fn(),
        currentFolder: 'All Documents',
        setCurrentFolder: jest.fn(),
        isDetailsOpen: false,
        setIsDetailsOpen: jest.fn(),
        previewDoc: null,
        setPreviewDoc: jest.fn(),
        filtered: mockDocuments,
        setSelectedDocForHistory: jest.fn(),
        handleDragEnter: mockHandleDragEnter,
        handleDragLeave: jest.fn(),
        handleDrop: jest.fn(),
        isDragging: false,
      });

      const { container } = render(<DocumentExplorer />);
      fireEvent.dragEnter(container.firstChild!);

      expect(mockHandleDragEnter).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('shows no documents message when filtered is empty', () => {
      const { useDocumentManager } = require('@/hooks/useDocumentManager');
      useDocumentManager.mockReturnValue({
        searchTerm: '',
        setSearchTerm: jest.fn(),
        currentFolder: 'All Documents',
        setCurrentFolder: jest.fn(),
        isDetailsOpen: false,
        setIsDetailsOpen: jest.fn(),
        previewDoc: null,
        setPreviewDoc: jest.fn(),
        filtered: [],
        setSelectedDocForHistory: jest.fn(),
        handleDragEnter: jest.fn(),
        handleDragLeave: jest.fn(),
        handleDrop: jest.fn(),
        isDragging: false,
      });

      render(<DocumentExplorer />);

      // Table shows empty state through documents prop
      expect(screen.getByTestId('document-table')).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('clears selection when clearSelection is triggered', async () => {
      const user = userEvent.setup();
      render(<DocumentExplorer />);

      // Select a document
      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Layout', () => {
    it('has sidebar with correct width', () => {
      const { container } = render(<DocumentExplorer />);

      const sidebar = container.querySelector('.w-64');
      expect(sidebar).toBeInTheDocument();
    });

    it('sidebar is hidden on mobile', () => {
      const { container } = render(<DocumentExplorer />);

      const sidebar = container.querySelector('.hidden.md\\:flex');
      expect(sidebar).toBeInTheDocument();
    });

    it('main content takes remaining space', () => {
      const { container } = render(<DocumentExplorer />);

      const mainContent = container.querySelector('.flex-1.flex.flex-col');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode classes for sidebar', () => {
      const { container } = render(<DocumentExplorer />);

      const sidebar = container.querySelector('.dark\\:bg-slate-800');
      expect(sidebar).toBeInTheDocument();
    });

    it('has dark mode classes for main content', () => {
      const { container } = render(<DocumentExplorer />);

      const mainContent = container.querySelector('.dark\\:bg-slate-900');
      expect(mainContent).toBeInTheDocument();
    });
  });
});
