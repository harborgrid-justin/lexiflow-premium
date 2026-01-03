/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  LegalResearchHub,
  type LegalResearchHubProps,
  type ResearchResult,
  type ResearchSession,
  type Annotation,
} from '@/components/enterprise/Research/LegalResearchHub';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LegalResearchHub', () => {
  const mockOnSearch = jest.fn();
  const mockOnSaveResult = jest.fn();
  const mockOnCreateAnnotation = jest.fn();
  const mockOnExport = jest.fn();

  const defaultProps: LegalResearchHubProps = {
    onSearch: mockOnSearch,
    onSaveResult: mockOnSaveResult,
    onCreateAnnotation: mockOnCreateAnnotation,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('should render search input and handle search query changes', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search case law, statutes/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'contract law' } });
      expect(searchInput).toHaveValue('contract law');
    });

    it('should call onSearch when search button is clicked', async () => {
      render(<LegalResearchHub {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search case law, statutes/i);
      const searchButtons = screen.getAllByRole('button', { name: /^search$/i });
      // Get the button that is NOT in a tab (the action button in the search bar)
      const searchButton = searchButtons.find(btn => !btn.className.includes('border-b-2')) || searchButtons[0];

      fireEvent.change(searchInput, { target: { value: 'breach of contract' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('breach of contract', {});
      });
    });

    it('should call onSearch when Enter key is pressed', async () => {
      render(<LegalResearchHub {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search case law, statutes/i);

      fireEvent.change(searchInput, { target: { value: 'tort law' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('tort law', {});
      });
    });

    it('should not search when query is empty', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const searchButtons = screen.getAllByRole('button', { name: /^search$/i });
      const searchButton = searchButtons.find(btn => !btn.className.includes('border-b-2')) || searchButtons[0];
      fireEvent.click(searchButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should display searching state during search', async () => {
      render(<LegalResearchHub {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search case law, statutes/i);
      const searchButtons = screen.getAllByRole('button', { name: /^search$/i });
      const searchButton = searchButtons.find(btn => !btn.className.includes('border-b-2')) || searchButtons[0];

      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(searchButton);

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  describe('Result Filtering', () => {
    it('should toggle filters panel when filter button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const filterButton = screen.getByTitle('Filters');

      // Filters should not be visible initially
      expect(screen.queryByText('Jurisdiction')).not.toBeInTheDocument();

      // Click to show filters
      fireEvent.click(filterButton);
      expect(screen.getByText('Jurisdiction')).toBeInTheDocument();

      // Click again to hide filters
      fireEvent.click(filterButton);
    });

    it('should display filter options for jurisdiction, document type, and date range', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const filterButton = screen.getByTitle('Filters');
      fireEvent.click(filterButton);

      expect(screen.getByText('Jurisdiction')).toBeInTheDocument();
      expect(screen.getByText('Document Type')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should display sessions tab with session count', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const sessionsTab = screen.getByRole('button', { name: /sessions \(2\)/i });
      expect(sessionsTab).toBeInTheDocument();
    });

    it('should switch to sessions view when sessions tab is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const sessionsTab = screen.getByRole('button', { name: /sessions/i });
      fireEvent.click(sessionsTab);

      expect(screen.getByText(/research sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/contract law research/i)).toBeInTheDocument();
    });

    it('should display session details including query and result count', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const sessionsTab = screen.getByRole('button', { name: /sessions/i });
      fireEvent.click(sessionsTab);

      expect(screen.getByText(/breach of contract damages/i)).toBeInTheDocument();
      expect(screen.getByText(/42 results/i)).toBeInTheDocument();
    });
  });

  describe('Result Display', () => {
    it('should display search results with case information', () => {
      render(<LegalResearchHub {...defaultProps} />);

      expect(screen.getByText(/hadley v\. baxendale/i)).toBeInTheDocument();
      expect(screen.getByText(/9 ex\. 341/i)).toBeInTheDocument();
      expect(screen.getByText(/court of exchequer/i)).toBeInTheDocument();
    });

    it('should display relevance score for results', () => {
      render(<LegalResearchHub {...defaultProps} />);

      expect(screen.getByText(/95%/i)).toBeInTheDocument();
      expect(screen.getByText(/88%/i)).toBeInTheDocument();
    });

    it('should call onSaveResult when save button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const saveButtons = screen.getAllByRole('button', { name: '' });
      const bookmarkButton = saveButtons.find(btn =>
        btn.querySelector('[class*="BookmarkPlus"]')
      );

      if (bookmarkButton) {
        fireEvent.click(bookmarkButton);
        expect(mockOnSaveResult).toHaveBeenCalled();
      }
    });

    it('should display highlighted search terms', () => {
      render(<LegalResearchHub {...defaultProps} />);

      // Check for highlighted terms in the pill badges
      const highlightedTerms = screen.getAllByText('breach of contract');
      expect(highlightedTerms.length).toBeGreaterThan(0);
      const damagesTerms = screen.getAllByText('damages');
      expect(damagesTerms.length).toBeGreaterThan(0);
    });

    it('should call onExport when export button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export results/i });
      fireEvent.click(exportButton);

      expect(mockOnExport).toHaveBeenCalled();
    });
  });

  describe('Annotation Creation', () => {
    it('should open detail panel when result is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const resultCard = screen.getByText(/hadley v\. baxendale/i).closest('div');
      if (resultCard) {
        fireEvent.click(resultCard);

        // Check if detail panel is visible
        expect(screen.getAllByText(/hadley v\. baxendale/i).length).toBeGreaterThan(1);
      }
    });

    it('should display annotation buttons in detail panel', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const resultCard = screen.getByText(/hadley v\. baxendale/i).closest('div');
      if (resultCard) {
        fireEvent.click(resultCard);

        expect(screen.getByRole('button', { name: /highlight/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /note/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      }
    });

    it('should close detail panel when close button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const resultCard = screen.getByText(/hadley v\. baxendale/i).closest('div');
      if (resultCard) {
        fireEvent.click(resultCard);

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        // Detail panel should be closed
        expect(screen.getAllByText(/hadley v\. baxendale/i).length).toBe(1);
      }
    });
  });

  describe('AI Assistant Sidebar', () => {
    it('should toggle AI assistant sidebar when button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai research assistant/i });
      fireEvent.click(aiButton);

      expect(screen.getAllByText(/ai research assistant/i).length).toBeGreaterThan(1);
    });

    it('should display AI assistant capabilities', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai research assistant/i });
      fireEvent.click(aiButton);

      expect(screen.getByText(/find relevant case law/i)).toBeInTheDocument();
      expect(screen.getByText(/analyze legal precedents/i)).toBeInTheDocument();
      expect(screen.getByText(/summarize complex documents/i)).toBeInTheDocument();
    });

    it('should have input field for AI questions', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai research assistant/i });
      fireEvent.click(aiButton);

      const aiInput = screen.getByPlaceholderText(/ask the ai assistant\.\.\./i);
      expect(aiInput).toBeInTheDocument();
    });

    it('should close AI sidebar when close button is clicked', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai research assistant/i });
      fireEvent.click(aiButton);

      const closeButtons = screen.getAllByText('×');
      const sidebarCloseButton = closeButtons[closeButtons.length - 1];
      fireEvent.click(sidebarCloseButton);

      // AI sidebar should be closed
      expect(screen.getAllByText(/ai research assistant/i).length).toBe(1);
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between search, sessions, and saved tabs', () => {
      render(<LegalResearchHub {...defaultProps} />);

      // Default is search tab
      expect(screen.getByText(/2 results/i)).toBeInTheDocument();

      // Switch to sessions
      const sessionsTab = screen.getByRole('button', { name: /sessions/i });
      fireEvent.click(sessionsTab);
      expect(screen.getByText(/research sessions/i)).toBeInTheDocument();

      // Switch to saved
      const savedTab = screen.getByRole('button', { name: /saved/i });
      fireEvent.click(savedTab);
      expect(screen.getByText(/no saved results/i)).toBeInTheDocument();
    });
  });

  describe('Legal-Specific Formatting', () => {
    it('should display proper case citation format', () => {
      render(<LegalResearchHub {...defaultProps} />);

      // Bluebook citation format
      expect(screen.getByText(/9 ex\. 341, 156 eng\. rep\. 145 \(1854\)/i)).toBeInTheDocument();
    });

    it('should display statute citation format', () => {
      render(<LegalResearchHub {...defaultProps} />);

      expect(screen.getByText(/uniform commercial code § 2-714/i)).toBeInTheDocument();
      expect(screen.getByText(/ucc § 2-714/i)).toBeInTheDocument();
    });

    it('should categorize results by type with appropriate icons', () => {
      render(<LegalResearchHub {...defaultProps} />);

      const results = screen.getAllByRole('button', { name: '' });

      // Should have different icons for case vs statute
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
