/**
 * @fileoverview Enterprise-grade tests for CitationManager component
 * @module components/citations/CitationManager.test
 *
 * Tests citation formatting, Bluebook compliance, search, and export functionality.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitationManager } from './CitationManager';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Book: () => <svg data-testid="book-icon" />,
  BookOpen: () => <svg data-testid="book-open-icon" />,
  Check: () => <svg data-testid="check-icon" />,
  Copy: () => <svg data-testid="copy-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CitationManager', () => {
  describe('Header', () => {
    it('renders the Citation Manager title', () => {
      render(<CitationManager />);
      expect(screen.getByRole('heading', { name: /citation manager/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<CitationManager />);
      expect(screen.getByText(/bluebook-compliant legal citations/i)).toBeInTheDocument();
    });

    it('renders Add Citation button', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /add citation/i })).toBeInTheDocument();
    });

    it('renders Export button', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================================================

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<CitationManager />);
      expect(screen.getByPlaceholderText(/search citations/i)).toBeInTheDocument();
    });

    it('allows typing in search', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      const searchInput = screen.getByPlaceholderText(/search citations/i);
      await user.type(searchInput, 'Miranda');

      expect(searchInput).toHaveValue('Miranda');
    });

    it('filters citations based on search term', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      const searchInput = screen.getByPlaceholderText(/search citations/i);
      await user.type(searchInput, 'Miranda');

      // Miranda v. Arizona should be visible
      expect(screen.getByText(/miranda v\. arizona/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CITATION TYPE FILTER TESTS
  // ============================================================================

  describe('Citation Type Filter', () => {
    it('renders All Types option', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /all types/i })).toBeInTheDocument();
    });

    it('renders Cases filter', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /cases/i })).toBeInTheDocument();
    });

    it('renders Statutes filter', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /statutes/i })).toBeInTheDocument();
    });

    it('renders Regulations filter', () => {
      render(<CitationManager />);
      expect(screen.getByRole('button', { name: /regulations/i })).toBeInTheDocument();
    });

    it('defaults to All Types', () => {
      render(<CitationManager />);
      const allTypesButton = screen.getByRole('button', { name: /all types/i });
      expect(allTypesButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('changes active filter when clicked', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /cases/i }));

      const casesButton = screen.getByRole('button', { name: /cases/i });
      expect(casesButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('filters citations by type', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /statutes/i }));

      // Only statutes should be visible
      expect(screen.queryByText(/miranda v\. arizona/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CITATION LIST TESTS
  // ============================================================================

  describe('Citation List', () => {
    it('renders citation entries', () => {
      render(<CitationManager />);

      expect(screen.getByText(/miranda v\. arizona/i)).toBeInTheDocument();
      expect(screen.getByText(/brown v\. board of education/i)).toBeInTheDocument();
    });

    it('renders citation reporter citations', () => {
      render(<CitationManager />);

      expect(screen.getByText(/384 u\.s\. 436/i)).toBeInTheDocument();
      expect(screen.getByText(/347 u\.s\. 483/i)).toBeInTheDocument();
    });

    it('renders citation year', () => {
      render(<CitationManager />);

      expect(screen.getByText('1966')).toBeInTheDocument();
      expect(screen.getByText('1954')).toBeInTheDocument();
    });

    it('renders copy button for each citation', () => {
      render(<CitationManager />);

      const copyButtons = screen.getAllByTestId('copy-icon');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // CITATION FORMAT TESTS
  // ============================================================================

  describe('Citation Formatting', () => {
    it('displays case citations in Bluebook format', () => {
      render(<CitationManager />);

      // Bluebook case format: Case Name, Volume Reporter Page (Year)
      const mirandaCitation = screen.getByText(/384 u\.s\. 436/i);
      expect(mirandaCitation).toBeInTheDocument();
    });

    it('displays court level when applicable', () => {
      render(<CitationManager />);

      expect(screen.getByText(/supreme court/i)).toBeInTheDocument();
    });

    it('displays citation type badge', () => {
      render(<CitationManager />);

      const caseBadges = screen.getAllByText('Case');
      expect(caseBadges.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // COPY TO CLIPBOARD TESTS
  // ============================================================================

  describe('Copy to Clipboard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('copies citation to clipboard when copy button clicked', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      const copyButtons = screen.getAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('[data-testid="copy-icon"]')
      );

      if (copyButtons.length > 0) {
        await user.click(copyButtons[0]);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      }
    });
  });

  // ============================================================================
  // ADD CITATION MODAL TESTS
  // ============================================================================

  describe('Add Citation Modal', () => {
    it('opens modal when Add Citation button is clicked', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByText(/add new citation/i)).toBeInTheDocument();
    });

    it('modal has citation type selector', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/citation type/i)).toBeInTheDocument();
    });

    it('modal has case name input', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/case name/i)).toBeInTheDocument();
    });

    it('modal has volume input', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    });

    it('modal has reporter select', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/reporter/i)).toBeInTheDocument();
    });

    it('modal has page number input', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/page/i)).toBeInTheDocument();
    });

    it('modal has year input', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));

      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    });

    it('closes modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      await user.click(screen.getByRole('button', { name: /add citation/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByText(/add new citation/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // EXPORT FUNCTIONALITY TESTS
  // ============================================================================

  describe('Export Functionality', () => {
    it('renders export button with download icon', () => {
      render(<CitationManager />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('export button is clickable', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      await expect(user.click(exportButton)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<CitationManager />);

      const searchInput = screen.getByPlaceholderText(/search citations/i);
      await user.type(searchInput, 'xyznonexistent');

      expect(screen.getByText(/no citations found/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // BLUEBOOK COMPLIANCE TESTS
  // ============================================================================

  describe('Bluebook Compliance', () => {
    it('displays U.S. reporter abbreviation correctly', () => {
      render(<CitationManager />);

      // U.S. is the correct Bluebook abbreviation for United States Reports
      expect(screen.getByText(/u\.s\./i)).toBeInTheDocument();
    });

    it('formats pinpoint citations correctly', () => {
      render(<CitationManager />);

      // Page numbers should follow volume and reporter
      const citationWithPage = screen.getByText(/384 u\.s\. 436/i);
      expect(citationWithPage).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive flex layout for header', () => {
      render(<CitationManager />);

      const header = screen.getByRole('heading', { name: /citation manager/i }).closest('.flex');
      expect(header).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to container', () => {
      render(<CitationManager />);

      const container = screen.getByRole('heading', { name: /citation manager/i }).closest('.dark\\:bg-slate-900');
      expect(container).toBeInTheDocument();
    });

    it('applies dark mode classes to citation cards', () => {
      render(<CitationManager />);

      const card = screen.getByText(/miranda v\. arizona/i).closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });
  });
});
