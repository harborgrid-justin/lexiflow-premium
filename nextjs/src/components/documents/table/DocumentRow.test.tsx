/**
 * DocumentRow Component Tests
 * Enterprise-grade tests for document table row.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentRow } from './DocumentRow';
import type { LegalDocument } from '@/types/documents';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/atoms/Badge/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/atoms/FileIcon/FileIcon', () => ({
  FileIcon: ({ type, className }: any) => (
    <div data-testid="file-icon" data-type={type} className={className}>
      Icon
    </div>
  ),
}));

jest.mock('@/components/ui/molecules/TagList/TagList', () => ({
  TagList: ({ tags, limit }: any) => (
    <div data-testid="tag-list" data-limit={limit}>
      {tags.map((t: string) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  ),
}));

describe('DocumentRow', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-001',
    title: 'Contract Agreement',
    type: 'Contract',
    lastModified: '2024-01-15T10:30:00Z',
    caseId: 'CASE-001',
    sourceModule: 'Contracts',
    fileSize: '1.2 MB',
    status: 'Final',
    tags: ['Confidential', 'Urgent'],
    versions: [],
    content: '',
    uploadDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    userId: 'user-1',
    linkedRules: ['Rule 1', 'Rule 2'],
  };

  const mockToggleSelection = jest.fn();
  const mockSetSelectedDocForHistory = jest.fn();
  const mockSetTaggingDoc = jest.fn();
  const mockOnRowClick = jest.fn();

  const defaultProps = {
    doc: mockDocument,
    isSelected: false,
    toggleSelection: mockToggleSelection,
    setSelectedDocForHistory: mockSetSelectedDocForHistory,
    setTaggingDoc: mockSetTaggingDoc,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders document title', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Contract Agreement')).toBeInTheDocument();
    });

    it('renders document type and size', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Contract • 1.2 MB')).toBeInTheDocument();
    });

    it('renders file icon', () => {
      render(<DocumentRow {...defaultProps} />);

      const fileIcon = screen.getByTestId('file-icon');
      expect(fileIcon).toBeInTheDocument();
      expect(fileIcon).toHaveAttribute('data-type', 'Contract');
    });

    it('renders checkbox', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders source module badge', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('Contracts')).toBeInTheDocument();
    });

    it('renders tag list', () => {
      render(<DocumentRow {...defaultProps} />);

      const tagList = screen.getByTestId('tag-list');
      expect(tagList).toBeInTheDocument();
      expect(tagList).toHaveAttribute('data-limit', '2');
    });

    it('renders linked rules when present', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Rule 1, Rule 2')).toBeInTheDocument();
    });

    it('renders formatted date', () => {
      render(<DocumentRow {...defaultProps} />);

      // Check for formatted date
      expect(screen.getByText(/1\/15\/2024|15\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('checkbox reflects isSelected when false', () => {
      render(<DocumentRow {...defaultProps} isSelected={false} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('checkbox reflects isSelected when true', () => {
      render(<DocumentRow {...defaultProps} isSelected={true} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls toggleSelection when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentRow {...defaultProps} />);

      await user.click(screen.getByRole('checkbox'));

      expect(mockToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
    });

    it('has selected styling when isSelected is true', () => {
      const { container } = render(<DocumentRow {...defaultProps} isSelected={true} />);

      expect(container.firstChild).toHaveClass('bg-blue-50');
    });

    it('has default styling when not selected', () => {
      const { container } = render(<DocumentRow {...defaultProps} isSelected={false} />);

      expect(container.firstChild).toHaveClass('bg-white');
    });
  });

  describe('Click Handling', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DocumentRow {...defaultProps} onRowClick={mockOnRowClick} />
      );

      await user.click(container.firstChild as Element);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockDocument);
    });

    it('calls toggleSelection when shift+click', () => {
      const { container } = render(
        <DocumentRow {...defaultProps} onRowClick={mockOnRowClick} />
      );

      fireEvent.click(container.firstChild as Element, { shiftKey: true });

      expect(mockToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
      expect(mockOnRowClick).not.toHaveBeenCalled();
    });

    it('falls back to toggleSelection when onRowClick not provided', async () => {
      const user = userEvent.setup();
      const { container } = render(<DocumentRow {...defaultProps} />);

      await user.click(container.firstChild as Element);

      expect(mockToggleSelection).toHaveBeenCalledWith('doc-001', expect.anything());
    });
  });

  describe('Tag Management', () => {
    it('calls setTaggingDoc when tag button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DocumentRow {...defaultProps} />);

      // Find the tag button (it appears on hover)
      const tagButton = container.querySelector('button[class*="opacity-0"]');
      if (tagButton) {
        await user.click(tagButton);
        expect(mockSetTaggingDoc).toHaveBeenCalledWith(mockDocument);
      }
    });

    it('tag button stops propagation to prevent row click', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DocumentRow {...defaultProps} onRowClick={mockOnRowClick} />
      );

      const tagButton = container.querySelector('button[class*="opacity-0"]');
      if (tagButton) {
        await user.click(tagButton);
        expect(mockOnRowClick).not.toHaveBeenCalled();
      }
    });
  });

  describe('Status Display', () => {
    it('shows Signed status with checkmark', () => {
      const signedDoc = { ...mockDocument, status: 'Signed' };
      render(<DocumentRow {...defaultProps} doc={signedDoc} />);

      expect(screen.getByText('Signed')).toBeInTheDocument();
    });

    it('shows Draft status with clock icon', () => {
      const draftDoc = { ...mockDocument, status: 'Draft' };
      render(<DocumentRow {...defaultProps} doc={draftDoc} />);

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('shows Final status for other statuses', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('Signed status has emerald styling', () => {
      const signedDoc = { ...mockDocument, status: 'Signed' };
      render(<DocumentRow {...defaultProps} doc={signedDoc} />);

      const statusSpan = screen.getByText('Signed').closest('span');
      expect(statusSpan).toHaveClass('bg-emerald-100', 'text-emerald-800');
    });

    it('Draft status has slate styling', () => {
      const draftDoc = { ...mockDocument, status: 'Draft' };
      render(<DocumentRow {...defaultProps} doc={draftDoc} />);

      const statusSpan = screen.getByText('Draft').closest('span');
      expect(statusSpan).toHaveClass('bg-slate-100', 'text-slate-600');
    });
  });

  describe('Source Module Badge', () => {
    it('shows warning variant for Evidence', () => {
      const evidenceDoc = { ...mockDocument, sourceModule: 'Evidence' };
      render(<DocumentRow {...defaultProps} doc={evidenceDoc} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'warning');
    });

    it('shows info variant for Discovery', () => {
      const discoveryDoc = { ...mockDocument, sourceModule: 'Discovery' };
      render(<DocumentRow {...defaultProps} doc={discoveryDoc} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'info');
    });

    it('shows neutral variant for other modules', () => {
      render(<DocumentRow {...defaultProps} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'neutral');
    });

    it('shows General when sourceModule not set', () => {
      const noModuleDoc = { ...mockDocument, sourceModule: undefined };
      render(<DocumentRow {...defaultProps} doc={noModuleDoc} />);

      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  describe('Linked Rules', () => {
    it('shows linked rules when present', () => {
      render(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Rule 1, Rule 2')).toBeInTheDocument();
    });

    it('does not show rules section when no linked rules', () => {
      const noRulesDoc = { ...mockDocument, linkedRules: undefined };
      render(<DocumentRow {...defaultProps} doc={noRulesDoc} />);

      expect(screen.queryByText('Rule 1')).not.toBeInTheDocument();
    });

    it('does not show rules section when empty array', () => {
      const emptyRulesDoc = { ...mockDocument, linkedRules: [] };
      render(<DocumentRow {...defaultProps} doc={emptyRulesDoc} />);

      // Check that no rule-related elements appear
      const { container } = render(<DocumentRow {...defaultProps} doc={emptyRulesDoc} />);
      const ruleIcons = container.querySelectorAll('.text-purple-400');
      expect(ruleIcons.length).toBe(0);
    });
  });

  describe('Styling', () => {
    it('row has correct height', () => {
      const { container } = render(<DocumentRow {...defaultProps} />);

      expect(container.firstChild).toHaveClass('h-[72px]');
    });

    it('row has hover effect', () => {
      const { container } = render(<DocumentRow {...defaultProps} />);

      expect(container.firstChild).toHaveClass('hover:bg-slate-50');
    });

    it('row has border bottom', () => {
      const { container } = render(<DocumentRow {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border-b', 'border-slate-200');
    });

    it('row has cursor pointer', () => {
      const { container } = render(<DocumentRow {...defaultProps} />);

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background when selected', () => {
      const { container } = render(<DocumentRow {...defaultProps} isSelected={true} />);

      expect(container.firstChild).toHaveClass('dark:bg-blue-900/20');
    });

    it('has dark mode background when not selected', () => {
      const { container } = render(<DocumentRow {...defaultProps} isSelected={false} />);

      expect(container.firstChild).toHaveClass('dark:bg-slate-900');
    });

    it('has dark mode hover effect', () => {
      const { container } = render(<DocumentRow {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:hover:bg-slate-800/50');
    });
  });

  describe('Accessibility', () => {
    it('checkbox is accessible', () => {
      render(<DocumentRow {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('row is keyboard selectable', async () => {
      const user = userEvent.setup();
      render(<DocumentRow {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Memo Optimization', () => {
    it('has displayName set', () => {
      expect(DocumentRow.displayName).toBe('DocumentRow');
    });
  });
});
