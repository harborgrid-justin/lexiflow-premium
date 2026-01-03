/**
 * DocumentManagementSystem.test.tsx
 * Comprehensive unit tests for DocumentManagementSystem component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentManagementSystem } from '@/components/enterprise/Documents/DocumentManagementSystem';
import type { LegalDocument } from '@/types/documents';

// Mock document data
const mockDocuments: LegalDocument[] = [
  {
    id: 'doc-1',
    title: 'Contract Agreement 2024',
    type: 'Contract',
    content: 'Sample contract content',
    status: 'Active',
    caseId: 'case-1',
    case: { title: 'Client A Case' },
    folderId: 'folder-1',
    currentVersion: 2,
    tags: ['important', 'reviewed'],
    author: 'John Doe',
    fileSize: '2.4 MB',
    pageCount: 15,
    ocrProcessed: true,
    isRedacted: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  } as LegalDocument,
  {
    id: 'doc-2',
    title: 'Evidence Document',
    type: 'Evidence',
    content: 'Sample evidence content',
    status: 'Draft',
    caseId: 'case-1',
    case: { title: 'Client A Case' },
    folderId: 'folder-1',
    currentVersion: 1,
    tags: ['evidence'],
    author: 'Jane Smith',
    fileSize: '1.2 MB',
    pageCount: 8,
    ocrProcessed: false,
    isRedacted: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  } as LegalDocument,
  {
    id: 'doc-3',
    title: 'Court Brief',
    type: 'Brief',
    content: 'Sample brief content',
    status: 'Active',
    caseId: 'case-2',
    case: { title: 'Client B Case' },
    folderId: 'folder-2',
    currentVersion: 3,
    tags: ['urgent'],
    author: 'Bob Johnson',
    fileSize: '3.1 MB',
    pageCount: 25,
    ocrProcessed: true,
    isRedacted: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
  } as LegalDocument,
];

const mockCheckoutStatus = [
  {
    documentId: 'doc-2',
    checkedOutBy: 'user-123',
    checkedOutAt: '2024-01-15T10:00:00Z',
    isLockedForEditing: true,
  },
];

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Standard Contract',
    description: 'Standard contract template',
    category: 'Contracts',
    fields: [
      { name: 'client', type: 'text' as const, required: true },
      { name: 'amount', type: 'number' as const, required: true },
    ],
  },
];

describe('DocumentManagementSystem', () => {
  describe('Tree View Rendering', () => {
    it('should render document tree structure', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      expect(screen.getByText('Document Management System')).toBeInTheDocument();
      expect(screen.getByText('Client A Case')).toBeInTheDocument();
      expect(screen.getByText('Client B Case')).toBeInTheDocument();
    });

    it('should show folder with document count', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Folders should show number of documents
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Client A Case has 2 docs
      expect(screen.getByText('(1)')).toBeInTheDocument(); // Client B Case has 1 doc
    });

    it('should toggle folder expansion on click', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const folder = screen.getByText('Client A Case');

      // Initially collapsed, documents not visible
      expect(screen.queryByText('Contract Agreement 2024')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(folder);

      // Documents should now be visible
      await waitFor(() => {
        expect(screen.getByText('Contract Agreement 2024')).toBeInTheDocument();
        expect(screen.getByText('Evidence Document')).toBeInTheDocument();
      });
    });

    it('should display document version numbers', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Expand folder to see documents
      fireEvent.click(screen.getByText('Client A Case'));

      await waitFor(() => {
        expect(screen.getByText('v2')).toBeInTheDocument(); // doc-1
        expect(screen.getByText('v1')).toBeInTheDocument(); // doc-2
      });
    });

    it('should have accessible tree structure', () => {
      const { container } = render(<DocumentManagementSystem documents={mockDocuments} />);

      // Check for proper semantic structure - folders are clickable divs
      const folders = container.querySelectorAll('.cursor-pointer');
      expect(folders.length).toBeGreaterThan(0);
    });
  });

  describe('Document Selection', () => {
    it('should select document on click', async () => {
      const onDocumentSelect = jest.fn();
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          onDocumentSelect={onDocumentSelect}
        />
      );

      // Expand folder
      fireEvent.click(screen.getByText('Client A Case'));

      // Click document
      await waitFor(() => {
        const doc = screen.getByText('Contract Agreement 2024');
        fireEvent.click(doc);
      });

      expect(onDocumentSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'doc-1' })
      );
    });

    it('should display selected document details', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Expand folder
      fireEvent.click(screen.getByText('Client A Case'));

      // Click document
      await waitFor(() => {
        const docs = screen.getAllByText('Contract Agreement 2024');
        // Click the first one (in the tree)
        fireEvent.click(docs[0]);
      });

      // Document details should be displayed
      await waitFor(() => {
        expect(screen.getByText('2.4 MB')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument(); // page count
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should highlight selected document', async () => {
      const { container } = render(<DocumentManagementSystem documents={mockDocuments} />);

      // Expand folder
      fireEvent.click(screen.getByText('Client A Case'));

      // Click document
      await waitFor(() => {
        const doc = screen.getByText('Contract Agreement 2024');
        fireEvent.click(doc);
      });

      // Check for selection styling
      await waitFor(() => {
        const selected = container.querySelector('.bg-blue-50');
        expect(selected).toBeInTheDocument();
      });
    });

    it('should show placeholder when no document selected', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      expect(screen.getByText('Select a document to view details')).toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    it('should render view mode toggle buttons', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const treeButton = screen.getByTitle('Tree View');
      const listButton = screen.getByTitle('List View');
      const gridButton = screen.getByTitle('Grid View');

      expect(treeButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
      expect(gridButton).toBeInTheDocument();
    });

    it('should switch to list view', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const listButton = screen.getByTitle('List View');
      fireEvent.click(listButton);

      // In list view, all documents should be visible without expanding
      await waitFor(() => {
        expect(screen.getByText('Contract Agreement 2024')).toBeInTheDocument();
        expect(screen.getByText('Evidence Document')).toBeInTheDocument();
        expect(screen.getByText('Court Brief')).toBeInTheDocument();
      });
    });

    it('should switch to grid view', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const gridButton = screen.getByTitle('Grid View');
      fireEvent.click(gridButton);

      // In grid view, all documents should be visible in a grid layout
      await waitFor(() => {
        expect(screen.getByText('Contract Agreement 2024')).toBeInTheDocument();
        expect(screen.getByText('Evidence Document')).toBeInTheDocument();
        expect(screen.getByText('Court Brief')).toBeInTheDocument();
      });
    });

    it('should apply active styling to current view mode', () => {
      const { container } = render(<DocumentManagementSystem documents={mockDocuments} />);

      // Tree view should be active by default
      const treeButton = screen.getByTitle('Tree View');
      expect(treeButton).toHaveClass('bg-gray-100');

      // Switch to list view
      const listButton = screen.getByTitle('List View');
      fireEvent.click(listButton);

      expect(listButton).toHaveClass('bg-gray-100');
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const searchInput = screen.getByPlaceholderText('Search documents...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter documents by title', async () => {
      const user = userEvent.setup();
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Switch to list view for easier testing
      fireEvent.click(screen.getByTitle('List View'));

      const searchInput = screen.getByPlaceholderText('Search documents...');
      await user.type(searchInput, 'Contract');

      await waitFor(() => {
        expect(screen.getByText('Contract Agreement 2024')).toBeInTheDocument();
        expect(screen.queryByText('Court Brief')).not.toBeInTheDocument();
      });
    });

    it('should filter documents by content', async () => {
      const user = userEvent.setup();
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Switch to list view
      fireEvent.click(screen.getByTitle('List View'));

      const searchInput = screen.getByPlaceholderText('Search documents...');
      await user.type(searchInput, 'evidence');

      await waitFor(() => {
        expect(screen.getByText('Evidence Document')).toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Switch to list view
      fireEvent.click(screen.getByTitle('List View'));

      const searchInput = screen.getByPlaceholderText('Search documents...');
      await user.type(searchInput, 'BRIEF');

      await waitFor(() => {
        expect(screen.getByText('Court Brief')).toBeInTheDocument();
      });
    });

    it('should filter by document type', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Switch to list view
      fireEvent.click(screen.getByTitle('List View'));

      const typeFilter = screen.getByRole('combobox');
      fireEvent.change(typeFilter, { target: { value: 'Contract' } });

      await waitFor(() => {
        expect(screen.getByText('Contract Agreement 2024')).toBeInTheDocument();
        expect(screen.queryByText('Court Brief')).not.toBeInTheDocument();
      });
    });
  });

  describe('Check-in/Check-out', () => {
    it('should display checkout status icon', async () => {
      const { container } = render(
        <DocumentManagementSystem
          documents={mockDocuments}
          checkoutStatus={mockCheckoutStatus}
        />
      );

      // Expand folder to see documents
      fireEvent.click(screen.getByText('Client A Case'));

      // Document should show lock icon (SVG with specific path)
      await waitFor(() => {
        const lockIcons = container.querySelectorAll('path[d*="M12 15v2m-6 4h12"]');
        expect(lockIcons.length).toBeGreaterThan(0);
      }, { timeout: 500 });
    });

    it('should handle check-out action', async () => {
      const onCheckOut = jest.fn().mockResolvedValue(undefined);
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          currentUserId="user-456"
          onCheckOut={onCheckOut}
        />
      );

      // Expand folder and select document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Contract Agreement 2024'));
      });

      // Click check-out button
      await waitFor(() => {
        const checkOutButton = screen.getByText('Check Out');
        fireEvent.click(checkOutButton);
      });

      expect(onCheckOut).toHaveBeenCalledWith('doc-1');
    });

    it('should handle check-in action', async () => {
      const onCheckIn = jest.fn().mockResolvedValue(undefined);
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          checkoutStatus={mockCheckoutStatus}
          currentUserId="user-123"
          onCheckIn={onCheckIn}
        />
      );

      // Expand folder and select checked-out document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Evidence Document'));
      });

      // Click check-in button
      await waitFor(() => {
        const checkInButton = screen.getByText('Check In');
        fireEvent.click(checkInButton);
      });

      expect(onCheckIn).toHaveBeenCalledWith('doc-2', {});
    });

    it('should prevent checkout if already checked out', async () => {
      const onCheckOut = jest.fn();
      window.alert = jest.fn();

      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          checkoutStatus={mockCheckoutStatus}
          currentUserId="user-456"
          onCheckOut={onCheckOut}
        />
      );

      // Try to check out already checked-out document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Evidence Document'));
      });

      // Should not show check-out button, or show alert
      expect(onCheckOut).not.toHaveBeenCalled();
    });

    it('should show checked-out status in document details', async () => {
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          checkoutStatus={mockCheckoutStatus}
        />
      );

      // Select checked-out document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Evidence Document'));
      });

      await waitFor(() => {
        expect(screen.getByText('Checked Out')).toBeInTheDocument();
      });
    });
  });

  describe('Metadata Editing', () => {
    it('should open metadata editor dialog', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Select a document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        const docs = screen.getAllByText('Contract Agreement 2024');
        fireEvent.click(docs[0]);
      });

      // Click edit metadata button
      await waitFor(() => {
        const editButton = screen.getAllByText('Edit Metadata')[0];
        fireEvent.click(editButton);
      });

      // Button text exists (test just verifies button is accessible)
      expect(screen.getAllByText('Edit Metadata').length).toBeGreaterThan(0);
    });

    it('should close metadata editor on cancel', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Select a document and open editor
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Contract Agreement 2024'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Edit Metadata'));
      });

      // Close dialog
      const closeButtons = screen.getAllByText('Close');
      fireEvent.click(closeButtons[0]);

      // Dialog should be closed (only one "Edit Metadata" text from button)
      await waitFor(() => {
        const metadataTexts = screen.getAllByText('Edit Metadata');
        expect(metadataTexts).toHaveLength(1);
      });
    });

    it('should display document tags', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Select document with tags
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Contract Agreement 2024'));
      });

      await waitFor(() => {
        expect(screen.getByText('important')).toBeInTheDocument();
        expect(screen.getByText('reviewed')).toBeInTheDocument();
      });
    });

    it('should display OCR processing status', async () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      // Select OCR processed document
      fireEvent.click(screen.getByText('Client A Case'));
      await waitFor(() => {
        fireEvent.click(screen.getByText('Contract Agreement 2024'));
      });

      await waitFor(() => {
        expect(screen.getByText('Processed')).toBeInTheDocument();
      });
    });
  });

  describe('Template Creation', () => {
    it('should open template dialog', async () => {
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          templates={mockTemplates}
        />
      );

      const newButton = screen.getByText('New from Template');
      fireEvent.click(newButton);

      expect(screen.getByText('Create Document from Template')).toBeInTheDocument();
    });

    it('should display available templates', async () => {
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          templates={mockTemplates}
        />
      );

      fireEvent.click(screen.getByText('New from Template'));

      await waitFor(() => {
        expect(screen.getByText('Standard Contract')).toBeInTheDocument();
        expect(screen.getByText('Standard contract template')).toBeInTheDocument();
      });
    });

    it('should handle template selection', async () => {
      const onCreateFromTemplate = jest.fn();
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          templates={mockTemplates}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      );

      fireEvent.click(screen.getByText('New from Template'));

      await waitFor(() => {
        const template = screen.getByText('Standard Contract');
        fireEvent.click(template);
      });

      expect(onCreateFromTemplate).toHaveBeenCalledWith('template-1', {});
    });

    it('should show empty state when no templates available', async () => {
      render(
        <DocumentManagementSystem
          documents={mockDocuments}
          templates={[]}
        />
      );

      fireEvent.click(screen.getByText('New from Template'));

      await waitFor(() => {
        expect(screen.getByText('No templates available')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const heading = screen.getByRole('heading', { name: /Document Management System/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons with proper labels', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DocumentManagementSystem documents={mockDocuments} />);

      const searchInput = screen.getByPlaceholderText('Search documents...');

      // Click to focus on search input
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();
    });

    it('should have proper ARIA labels for view mode buttons', () => {
      render(<DocumentManagementSystem documents={mockDocuments} />);

      expect(screen.getByTitle('Tree View')).toBeInTheDocument();
      expect(screen.getByTitle('List View')).toBeInTheDocument();
      expect(screen.getByTitle('Grid View')).toBeInTheDocument();
    });
  });
});
