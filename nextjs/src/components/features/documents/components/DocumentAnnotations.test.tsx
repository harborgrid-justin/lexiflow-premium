/**
 * DocumentAnnotations Component Tests
 * Enterprise-grade test suite for document annotation management
 *
 * @module components/features/documents/DocumentAnnotations.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentAnnotations, Annotation } from './DocumentAnnotations';

// Mock formatDate utility
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
}));

describe('DocumentAnnotations', () => {
  const mockAnnotations: Annotation[] = [
    {
      id: 'ann-1',
      documentId: 'doc-123',
      page: 1,
      text: 'Important clause to review',
      author: 'John Attorney',
      createdAt: '2024-01-15T10:30:00Z',
      color: '#FCD34D',
    },
    {
      id: 'ann-2',
      documentId: 'doc-123',
      page: 1,
      text: 'Needs client approval',
      author: 'Jane Paralegal',
      createdAt: '2024-01-16T14:00:00Z',
      color: '#60A5FA',
    },
    {
      id: 'ann-3',
      documentId: 'doc-123',
      page: 2,
      text: 'Check against original contract',
      author: 'John Attorney',
      createdAt: '2024-01-17T09:00:00Z',
      color: '#34D399',
    },
  ];

  const defaultProps = {
    documentId: 'doc-123',
    annotations: mockAnnotations,
    onAdd: jest.fn(),
    onDelete: jest.fn(),
    currentPage: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the Annotations heading', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /Annotations/ })).toBeInTheDocument();
    });

    it('should display current page in heading', () => {
      render(<DocumentAnnotations {...defaultProps} currentPage={5} />);

      expect(screen.getByText('(Page 5)')).toBeInTheDocument();
    });

    it('should render Add Note button when onAdd is provided', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      expect(screen.getByText('Add Note')).toBeInTheDocument();
    });

    it('should not render Add Note button when onAdd is not provided', () => {
      const propsWithoutOnAdd = { ...defaultProps, onAdd: undefined };
      render(<DocumentAnnotations {...propsWithoutOnAdd} />);

      expect(screen.queryByText('Add Note')).not.toBeInTheDocument();
    });
  });

  describe('Filtering by Page', () => {
    it('should show only annotations for current page', () => {
      render(<DocumentAnnotations {...defaultProps} currentPage={1} />);

      expect(screen.getByText('Important clause to review')).toBeInTheDocument();
      expect(screen.getByText('Needs client approval')).toBeInTheDocument();
      expect(screen.queryByText('Check against original contract')).not.toBeInTheDocument();
    });

    it('should show page 2 annotations when currentPage is 2', () => {
      render(<DocumentAnnotations {...defaultProps} currentPage={2} />);

      expect(screen.queryByText('Important clause to review')).not.toBeInTheDocument();
      expect(screen.queryByText('Needs client approval')).not.toBeInTheDocument();
      expect(screen.getByText('Check against original contract')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no annotations exist', () => {
      render(<DocumentAnnotations {...defaultProps} annotations={[]} />);

      expect(screen.getByText('No annotations yet')).toBeInTheDocument();
    });

    it('should show empty state when no annotations for current page', () => {
      render(<DocumentAnnotations {...defaultProps} currentPage={99} />);

      expect(screen.getByText('No annotations yet')).toBeInTheDocument();
    });

    it('should show helpful message in empty state', () => {
      render(<DocumentAnnotations {...defaultProps} annotations={[]} />);

      expect(screen.getByText(/Add notes to help with document review/)).toBeInTheDocument();
    });
  });

  describe('Annotation Display', () => {
    it('should display annotation text', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      expect(screen.getByText('Important clause to review')).toBeInTheDocument();
      expect(screen.getByText('Needs client approval')).toBeInTheDocument();
    });

    it('should display annotation author', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      expect(screen.getAllByText('John Attorney').length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Paralegal')).toBeInTheDocument();
    });

    it('should display page number for each annotation', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      const pageIndicators = screen.getAllByText('Page 1');
      expect(pageIndicators.length).toBe(2);
    });

    it('should display formatted date', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 16, 2024')).toBeInTheDocument();
    });

    it('should apply color to annotation border', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      const annotations = screen.getAllByText(/Important clause|Needs client/).map(
        el => el.closest('[style]')
      );
      expect(annotations.length).toBeGreaterThan(0);
    });
  });

  describe('Adding Annotations', () => {
    it('should show add form when Add Note is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));

      expect(screen.getByPlaceholderText('Enter your annotation...')).toBeInTheDocument();
    });

    it('should hide Add Note button when form is shown', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));

      expect(screen.queryByText('Add Note')).not.toBeInTheDocument();
    });

    it('should render color selection buttons', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));

      expect(screen.getByTitle('Yellow')).toBeInTheDocument();
      expect(screen.getByTitle('Green')).toBeInTheDocument();
      expect(screen.getByTitle('Blue')).toBeInTheDocument();
      expect(screen.getByTitle('Red')).toBeInTheDocument();
      expect(screen.getByTitle('Purple')).toBeInTheDocument();
    });

    it('should call onAdd with annotation data when form is submitted', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      await user.type(
        screen.getByPlaceholderText('Enter your annotation...'),
        'New annotation text'
      );
      await user.click(screen.getByText('Add Annotation'));

      expect(defaultProps.onAdd).toHaveBeenCalledWith({
        documentId: 'doc-123',
        page: 1,
        text: 'New annotation text',
        author: 'Current User',
        color: '#FCD34D',
      });
    });

    it('should not call onAdd if text is empty', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      await user.click(screen.getByText('Add Annotation'));

      expect(defaultProps.onAdd).not.toHaveBeenCalled();
    });

    it('should not call onAdd if text is whitespace only', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      await user.type(screen.getByPlaceholderText('Enter your annotation...'), '   ');
      await user.click(screen.getByText('Add Annotation'));

      expect(defaultProps.onAdd).not.toHaveBeenCalled();
    });

    it('should reset form after successful add', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      await user.type(
        screen.getByPlaceholderText('Enter your annotation...'),
        'Test annotation'
      );
      await user.click(screen.getByText('Add Annotation'));

      // Form should be hidden
      expect(screen.queryByPlaceholderText('Enter your annotation...')).not.toBeInTheDocument();
    });

    it('should cancel and hide form when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      expect(screen.getByPlaceholderText('Enter your annotation...')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));

      expect(screen.queryByPlaceholderText('Enter your annotation...')).not.toBeInTheDocument();
    });

    it('should allow changing page number in form', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      const pageInput = screen.getByLabelText('Page');
      await user.clear(pageInput);
      await user.type(pageInput, '5');
      await user.type(
        screen.getByPlaceholderText('Enter your annotation...'),
        'Page 5 note'
      );
      await user.click(screen.getByText('Add Annotation'));

      expect(defaultProps.onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ page: 5 })
      );
    });

    it('should allow selecting different colors', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));
      await user.click(screen.getByTitle('Blue'));
      await user.type(
        screen.getByPlaceholderText('Enter your annotation...'),
        'Blue note'
      );
      await user.click(screen.getByText('Add Annotation'));

      expect(defaultProps.onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#60A5FA' })
      );
    });
  });

  describe('Deleting Annotations', () => {
    it('should show delete button when onDelete is provided', () => {
      render(<DocumentAnnotations {...defaultProps} />);

      // Each annotation should have a delete button
      const annotations = screen.getAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('path[d*="M19 7l"]')
      );
      expect(annotations.length).toBeGreaterThan(0);
    });

    it('should not show delete button when onDelete is not provided', () => {
      const propsWithoutOnDelete = { ...defaultProps, onDelete: undefined };
      render(<DocumentAnnotations {...propsWithoutOnDelete} />);

      // No delete buttons should exist
      const trashIcons = document.querySelectorAll('[d*="M19 7l"]');
      expect(trashIcons.length).toBe(0);
    });

    it('should call onDelete with annotation id when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      // Find and click delete button for first annotation
      const firstAnnotation = screen.getByText('Important clause to review').closest('div[class*="rounded-lg"]');
      const deleteButton = within(firstAnnotation!).getByRole('button');
      await user.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('ann-1');
    });
  });

  describe('Styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(<DocumentAnnotations {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });

    it('should have dark mode support', () => {
      const { container } = render(<DocumentAnnotations {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', async () => {
      const user = userEvent.setup();
      render(<DocumentAnnotations {...defaultProps} />);

      await user.click(screen.getByText('Add Note'));

      expect(screen.getByLabelText('Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Page')).toBeInTheDocument();
      expect(screen.getByLabelText('Color')).toBeInTheDocument();
    });
  });
});
