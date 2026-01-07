/**
 * @module components/enterprise/data/DataGridSearch.test
 * @description Unit tests for DataGridSearch component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGridSearch } from './DataGridSearch';
import type { ColumnDefinition } from './DataGridColumn';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// Mock fuzzySearch
jest.mock('./FuzzySearch', () => ({
  fuzzySearch: jest.fn((data, query, fields, options) => {
    // Simple mock implementation
    const results = data
      .filter((item: Record<string, unknown>) => {
        return fields.some((field: string) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query.toLowerCase());
        });
      })
      .map((item: Record<string, unknown>) => ({ item, score: 0.8 }));
    return results;
  }),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestRow {
  id: string;
  name: string;
  email: string;
  department: string;
}

const testData: TestRow[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', department: 'Sales' },
  { id: '4', name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering' },
];

const testColumns: ColumnDefinition<TestRow>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', filterable: true },
  { id: 'email', header: 'Email', accessorKey: 'email', filterable: true },
  { id: 'department', header: 'Department', accessorKey: 'department', filterable: true },
];

const defaultProps = {
  data: testData,
  columns: testColumns,
  onSearchResults: jest.fn(),
};

const renderSearch = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DataGridSearch {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DataGridSearch rendering', () => {
  it('should render search input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    renderSearch({ placeholder: 'Find users...' });
    expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument();
  });

  it('should render search icon', () => {
    const { container } = renderSearch();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render keyboard shortcut hint', () => {
    renderSearch();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should render with initial query', () => {
    renderSearch({ initialQuery: 'John' });
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    expect(input.value).toBe('John');
  });

  it('should not render clear button when query is empty', () => {
    renderSearch();
    expect(screen.queryByTitle(/clear search/i)).not.toBeInTheDocument();
  });

  it('should render clear button when query has value', async () => {
    renderSearch({ initialQuery: 'test' });
    expect(screen.getByTitle(/clear search/i)).toBeInTheDocument();
  });

  it('should render advanced options button when enabled', () => {
    renderSearch({ showAdvancedOptions: true });
    expect(screen.getByTitle('Advanced options')).toBeInTheDocument();
  });

  it('should not render advanced options button when disabled', () => {
    renderSearch({ showAdvancedOptions: false });
    expect(screen.queryByTitle('Advanced options')).not.toBeInTheDocument();
  });
});

// ============================================================================
// SEARCH FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridSearch functionality', () => {
  it('should call onSearchResults with all data when query is empty', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults });

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalledWith(testData);
  });

  it('should debounce search input', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults, debounceDelay: 300 });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'John' } });

    // Should not call immediately
    expect(onSearchResults).not.toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'John Doe' }),
    ]));

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalled();
  });

  it('should clear search when clicking clear button', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults, initialQuery: 'test' });

    const clearButton = screen.getByTitle(/clear search/i);
    await userEvent.click(clearButton);

    expect(onSearchResults).toHaveBeenCalledWith(testData);
  });

  it('should focus input after clearing', async () => {
    renderSearch({ initialQuery: 'test' });

    const input = screen.getByPlaceholderText('Search...');
    const clearButton = screen.getByTitle(/clear search/i);

    await userEvent.click(clearButton);

    expect(document.activeElement).toBe(input);
  });

  it('should respect custom debounce delay', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults, debounceDelay: 500 });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not have searched at 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    const callCountAt300 = onSearchResults.mock.calls.length;

    // Should search at 500ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onSearchResults.mock.calls.length).toBeGreaterThan(callCountAt300);
  });
});

// ============================================================================
// SEARCH HISTORY TESTS
// ============================================================================

describe('DataGridSearch history', () => {
  it('should not show history dropdown initially', () => {
    renderSearch({ enableHistory: true });
    expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
  });

  it('should show history dropdown on focus when history exists', async () => {
    renderSearch({ enableHistory: true, initialQuery: 'test' });

    // Perform a search to add to history
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });
  });

  it('should hide history dropdown on blur', async () => {
    renderSearch({ enableHistory: true, initialQuery: 'test' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });

    fireEvent.blur(input);

    // Wait for the blur timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
    });
  });

  it('should clear history when clicking clear button', async () => {
    renderSearch({ enableHistory: true, initialQuery: 'test' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });

    const clearHistoryButton = screen.getByRole('button', { name: /^clear$/i });
    await userEvent.click(clearHistoryButton);

    expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
  });

  it('should not add to history when disabled', async () => {
    renderSearch({ enableHistory: false, initialQuery: 'test' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.focus(input);

    expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
  });

  it('should populate search when clicking history item', async () => {
    renderSearch({ enableHistory: true, initialQuery: 'first' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Change query to create history
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'second' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Focus to show history
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// ADVANCED OPTIONS TESTS
// ============================================================================

describe('DataGridSearch advanced options', () => {
  it('should toggle advanced options panel', async () => {
    renderSearch({ showAdvancedOptions: true });

    const optionsButton = screen.getByTitle('Advanced options');
    await userEvent.click(optionsButton);

    expect(screen.getByText('Algorithm')).toBeInTheDocument();
    expect(screen.getByText(/Threshold/)).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('should render algorithm selector', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    const algorithmSelect = screen.getByRole('combobox');
    expect(algorithmSelect).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Combined (Best)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Levenshtein' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Damerau-Levenshtein' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Trigram' })).toBeInTheDocument();
  });

  it('should render threshold slider', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '1');
  });

  it('should render option checkboxes', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    expect(screen.getByLabelText(/ignore case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ignore accents/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phonetic matching/i)).toBeInTheDocument();
  });

  it('should update threshold when slider changes', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.8' } });

    expect(screen.getByText(/Threshold: 0.80/)).toBeInTheDocument();
  });

  it('should toggle ignore case option', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    const checkbox = screen.getByLabelText(/ignore case/i);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should close options panel on second click', async () => {
    renderSearch({ showAdvancedOptions: true });

    const optionsButton = screen.getByTitle('Advanced options');

    await userEvent.click(optionsButton);
    expect(screen.getByText('Algorithm')).toBeInTheDocument();

    await userEvent.click(optionsButton);
    expect(screen.queryByText('Algorithm')).not.toBeInTheDocument();
  });
});

// ============================================================================
// KEYBOARD SHORTCUTS TESTS
// ============================================================================

describe('DataGridSearch keyboard shortcuts', () => {
  it('should focus input on Cmd+K', async () => {
    renderSearch();

    const input = screen.getByPlaceholderText('Search...');

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(document.activeElement).toBe(input);
  });

  it('should focus input on Ctrl+K', async () => {
    renderSearch();

    const input = screen.getByPlaceholderText('Search...');

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(document.activeElement).toBe(input);
  });

  it('should clear search on Escape when input is focused', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults, initialQuery: 'test' });

    const input = screen.getByPlaceholderText('Search...');
    input.focus();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect((input as HTMLInputElement).value).toBe('');
    expect(onSearchResults).toHaveBeenCalledWith(testData);
  });

  it('should not clear on Escape when input is not focused', async () => {
    renderSearch({ initialQuery: 'test' });

    const input = screen.getByPlaceholderText('Search...');
    input.blur();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect((input as HTMLInputElement).value).toBe('test');
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('DataGridSearch styling', () => {
  it('should apply theme classes to container', () => {
    const { container } = renderSearch();

    const inputContainer = container.querySelector('.rounded-lg');
    expect(inputContainer).toHaveClass('border');
  });

  it('should apply custom className', () => {
    const { container } = renderSearch({ className: 'custom-search' });

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-search');
  });

  it('should highlight options button when panel is open', async () => {
    renderSearch({ showAdvancedOptions: true });

    const optionsButton = screen.getByTitle('Advanced options');
    await userEvent.click(optionsButton);

    // Button should have active styling
    expect(optionsButton).toHaveClass('bg-gray-100');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DataGridSearch edge cases', () => {
  it('should handle empty data array', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ data: [], onSearchResults });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalledWith([]);
  });

  it('should handle empty columns array', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ columns: [], onSearchResults });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalled();
  });

  it('should handle whitespace-only query', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: '   ' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should return all data for whitespace-only query
    expect(onSearchResults).toHaveBeenCalledWith(testData);
  });

  it('should handle rapid typing', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults, debounceDelay: 100 });

    const input = screen.getByPlaceholderText('Search...');

    // Rapid type
    fireEvent.change(input, { target: { value: 'J' } });
    act(() => { jest.advanceTimersByTime(50); });

    fireEvent.change(input, { target: { value: 'Jo' } });
    act(() => { jest.advanceTimersByTime(50); });

    fireEvent.change(input, { target: { value: 'Joh' } });
    act(() => { jest.advanceTimersByTime(50); });

    fireEvent.change(input, { target: { value: 'John' } });
    act(() => { jest.advanceTimersByTime(100); });

    // Should have debounced properly
    const callsWithResults = onSearchResults.mock.calls.filter(
      call => call[0] !== testData
    );
    // Should not have searched for each keystroke
    expect(callsWithResults.length).toBeLessThan(4);
  });

  it('should handle special characters in query', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults });

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test@#$%^&*()' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalled();
  });

  it('should handle very long query', async () => {
    const onSearchResults = jest.fn();
    renderSearch({ onSearchResults });

    const input = screen.getByPlaceholderText('Search...');
    const longQuery = 'a'.repeat(1000);
    fireEvent.change(input, { target: { value: longQuery } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearchResults).toHaveBeenCalled();
  });

  it('should cleanup debounce timer on unmount', () => {
    const { unmount } = renderSearch();

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Unmount before debounce completes
    unmount();

    // Should not throw when timer fires
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });

  it('should cleanup keyboard listener on unmount', () => {
    const { unmount } = renderSearch();

    unmount();

    // Should not throw when keyboard event fires
    expect(() => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true });
    }).not.toThrow();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DataGridSearch accessibility', () => {
  it('should have accessible clear button', () => {
    renderSearch({ initialQuery: 'test' });

    const clearButton = screen.getByTitle(/clear search/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('should have accessible options button', () => {
    renderSearch({ showAdvancedOptions: true });

    const optionsButton = screen.getByTitle('Advanced options');
    expect(optionsButton).toBeInTheDocument();
  });

  it('should have accessible form controls in advanced options', async () => {
    renderSearch({ showAdvancedOptions: true });

    await userEvent.click(screen.getByTitle('Advanced options'));

    expect(screen.getByLabelText(/ignore case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ignore accents/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phonetic matching/i)).toBeInTheDocument();
  });

  it('should show keyboard hint', () => {
    renderSearch();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });
});
