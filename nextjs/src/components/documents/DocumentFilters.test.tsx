/**
 * DocumentFilters Component Tests
 * Enterprise-grade tests for document filters sidebar.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentFilters } from './DocumentFilters';

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DocumentFilters', () => {
  const mockSetCurrentFolder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Smart Views section', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('Smart Views')).toBeInTheDocument();
    });

    it('renders Library Folders section', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('Library Folders')).toBeInTheDocument();
    });

    it('renders all smart view items', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('Recent Files')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Missing Metadata')).toBeInTheDocument();
    });

    it('renders all folder items', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('All Documents')).toBeInTheDocument();
      expect(screen.getByText('Contracts')).toBeInTheDocument();
      expect(screen.getByText('Evidence')).toBeInTheDocument();
      expect(screen.getByText('Pleadings')).toBeInTheDocument();
      expect(screen.getByText('Correspondence')).toBeInTheDocument();
    });

    it('renders facet sections', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('File Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders file type facets', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('PDF Documents')).toBeInTheDocument();
      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('Audio/Video')).toBeInTheDocument();
    });

    it('renders status facets', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('Finalized')).toBeInTheDocument();
      expect(screen.getByText('Drafts')).toBeInTheDocument();
    });
  });

  describe('Folder Selection', () => {
    it('highlights current folder', () => {
      render(<DocumentFilters currentFolder="Contracts" setCurrentFolder={mockSetCurrentFolder} />);

      const contractsButton = screen.getByRole('button', { name: /contracts/i });
      expect(contractsButton).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('does not highlight non-selected folders', () => {
      render(<DocumentFilters currentFolder="Contracts" setCurrentFolder={mockSetCurrentFolder} />);

      const evidenceButton = screen.getByRole('button', { name: /evidence/i });
      expect(evidenceButton).not.toHaveClass('bg-blue-50');
    });

    it('calls setCurrentFolder when folder is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      await user.click(screen.getByRole('button', { name: /contracts/i }));

      expect(mockSetCurrentFolder).toHaveBeenCalledWith('Contracts');
    });

    it('calls setCurrentFolder with correct folder name', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      await user.click(screen.getByRole('button', { name: /evidence/i }));
      expect(mockSetCurrentFolder).toHaveBeenCalledWith('Evidence');

      await user.click(screen.getByRole('button', { name: /pleadings/i }));
      expect(mockSetCurrentFolder).toHaveBeenCalledWith('Pleadings');
    });
  });

  describe('Folder Icons', () => {
    it('shows FolderOpen icon for active folder', () => {
      const { container } = render(
        <DocumentFilters currentFolder="Contracts" setCurrentFolder={mockSetCurrentFolder} />
      );

      // The active folder should have an open folder icon with fill
      const contractsButton = screen.getByRole('button', { name: /contracts/i });
      const icon = contractsButton.querySelector('svg');
      expect(icon).toHaveClass('fill-current');
    });

    it('shows Folder icon for inactive folders', () => {
      const { container } = render(
        <DocumentFilters currentFolder="Contracts" setCurrentFolder={mockSetCurrentFolder} />
      );

      // Inactive folders should have a regular folder icon
      const evidenceButton = screen.getByRole('button', { name: /evidence/i });
      const icon = evidenceButton.querySelector('svg');
      expect(icon).not.toHaveClass('fill-current');
    });
  });

  describe('Smart Views', () => {
    it('displays count badge for Missing Metadata', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('Missing Metadata has warning color', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const missingMetaButton = screen.getByText('Missing Metadata').closest('button');
      const icon = missingMetaButton?.querySelector('svg');
      expect(icon).toHaveClass('text-amber-600');
    });
  });

  describe('Facet Counts', () => {
    it('displays document counts for file types', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('124')).toBeInTheDocument(); // PDF count
      expect(screen.getByText('45')).toBeInTheDocument();  // Images count
      expect(screen.getByText('12')).toBeInTheDocument();  // Audio/Video count
    });

    it('displays document counts for statuses', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('89')).toBeInTheDocument();  // Finalized count
      expect(screen.getByText('32')).toBeInTheDocument();  // Drafts count
    });
  });

  describe('Styling', () => {
    it('has correct container styling', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('w-full', 'flex', 'flex-col', 'h-full');
    });

    it('has scrollable content area', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const scrollableArea = container.querySelector('.overflow-y-auto');
      expect(scrollableArea).toBeInTheDocument();
    });

    it('section headers have proper styling', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const smartViewsHeader = screen.getByText('Smart Views');
      expect(smartViewsHeader).toHaveClass('font-bold', 'text-xs', 'uppercase', 'tracking-wide');
    });

    it('buttons have hover styles', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const button = screen.getByRole('button', { name: /recent files/i });
      expect(button).toHaveClass('hover:bg-white', 'hover:text-blue-600');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background classes', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('dark:bg-slate-800');
    });

    it('has dark mode text classes', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const header = screen.getByText('Smart Views');
      expect(header).toHaveClass('dark:text-slate-400');
    });

    it('has dark mode border classes', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('dark:border-slate-700');
    });

    it('has dark mode hover states', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const button = screen.getByRole('button', { name: /recent files/i });
      expect(button).toHaveClass('dark:hover:bg-slate-700', 'dark:hover:text-blue-400');
    });
  });

  describe('Accessibility', () => {
    it('all folders are buttons', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const folderButtons = screen.getAllByRole('button');
      expect(folderButtons.length).toBeGreaterThan(0);
    });

    it('buttons are focusable', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      const button = screen.getByRole('button', { name: /contracts/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('section headers are properly labeled', () => {
      render(<DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />);

      expect(screen.getByText('Smart Views').tagName).toBe('H3');
      expect(screen.getByText('Library Folders').tagName).toBe('H3');
      expect(screen.getByText('File Type').tagName).toBe('H3');
    });
  });

  describe('Layout', () => {
    it('has bordered sections', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const borderedSection = container.querySelector('.border-b');
      expect(borderedSection).toBeInTheDocument();
    });

    it('has proper spacing between items', () => {
      const { container } = render(
        <DocumentFilters currentFolder="All Documents" setCurrentFolder={mockSetCurrentFolder} />
      );

      const spacedContainer = container.querySelector('.space-y-0\\.5');
      expect(spacedContainer).toBeInTheDocument();
    });
  });
});
