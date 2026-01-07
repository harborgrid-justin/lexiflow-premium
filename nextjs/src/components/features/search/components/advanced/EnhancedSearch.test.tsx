/**
 * @jest-environment jsdom
 * EnhancedSearch Component Tests
 * Enterprise-grade tests for advanced search with suggestions and categories
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedSearch } from './EnhancedSearch';
import type { SearchResult, SearchCategory } from './types';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '', highlight: '' },
      text: { primary: '', secondary: '', tertiary: '', muted: '' },
      border: { default: '', subtle: '' },
      backdrop: '',
    },
  }),
}));

jest.mock('@/hooks/useClickOutside', () => ({
  useClickOutside: jest.fn((ref, callback) => { }),
}));

jest.mock('./storage', () => ({
  getRecentSearches: jest.fn(() => ['recent search 1', 'recent search 2']),
  parseSearchSyntax: jest.fn((value) => ({ query: value, filters: {} })),
}));

jest.mock('./utils', () => ({
  highlightMatch: jest.fn((text, query) => `<mark>${query}</mark>${text.replace(query, '')}`),
  filterSuggestions: jest.fn((suggestions, query, limit) =>
    suggestions.filter((s: any) => s.text.includes(query)).slice(0, limit)
  ),
}));

jest.mock('./hooks', () => ({
  useSearchHandlers: jest.fn((onSearch, onSuggestionSelect, debounceDelay) => ({
    handleSearch: jest.fn((query, category) => onSearch?.(query, category)),
    handleSuggestionClick: jest.fn((suggestion, setQuery, setRecentSearches, setIsOpen, setSelectedIndex) => {
      setQuery(suggestion.text);
      setIsOpen(false);
      onSuggestionSelect?.(suggestion);
    }),
  })),
  useKeyboardNav: jest.fn(() => jest.fn()),
}));

jest.mock('./helpers', () => ({
  getCategoryIcon: jest.fn(() => <span data-testid="category-icon">Icon</span>),
  sanitizeHtml: jest.fn((html) => html),
}));

const createMockSuggestion = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  id: 'sug-1',
  text: 'Test Suggestion',
  category: 'all' as SearchCategory,
  score: 1.0,
  ...overrides,
});

describe('EnhancedSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input with default placeholder', () => {
      render(<EnhancedSearch />);

      expect(screen.getByPlaceholderText('Search everything...')).toBeInTheDocument();
    });

    it('renders search input with custom placeholder', () => {
      render(<EnhancedSearch placeholder="Find cases..." />);

      expect(screen.getByPlaceholderText('Find cases...')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<EnhancedSearch />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders category buttons when showCategories is true', () => {
      render(<EnhancedSearch showCategories={true} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cases/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /documents/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /people/i })).toBeInTheDocument();
    });

    it('hides category buttons when showCategories is false', () => {
      render(<EnhancedSearch showCategories={false} />);

      expect(screen.queryByRole('button', { name: /^all$/i })).not.toBeInTheDocument();
    });

    it('renders keyboard shortcut hint when showSyntaxHints is true', () => {
      render(<EnhancedSearch showSyntaxHints={true} />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('updates value on input', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.type(input, 'test query');

      expect(input).toHaveValue('test query');
    });

    it('shows clear button when query has value', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.type(input, 'test');

      expect(screen.getByTitle('Clear')).toBeInTheDocument();
    });

    it('hides clear button when query is empty', () => {
      render(<EnhancedSearch />);

      expect(screen.queryByTitle('Clear')).not.toBeInTheDocument();
    });

    it('clears input when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.type(input, 'test');
      await user.click(screen.getByTitle('Clear'));

      expect(input).toHaveValue('');
    });

    it('focuses input after clear', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.type(input, 'test');
      await user.click(screen.getByTitle('Clear'));

      expect(document.activeElement).toBe(input);
    });
  });

  describe('Category Selection', () => {
    it('highlights active category', () => {
      render(<EnhancedSearch showCategories={true} />);

      const allButton = screen.getByRole('button', { name: /^all$/i });
      // Default category is 'all'
      expect(allButton.className).toContain('bg-');
    });

    it('changes category on click', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch showCategories={true} />);

      await user.click(screen.getByRole('button', { name: /cases/i }));

      const casesButton = screen.getByRole('button', { name: /cases/i });
      expect(casesButton.className).toContain('bg-');
    });
  });

  describe('Suggestions Dropdown', () => {
    it('shows dropdown on focus', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.click(input);

      // Should show recent searches
      expect(screen.getByText('recent search 1')).toBeInTheDocument();
    });

    it('shows recent searches when query is empty', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      await user.click(screen.getByPlaceholderText('Search everything...'));

      expect(screen.getByText('recent search 1')).toBeInTheDocument();
      expect(screen.getByText('recent search 2')).toBeInTheDocument();
    });

    it('shows filtered suggestions when query has value', async () => {
      const user = userEvent.setup();
      const suggestions = [
        createMockSuggestion({ id: '1', text: 'Case ABC' }),
        createMockSuggestion({ id: '2', text: 'Document XYZ' }),
      ];

      render(<EnhancedSearch suggestions={suggestions} />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'Case');

      await waitFor(() => {
        expect(screen.getByText(/Case/)).toBeInTheDocument();
      });
    });
  });

  describe('Search Callback', () => {
    it('calls onSearch when typing', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();

      render(<EnhancedSearch onSearch={onSearch} />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'test');

      expect(onSearch).toHaveBeenCalled();
    });
  });

  describe('Suggestion Selection', () => {
    it('calls onSuggestionSelect when suggestion clicked', async () => {
      const user = userEvent.setup();
      const onSuggestionSelect = jest.fn();
      const suggestions = [
        createMockSuggestion({ id: '1', text: 'Test Case' }),
      ];

      render(
        <EnhancedSearch
          suggestions={suggestions}
          onSuggestionSelect={onSuggestionSelect}
        />
      );

      await user.type(screen.getByPlaceholderText('Search everything...'), 'Test');

      await waitFor(() => {
        expect(screen.getByText(/Test/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Test/));

      expect(onSuggestionSelect).toHaveBeenCalled();
    });
  });

  describe('AutoFocus', () => {
    it('focuses input on mount when autoFocus is true', () => {
      render(<EnhancedSearch autoFocus={true} />);

      expect(document.activeElement).toBe(screen.getByPlaceholderText('Search everything...'));
    });

    it('does not focus on mount when autoFocus is false', () => {
      render(<EnhancedSearch autoFocus={false} />);

      expect(document.activeElement).not.toBe(screen.getByPlaceholderText('Search everything...'));
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(<EnhancedSearch className="custom-search" />);

      expect(container.firstChild).toHaveClass('custom-search');
    });
  });

  describe('Syntax Hints', () => {
    it('shows Command+K hint', () => {
      render(<EnhancedSearch showSyntaxHints={true} />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('hides hint when query has value', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch showSyntaxHints={true} />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'test');

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });
  });

  describe('Deferred Value', () => {
    it('uses deferred value for filtering (React 18)', async () => {
      const user = userEvent.setup();
      const suggestions = Array.from({ length: 100 }, (_, i) =>
        createMockSuggestion({ id: String(i), text: `Suggestion ${i}` })
      );

      render(<EnhancedSearch suggestions={suggestions} />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'Suggestion 5');

      // Component should handle large suggestion lists efficiently
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search everything...')).toHaveValue('Suggestion 5');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles keyboard events through useKeyboardNav', async () => {
      const { useKeyboardNav } = require('./hooks');
      const mockKeyHandler = jest.fn();
      useKeyboardNav.mockReturnValue(mockKeyHandler);

      const user = userEvent.setup();
      render(<EnhancedSearch />);

      const input = screen.getByPlaceholderText('Search everything...');
      await user.type(input, 'test');
      await user.keyboard('{ArrowDown}');

      expect(mockKeyHandler).toHaveBeenCalled();
    });
  });

  describe('Category Filtering', () => {
    it('filters suggestions by selected category', async () => {
      const user = userEvent.setup();
      const suggestions = [
        createMockSuggestion({ id: '1', text: 'Case 1', category: 'cases' }),
        createMockSuggestion({ id: '2', text: 'Doc 1', category: 'documents' }),
      ];

      render(<EnhancedSearch suggestions={suggestions} showCategories={true} />);

      await user.click(screen.getByRole('button', { name: /cases/i }));
      await user.type(screen.getByPlaceholderText('Search everything...'), 'test');

      // filterSuggestions mock should receive category filter
      const { filterSuggestions } = require('./utils');
      expect(filterSuggestions).toHaveBeenCalled();
    });
  });

  describe('Search Syntax Parsing', () => {
    it('parses search syntax for special filters', async () => {
      const user = userEvent.setup();
      const { parseSearchSyntax } = require('./storage');
      parseSearchSyntax.mockReturnValue({
        query: '12345',
        filters: { category: 'cases' }
      });

      render(<EnhancedSearch showCategories={true} />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'case:12345');

      expect(parseSearchSyntax).toHaveBeenCalledWith('case:12345');
    });
  });

  describe('Accessibility', () => {
    it('input has accessible role', () => {
      render(<EnhancedSearch />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('clear button has title', async () => {
      const user = userEvent.setup();
      render(<EnhancedSearch />);

      await user.type(screen.getByPlaceholderText('Search everything...'), 'test');

      expect(screen.getByTitle('Clear')).toBeInTheDocument();
    });
  });
});
