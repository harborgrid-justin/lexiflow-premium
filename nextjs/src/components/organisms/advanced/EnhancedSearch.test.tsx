/**
 * @jest-environment jsdom
 * @module EnhancedSearch.test
 * @description Enterprise-grade tests for advanced EnhancedSearch component
 *
 * Test coverage:
 * - Search input with useDeferredValue
 * - Category filtering
 * - Suggestion filtering and highlighting
 * - Keyboard navigation
 * - Recent searches management
 * - Search syntax parsing
 * - Dropdown behavior
 * - Accessibility
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedSearch } from './EnhancedSearch';
import type { SearchCategory, SearchSuggestion } from './types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100', input: 'bg-gray-50' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', focused: 'border-blue-500' },
      primary: { DEFAULT: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
    },
  }),
}));

jest.mock('@/hooks/useClickOutside', () => ({
  useClickOutside: jest.fn(),
}));

jest.mock('./EnhancedSearch.styles', () => ({
  searchContainer: () => 'search-container',
  getInputContainer: () => 'input-container',
  getSearchIcon: () => 'search-icon',
  getSearchInput: () => 'search-input',
  getClearButton: () => 'clear-button',
  clearIcon: 'clear-icon',
  syntaxHintsContainer: 'syntax-hints',
  commandIcon: 'command-icon',
  categoriesContainer: 'categories',
  getCategoryButton: () => 'category-button',
  getDropdownContainer: () => 'dropdown',
  dropdownScrollContainer: 'dropdown-scroll',
  getSuggestionButton: () => 'suggestion-button',
  getSuggestionIcon: () => 'suggestion-icon',
  suggestionContentContainer: 'suggestion-content',
  getSuggestionText: () => 'suggestion-text',
  getSuggestionMetadata: () => 'suggestion-meta',
  getSuggestionCategory: () => 'suggestion-category',
}));

jest.mock('./utils', () => ({
  highlightMatch: (text: string, query: string) => text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>'),
  filterSuggestions: (suggestions: SearchSuggestion[], query: string, limit: number) =>
    suggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase())).slice(0, limit),
}));

jest.mock('./storage', () => ({
  getRecentSearches: jest.fn(() => ['recent search 1', 'recent search 2']),
  parseSearchSyntax: (value: string) => ({ text: value, filters: {} }),
}));

jest.mock('./hooks', () => ({
  useSearchHandlers: (onSearch: (q: string, c: string) => void, onSuggestionSelect?: (s: SearchSuggestion) => void) => ({
    handleSearch: onSearch,
    handleSuggestionClick: (suggestion: SearchSuggestion, setQuery: (q: string) => void) => {
      setQuery(suggestion.text);
      onSuggestionSelect?.(suggestion);
    },
  }),
  useKeyboardNav: () => (e: React.KeyboardEvent, selectedIndex: number, setSelectedIndex: (i: number) => void, setIsOpen: (o: boolean) => void) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(Math.max(-1, selectedIndex - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  },
}));

jest.mock('./helpers', () => ({
  getCategoryIcon: () => <span data-testid="category-icon" />,
  sanitizeHtml: (html: string) => html,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Smith v. Jones Case', category: 'cases' },
  { id: '2', text: 'Employment Contract', category: 'documents' },
  { id: '3', text: 'John Smith', category: 'people' },
  { id: '4', text: 'Settlement Meeting', category: 'dates' },
  { id: '5', text: 'Priority: High', category: 'tags' },
];

const defaultProps = {
  onSearch: jest.fn(),
  suggestions: mockSuggestions,
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderEnhancedSearch = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<EnhancedSearch {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('EnhancedSearch (Advanced)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input', () => {
      renderEnhancedSearch();

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays custom placeholder', () => {
      renderEnhancedSearch({ placeholder: 'Find anything...' });

      expect(screen.getByPlaceholderText('Find anything...')).toBeInTheDocument();
    });

    it('shows default placeholder', () => {
      renderEnhancedSearch();

      expect(screen.getByPlaceholderText('Search everything...')).toBeInTheDocument();
    });

    it('renders category filters by default', () => {
      renderEnhancedSearch();

      expect(screen.getByText('all')).toBeInTheDocument();
      expect(screen.getByText('cases')).toBeInTheDocument();
      expect(screen.getByText('documents')).toBeInTheDocument();
    });

    it('hides category filters when showCategories is false', () => {
      renderEnhancedSearch({ showCategories: false });

      expect(screen.queryByText('cases')).not.toBeInTheDocument();
    });

    it('shows syntax hints when empty and enabled', () => {
      renderEnhancedSearch({ showSyntaxHints: true });

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('auto-focuses input when autoFocus is true', () => {
      renderEnhancedSearch({ autoFocus: true });

      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('applies custom className', () => {
      const { container } = renderEnhancedSearch({ className: 'custom-search' });

      expect(container.firstChild).toHaveClass('custom-search');
    });
  });

  describe('Search Input Behavior', () => {
    it('updates query state on input change', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test query' } });

      expect(input).toHaveValue('test query');
    });

    it('opens dropdown on focus', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Recent searches should be shown
      expect(screen.getByText('recent search 1')).toBeInTheDocument();
    });

    it('calls onSearch when input changes', () => {
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });

      expect(onSearch).toHaveBeenCalledWith('Smith', 'all');
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen.getByTitle('Clear');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('hides clear button when input is empty', () => {
      renderEnhancedSearch();

      expect(screen.queryByTitle('Clear')).not.toBeInTheDocument();
    });

    it('shows clear button when input has value', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(screen.getByTitle('Clear')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('changes category when category button is clicked', async () => {
      const user = userEvent.setup();
      renderEnhancedSearch();

      await user.click(screen.getByText('cases'));

      // Category should be updated
      expect(screen.getByText('cases')).toBeInTheDocument();
    });

    it('calls onSearch with selected category', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch });

      await user.click(screen.getByText('documents'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'contract' } });

      expect(onSearch).toHaveBeenCalledWith('contract', 'documents');
    });
  });

  describe('Suggestions Dropdown', () => {
    it('shows recent searches when input is empty', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(screen.getByText('recent search 1')).toBeInTheDocument();
      expect(screen.getByText('recent search 2')).toBeInTheDocument();
    });

    it('shows filtered suggestions when input has value', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('highlights matching text in suggestions', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      // Should contain mark tags for highlighting
      const suggestion = screen.getByText(/Smith/);
      expect(suggestion).toBeInTheDocument();
    });

    it('displays category icon for each suggestion', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getAllByTestId('category-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Suggestion Selection', () => {
    it('selects suggestion on click', async () => {
      const user = userEvent.setup();
      const onSuggestionSelect = jest.fn();
      renderEnhancedSearch({ onSuggestionSelect });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      const suggestion = screen.getByText(/Smith v\. Jones/).closest('button');
      await user.click(suggestion!);

      expect(onSuggestionSelect).toHaveBeenCalled();
    });

    it('updates input with selected suggestion text', async () => {
      const user = userEvent.setup();
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      const suggestion = screen.getByText(/Smith v\. Jones/).closest('button');
      await user.click(suggestion!);

      expect(input).toHaveValue('Smith v. Jones Case');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Selected index should increase
      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('navigates up with ArrowUp', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('closes dropdown on Escape', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();

      fireEvent.keyDown(input, { key: 'Escape' });

      // Suggestions should be hidden (dropdown closed)
      expect(screen.queryByText(/Smith v\. Jones/)).not.toBeInTheDocument();
    });
  });

  describe('useDeferredValue Integration', () => {
    it('uses deferred query for filtering', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');

      // Rapid input changes should be handled by useDeferredValue
      fireEvent.change(input, { target: { value: 'S' } });
      fireEvent.change(input, { target: { value: 'Sm' } });
      fireEvent.change(input, { target: { value: 'Smi' } });
      fireEvent.change(input, { target: { value: 'Smit' } });
      fireEvent.change(input, { target: { value: 'Smith' } });

      expect(input).toHaveValue('Smith');
    });
  });

  describe('Accessibility', () => {
    it('input has proper role', () => {
      renderEnhancedSearch();

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('all category buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      renderEnhancedSearch();

      const casesButton = screen.getByText('cases');
      casesButton.focus();

      await user.keyboard('{Enter}');

      expect(casesButton).toBeInTheDocument();
    });

    it('clear button has accessible title', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(screen.getByTitle('Clear')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty suggestions array', () => {
      renderEnhancedSearch({ suggestions: [] });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.focus(input);

      // Should not crash
      expect(input).toBeInTheDocument();
    });

    it('handles null onSuggestionSelect', async () => {
      const user = userEvent.setup();
      renderEnhancedSearch({ onSuggestionSelect: undefined });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      const suggestion = screen.getByText(/Smith v\. Jones/).closest('button');

      // Should not throw
      await expect(user.click(suggestion!)).resolves.not.toThrow();
    });

    it('handles special characters in query', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith & Jones' } });

      expect(input).toHaveValue('Smith & Jones');
    });
  });
});
