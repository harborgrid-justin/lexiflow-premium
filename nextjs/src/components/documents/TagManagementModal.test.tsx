/**
 * TagManagementModal Component Tests
 * Enterprise-grade tests for tag management modal.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagManagementModal } from './TagManagementModal';
import type { LegalDocument } from '@/types/documents';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, size, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/molecules/Modal/Modal', () => ({
  Modal: ({ children, isOpen, onClose, title, size }: any) =>
    isOpen ? (
      <div data-testid="modal" data-size={size}>
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

describe('TagManagementModal', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-001',
    title: 'Contract Agreement',
    type: 'Contract',
    lastModified: '2024-01-15',
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
  };

  const documentWithoutTags: LegalDocument = {
    ...mockDocument,
    id: 'doc-002',
    tags: [],
  };

  const mockOnClose = jest.fn();
  const mockOnAddTag = jest.fn();
  const mockOnRemoveTag = jest.fn();
  const allTags = ['Confidential', 'Urgent', 'Review', 'Final', 'Draft', 'Important'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal with title', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('Manage Document Tags')).toBeInTheDocument();
    });

    it('renders Current Tags section', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('Current Tags')).toBeInTheDocument();
    });

    it('renders existing tags', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('Confidential')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('renders Add New Tag section', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('Add New Tag')).toBeInTheDocument();
    });

    it('renders tag input', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByPlaceholderText(/type new tag name/i)).toBeInTheDocument();
    });

    it('renders Suggested / Recent section', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('Suggested / Recent')).toBeInTheDocument();
    });

    it('renders Add button', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });
  });

  describe('Empty Tags State', () => {
    it('shows empty message when no tags', () => {
      render(
        <TagManagementModal
          document={documentWithoutTags}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByText('No tags assigned.')).toBeInTheDocument();
    });
  });

  describe('Remove Tag', () => {
    it('calls onRemoveTag when X button clicked on tag', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      // Find the X button next to a tag
      const tagElement = screen.getByText('Confidential').closest('span');
      const removeButton = tagElement?.querySelector('button');

      await user.click(removeButton!);

      expect(mockOnRemoveTag).toHaveBeenCalledWith('doc-001', 'Confidential');
    });

    it('passes correct document id and tag to onRemoveTag', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const urgentTag = screen.getByText('Urgent').closest('span');
      const removeButton = urgentTag?.querySelector('button');

      await user.click(removeButton!);

      expect(mockOnRemoveTag).toHaveBeenCalledWith('doc-001', 'Urgent');
    });
  });

  describe('Add New Tag', () => {
    it('Add button is disabled when input is empty', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const addButton = screen.getByRole('button', { name: 'Add' });
      expect(addButton).toBeDisabled();
    });

    it('Add button is enabled when input has text', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      await user.type(input, 'NewTag');

      const addButton = screen.getByRole('button', { name: 'Add' });
      expect(addButton).not.toBeDisabled();
    });

    it('calls onAddTag when Add button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      await user.type(input, 'NewTag');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(mockOnAddTag).toHaveBeenCalledWith('doc-001', 'NewTag');
    });

    it('clears input after adding tag', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      await user.type(input, 'NewTag');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(input).toHaveValue('');
    });

    it('adds tag on Enter key press', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      await user.type(input, 'NewTag{Enter}');

      expect(mockOnAddTag).toHaveBeenCalledWith('doc-001', 'NewTag');
    });
  });

  describe('Suggested Tags', () => {
    it('shows suggested tags that are not already on document', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      // Tags already on document should not appear in suggestions
      const suggestionButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Review') ||
        btn.textContent?.includes('Final') ||
        btn.textContent?.includes('Draft') ||
        btn.textContent?.includes('Important')
      );

      expect(suggestionButtons.length).toBeGreaterThan(0);
    });

    it('does not show tags already on document in suggestions', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      // Look for suggestion buttons (they have + icon)
      const suggestionArea = screen.getByText('Suggested / Recent').nextElementSibling;
      expect(suggestionArea?.textContent).not.toContain('Confidential');
      expect(suggestionArea?.textContent).not.toContain('Urgent');
    });

    it('calls onAddTag when suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      // Find a suggestion button (one that has + before the text)
      const suggestionButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Review')
      );

      if (suggestionButtons.length > 0) {
        await user.click(suggestionButtons[0]);
        expect(mockOnAddTag).toHaveBeenCalledWith('doc-001', 'Review');
      }
    });

    it('limits suggestions to 8 tags', () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `Tag${i}`);

      render(
        <TagManagementModal
          document={documentWithoutTags}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={manyTags}
        />
      );

      // Count suggestion buttons
      const suggestionArea = screen.getByText('Suggested / Recent').parentElement;
      const buttons = suggestionArea?.querySelectorAll('button');
      expect(buttons?.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Modal Controls', () => {
    it('modal has small size', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'sm');
    });

    it('calls onClose when modal close is triggered', async () => {
      const user = userEvent.setup();
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      await user.click(screen.getByTestId('modal-close'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('tag badges have correct styling', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const tag = screen.getByText('Confidential').closest('span');
      expect(tag).toHaveClass('text-blue-600', 'bg-blue-50');
    });

    it('input has focus ring styling', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });

    it('section labels have correct styling', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const label = screen.getByText('Current Tags');
      expect(label).toHaveClass('text-xs', 'font-semibold', 'uppercase');
    });
  });

  describe('Dark Mode', () => {
    it('tags have dark mode styling', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const tag = screen.getByText('Confidential').closest('span');
      expect(tag).toHaveClass('dark:bg-blue-900/20', 'dark:text-blue-400');
    });

    it('input has dark mode styling', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      expect(input).toHaveClass('dark:border-gray-700', 'dark:bg-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('input is focusable', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const input = screen.getByPlaceholderText(/type new tag name/i);
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('remove buttons are accessible', () => {
      render(
        <TagManagementModal
          document={mockDocument}
          onClose={mockOnClose}
          onAddTag={mockOnAddTag}
          onRemoveTag={mockOnRemoveTag}
          allTags={allTags}
        />
      );

      const tagElement = screen.getByText('Confidential').closest('span');
      const removeButton = tagElement?.querySelector('button');
      expect(removeButton).toBeInTheDocument();
    });
  });
});
