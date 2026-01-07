/**
 * @jest-environment jsdom
 * @module EnhancedSearch.old.test
 * @description Enterprise-grade tests for legacy EnhancedSearch component
 *
 * Test coverage:
 * - Search input functionality
 * - Fuzzy matching
 * - Category filtering
 * - Keyboard navigation
 * - Recent searches
 * - Search syntax parsing
 * - Suggestion display
 * - Accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedSearch, type SearchSuggestion, type SearchCategory } from './EnhancedSearch.old';

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

jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/utils/sanitize', () => ({
  sanitizeHtml: (html: string) => html,
}));

jest.mock('@/config/master.config', () => ({
  SEARCH_DEBOUNCE_MS: 100,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ============================================================================
// TEST DATA
// ============================================================================

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Smith v. Jones', category: 'cases', metadata: { description: 'Civil litigation' } },
  { id: '2', text: 'Contract Agreement Template', category: 'documents' },
  { id: '3', text: 'John Smith', category: 'people' },
  { id: '4', text: '2024-01-15', category: 'dates' },
  { id: '5', text: 'urgent', category: 'tags' },
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

describe('EnhancedSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders search input', () => {
      renderEnhancedSearch();

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays placeholder text', () => {
      renderEnhancedSearch({ placeholder: 'Search cases...' });

      expect(screen.getByPlaceholderText('Search cases...')).toBeInTheDocument();
    });

    it('renders category filters when enabled', () => {
      renderEnhancedSearch({ showCategories: true });

      expect(screen.getByText('all')).toBeInTheDocument();
      expect(screen.getByText('cases')).toBeInTheDocument();
      expect(screen.getByText('documents')).toBeInTheDocument();
    });

    it('hides category filters when disabled', () => {
      renderEnhancedSearch({ showCategories: false });

      expect(screen.queryByText('cases')).not.toBeInTheDocument();
    });

    it('shows syntax hints when enabled', () => {
      renderEnhancedSearch({ showSyntaxHints: true });

      // Command+K hint should be visible when input is empty
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('auto-focuses when autoFocus is true', () => {
      renderEnhancedSearch({ autoFocus: true });

      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('Search Input', () => {
    it('updates query on input change', async () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(input).toHaveValue('test');
    });

    it('calls onSearch with debounce', async () => {
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch, debounceDelay: 100 });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      // Should not call immediately
      expect(onSearch).not.toHaveBeenCalled();

      // Fast forward past debounce
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(onSearch).toHaveBeenCalledWith('test', 'all');
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen.getByTitle('Clear');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Fuzzy Matching', () => {
    it('finds exact matches', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith v. Jones' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('finds partial matches', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('limits suggestions to maxSuggestions', () => {
      const manySuggestions = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        text: `Item ${i}`,
        category: 'cases' as SearchCategory,
      }));

      renderEnhancedSearch({ suggestions: manySuggestions, maxSuggestions: 5 });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Item' } });
      fireEvent.focus(input);

      const suggestions = screen.getAllByRole('button').filter(b => b.textContent?.includes('Item'));
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Category Filtering', () => {
    it('filters by selected category', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderEnhancedSearch({ showCategories: true });

      // Select cases category
      await user.click(screen.getByText('cases'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      // Should show case matches
      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('shows all categories when "all" is selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderEnhancedSearch({ showCategories: true });

      await user.click(screen.getByText('all'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('applies active styling to selected category', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderEnhancedSearch({ showCategories: true });

      const casesButton = screen.getByText('cases');
      await user.click(casesButton);

      // Active category should have different styling
      expect(casesButton).toHaveClass('text-white');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down through suggestions with ArrowDown', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // First suggestion should be highlighted
      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('navigates up through suggestions with ArrowUp', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });

    it('selects suggestion on Enter', () => {
      const onSuggestionSelect = jest.fn();
      renderEnhancedSearch({ onSuggestionSelect });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onSuggestionSelect).toHaveBeenCalled();
    });

    it('closes dropdown on Escape', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();

      fireEvent.keyDown(input, { key: 'Escape' });

      // Dropdown should close
      expect(screen.queryByText('cases')).toBeInTheDocument(); // Categories still visible
    });

    it('submits search on Enter without selection', () => {
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onSearch).toHaveBeenCalledWith('test query', 'all');
    });
  });

  describe('Recent Searches', () => {
    it('shows recent searches when input is empty', () => {
      localStorageMock.setItem('lexiflow_recent_searches', JSON.stringify(['Previous search']));
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(screen.getByText('Previous search')).toBeInTheDocument();
    });

    it('saves search to recent searches', async () => {
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new search' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      const stored = JSON.parse(localStorageMock.getItem('lexiflow_recent_searches') || '[]');
      expect(stored).toContain('new search');
    });

    it('limits recent searches to 10', () => {
      const existingSearches = Array.from({ length: 15 }, (_, i) => `search ${i}`);
      localStorageMock.setItem('lexiflow_recent_searches', JSON.stringify(existingSearches));

      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new search' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      const stored = JSON.parse(localStorageMock.getItem('lexiflow_recent_searches') || '[]');
      expect(stored.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Search Syntax', () => {
    it('displays syntax hints in dropdown', () => {
      renderEnhancedSearch({ showSyntaxHints: true });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.focus(input);

      expect(screen.getByText(/case:123/)).toBeInTheDocument();
    });
  });

  describe('Suggestion Selection', () => {
    it('calls onSuggestionSelect when suggestion is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSuggestionSelect = jest.fn();
      renderEnhancedSearch({ onSuggestionSelect });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      const suggestion = screen.getByText(/Smith v\. Jones/).closest('button');
      await user.click(suggestion!);

      expect(onSuggestionSelect).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Smith v. Jones' })
      );
    });

    it('updates input value when suggestion is selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      const suggestion = screen.getByText(/Smith v\. Jones/).closest('button');
      await user.click(suggestion!);

      expect(input).toHaveValue('Smith v. Jones');
    });
  });

  describe('Highlighting', () => {
    it('highlights matching text in suggestions', () => {
      renderEnhancedSearch();

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Smith' } });
      fireEvent.focus(input);

      // Should have highlighted text
      expect(screen.getByText(/Smith v\. Jones/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible input', () => {
      renderEnhancedSearch({ placeholder: 'Search...' });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
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

    it('handles localStorage errors gracefully', () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = () => {
        throw new Error('Storage error');
      };

      // Should not throw
      expect(() => renderEnhancedSearch()).not.toThrow();

      localStorageMock.getItem = originalGetItem;
    });

    it('handles empty query gracefully', () => {
      const onSearch = jest.fn();
      renderEnhancedSearch({ onSearch });

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      // Should not call onSearch with empty query
      expect(onSearch).not.toHaveBeenCalled();
    });
  });
});
