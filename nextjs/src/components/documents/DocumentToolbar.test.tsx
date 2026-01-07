/**
 * DocumentToolbar Component Tests
 * Enterprise-grade tests for document toolbar with search and view controls.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentToolbar } from './DocumentToolbar';

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DocumentToolbar', () => {
  const defaultProps = {
    selectedDocsCount: 0,
    searchTerm: '',
    setSearchTerm: jest.fn(),
    viewMode: 'list' as const,
    setViewMode: jest.fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: jest.fn(),
    isProcessingAI: false,
    onBulkSummarize: jest.fn(),
    onClearSelection: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Mode (No Selection)', () => {
    it('renders search input when no documents selected', () => {
      render(<DocumentToolbar {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search by name, tag, or content/i)).toBeInTheDocument();
    });

    it('search input reflects searchTerm prop', () => {
      render(<DocumentToolbar {...defaultProps} searchTerm="contract" />);

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue('contract');
    });

    it('calls setSearchTerm when typing in search', async () => {
      const user = userEvent.setup();
      render(<DocumentToolbar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test');

      expect(defaultProps.setSearchTerm).toHaveBeenCalled();
    });

    it('search input has focus styling', () => {
      render(<DocumentToolbar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });

    it('search icon is present', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      const searchIcon = container.querySelector('.absolute.left-3');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Selection Mode', () => {
    const selectionProps = {
      ...defaultProps,
      selectedDocsCount: 3,
    };

    it('shows selection count when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      expect(screen.getByText('3 Selected')).toBeInTheDocument();
    });

    it('hides search input when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it('shows Compare button when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      const compareButton = screen.getByTitle('Compare');
      expect(compareButton).toBeInTheDocument();
    });

    it('shows Summarize button when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      const summarizeButton = screen.getByTitle('Summarize');
      expect(summarizeButton).toBeInTheDocument();
    });

    it('shows Tag button when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      const tagButton = screen.getByTitle('Tag');
      expect(tagButton).toBeInTheDocument();
    });

    it('shows Clear button when documents selected', () => {
      render(<DocumentToolbar {...selectionProps} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('calls onClearSelection when Clear is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentToolbar {...selectionProps} />);

      await user.click(screen.getByText('Clear'));

      expect(selectionProps.onClearSelection).toHaveBeenCalled();
    });

    it('calls onBulkSummarize when Summarize is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentToolbar {...selectionProps} />);

      await user.click(screen.getByTitle('Summarize'));

      expect(selectionProps.onBulkSummarize).toHaveBeenCalled();
    });

    it('selection bar has blue styling', () => {
      const { container } = render(<DocumentToolbar {...selectionProps} />);

      const selectionBar = container.querySelector('.bg-blue-50');
      expect(selectionBar).toBeInTheDocument();
    });
  });

  describe('AI Processing State', () => {
    it('shows loading indicator when processing AI', () => {
      render(
        <DocumentToolbar
          {...defaultProps}
          selectedDocsCount={2}
          isProcessingAI={true}
        />
      );

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('loading indicator has spin animation', () => {
      const { container } = render(
        <DocumentToolbar
          {...defaultProps}
          selectedDocsCount={2}
          isProcessingAI={true}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('renders list view button', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      // List icon should be present
      const listButton = container.querySelector('button');
      expect(listButton).toBeInTheDocument();
    });

    it('renders grid view button', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      const buttons = container.querySelectorAll('.rounded-md');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('list view is active when viewMode is list', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} viewMode="list" />);

      const activeButton = container.querySelector('.shadow.text-blue-600');
      expect(activeButton).toBeInTheDocument();
    });

    it('grid view is active when viewMode is grid', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} viewMode="grid" />);

      const activeButton = container.querySelector('.shadow.text-blue-600');
      expect(activeButton).toBeInTheDocument();
    });

    it('calls setViewMode with list when list button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DocumentToolbar {...defaultProps} viewMode="grid" />);

      const buttons = container.querySelectorAll('.p-1\\.5.rounded-md');
      await user.click(buttons[0]); // List button

      expect(defaultProps.setViewMode).toHaveBeenCalledWith('list');
    });

    it('calls setViewMode with grid when grid button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DocumentToolbar {...defaultProps} viewMode="list" />);

      const buttons = container.querySelectorAll('.p-1\\.5.rounded-md');
      await user.click(buttons[1]); // Grid button

      expect(defaultProps.setViewMode).toHaveBeenCalledWith('grid');
    });
  });

  describe('Details Toggle', () => {
    it('renders details toggle button', () => {
      render(<DocumentToolbar {...defaultProps} />);

      expect(screen.getByTitle('Toggle Details')).toBeInTheDocument();
    });

    it('calls setIsDetailsOpen when clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentToolbar {...defaultProps} />);

      await user.click(screen.getByTitle('Toggle Details'));

      expect(defaultProps.setIsDetailsOpen).toHaveBeenCalledWith(true);
    });

    it('toggles isDetailsOpen state', async () => {
      const user = userEvent.setup();
      render(<DocumentToolbar {...defaultProps} isDetailsOpen={true} />);

      await user.click(screen.getByTitle('Toggle Details'));

      expect(defaultProps.setIsDetailsOpen).toHaveBeenCalledWith(false);
    });

    it('has active styling when details open', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} isDetailsOpen={true} />);

      const detailsButton = screen.getByTitle('Toggle Details');
      expect(detailsButton).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('has inactive styling when details closed', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} isDetailsOpen={false} />);

      const detailsButton = screen.getByTitle('Toggle Details');
      expect(detailsButton).toHaveClass('bg-white', 'border-slate-200');
    });
  });

  describe('Layout', () => {
    it('toolbar has correct height', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      expect(container.firstChild).toHaveClass('h-14');
    });

    it('toolbar has border bottom', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border-b');
    });

    it('toolbar has flex layout', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      expect(container.firstChild).toHaveClass('flex', 'justify-between', 'items-center');
    });

    it('view controls are separated with border', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      const separator = container.querySelector('.border-l.border-slate-200');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('search input has dark mode classes', () => {
      render(<DocumentToolbar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveClass('dark:bg-slate-800', 'dark:text-slate-100');
    });

    it('toolbar has dark mode background', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:bg-slate-900');
    });

    it('view mode buttons have dark mode classes', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} viewMode="list" />);

      const activeButton = container.querySelector('.dark\\:bg-slate-700');
      expect(activeButton).toBeInTheDocument();
    });

    it('details toggle has dark mode hover', () => {
      render(<DocumentToolbar {...defaultProps} />);

      const detailsButton = screen.getByTitle('Toggle Details');
      expect(detailsButton).toHaveClass('dark:hover:bg-slate-800');
    });
  });

  describe('Accessibility', () => {
    it('search input is accessible', () => {
      render(<DocumentToolbar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveAttribute('type', undefined); // Default text
    });

    it('buttons have title attributes', () => {
      render(<DocumentToolbar {...defaultProps} selectedDocsCount={1} />);

      expect(screen.getByTitle('Compare')).toBeInTheDocument();
      expect(screen.getByTitle('Summarize')).toBeInTheDocument();
      expect(screen.getByTitle('Tag')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle Details')).toBeInTheDocument();
    });

    it('view toggle buttons are keyboard accessible', () => {
      const { container } = render(<DocumentToolbar {...defaultProps} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single document selection', () => {
      render(<DocumentToolbar {...defaultProps} selectedDocsCount={1} />);

      expect(screen.getByText('1 Selected')).toBeInTheDocument();
    });

    it('handles large selection count', () => {
      render(<DocumentToolbar {...defaultProps} selectedDocsCount={999} />);

      expect(screen.getByText('999 Selected')).toBeInTheDocument();
    });

    it('handles empty search term', () => {
      render(<DocumentToolbar {...defaultProps} searchTerm="" />);

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue('');
    });

    it('handles long search term', () => {
      const longSearch = 'This is a very long search term that tests the input';
      render(<DocumentToolbar {...defaultProps} searchTerm={longSearch} />);

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue(longSearch);
    });
  });
});
