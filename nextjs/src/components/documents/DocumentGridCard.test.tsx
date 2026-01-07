/**
 * DocumentGridCard Component Tests
 * Enterprise-grade tests for document grid card display.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentGridCard } from './DocumentGridCard';
import type { LegalDocument } from '@/types/documents';

// Mock dependencies
jest.mock('@/components/ui/atoms/Badge/Badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/atoms/FileIcon/FileIcon', () => ({
  FileIcon: ({ type, className }: any) => (
    <div data-testid="file-icon" data-type={type} className={className}>
      FileIcon
    </div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DocumentGridCard', () => {
  const mockDocument: LegalDocument = {
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
  };

  const mockOnToggleSelection = jest.fn();
  const mockOnPreview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders document title', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByText('Contract Agreement')).toBeInTheDocument();
    });

    it('renders file icon', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-icon')).toHaveAttribute('data-type', 'Contract');
    });

    it('renders file size', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByText('1.2 MB')).toBeInTheDocument();
    });

    it('renders status badge', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('renders checkbox', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with default fileSize when not provided', () => {
      const docWithoutSize = { ...mockDocument, fileSize: undefined };
      render(
        <DocumentGridCard
          doc={docWithoutSize}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByText('24KB')).toBeInTheDocument();
    });

    it('renders Active as default status when not provided', () => {
      const docWithoutStatus = { ...mockDocument, status: undefined };
      render(
        <DocumentGridCard
          doc={docWithoutStatus}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('checkbox reflects isSelected state when false', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('checkbox reflects isSelected state when true', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={true}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls onToggleSelection when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
    });

    it('checkbox click does not trigger preview', async () => {
      const user = userEvent.setup();
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnPreview).not.toHaveBeenCalled();
    });

    it('has selected styling when isSelected is true', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={true}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('ring-2', 'ring-blue-500');
    });
  });

  describe('Click Handling', () => {
    it('calls onPreview when card is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      await user.click(container.firstChild as Element);

      expect(mockOnPreview).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onToggleSelection when Ctrl+click', async () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      fireEvent.click(container.firstChild as Element, { ctrlKey: true });

      expect(mockOnToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
      expect(mockOnPreview).not.toHaveBeenCalled();
    });

    it('calls onToggleSelection when Meta+click (Mac)', async () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      fireEvent.click(container.firstChild as Element, { metaKey: true });

      expect(mockOnToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
      expect(mockOnPreview).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('has card styling', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('border', 'rounded-lg', 'p-4');
    });

    it('has hover styling', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('hover:shadow-md', 'cursor-pointer');
    });

    it('has transition styling', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('transition-all');
    });

    it('title has truncate class', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      const title = screen.getByText('Contract Agreement');
      expect(title).toHaveClass('truncate');
    });

    it('title has title attribute for full text', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      const title = screen.getByTitle('Contract Agreement');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background classes', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('dark:bg-slate-800');
    });

    it('has dark mode border classes', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('dark:border-slate-700');
    });

    it('has dark mode text classes', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      const title = screen.getByText('Contract Agreement');
      expect(title).toHaveClass('dark:text-slate-100');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long title', () => {
      const longTitleDoc = {
        ...mockDocument,
        title: 'This is a very long document title that should be truncated in the grid view',
      };
      render(
        <DocumentGridCard
          doc={longTitleDoc}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      const title = screen.getByTitle(/This is a very long/);
      expect(title).toHaveClass('truncate');
    });

    it('handles document with different type', () => {
      const pdfDoc = { ...mockDocument, type: 'PDF' };
      render(
        <DocumentGridCard
          doc={pdfDoc}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(screen.getByTestId('file-icon')).toHaveAttribute('data-type', 'PDF');
    });
  });

  describe('Accessibility', () => {
    it('checkbox is focusable', () => {
      render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });

    it('card is clickable', () => {
      const { container } = render(
        <DocumentGridCard
          doc={mockDocument}
          isSelected={false}
          onToggleSelection={mockOnToggleSelection}
          onPreview={mockOnPreview}
        />
      );

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });
  });
});
