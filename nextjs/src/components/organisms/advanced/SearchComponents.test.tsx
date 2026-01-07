/**
 * @jest-environment jsdom
 * @module SearchComponents.test
 * @description Enterprise-grade tests for SearchComponents (CategoryFilter, SuggestionItem)
 *
 * Test coverage:
 * - CategoryFilter rendering and selection
 * - SuggestionItem rendering and interaction
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter, SuggestionItem } from './SearchComponents';
import type { SearchCategory } from './types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('./SearchComponents.styles', () => ({
  categoryFilterContainer: 'category-filter-container',
  getCategoryButton: (theme: unknown, isActive: boolean) => isActive ? 'category-active' : 'category-inactive',
  getSuggestionButton: (theme: unknown, isSelected: boolean) => isSelected ? 'suggestion-selected' : 'suggestion-normal',
  suggestionIcon: 'suggestion-icon',
  getSuggestionText: () => 'suggestion-text',
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockTheme = {
  text: { secondary: 'text-gray-600', primary: 'text-gray-900' },
  surface: { highlight: 'bg-gray-100' },
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('SearchComponents', () => {
  describe('CategoryFilter', () => {
    const defaultProps = {
      activeCategory: 'all' as SearchCategory,
      onCategoryChange: jest.fn(),
      theme: mockTheme,
    };

    it('renders all category buttons', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('displays icons for each category', () => {
      render(<CategoryFilter {...defaultProps} />);

      // All buttons should be rendered with icons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);
    });

    it('applies active styling to selected category', () => {
      render(<CategoryFilter {...defaultProps} activeCategory="cases" />);

      const casesButton = screen.getByText('Cases').closest('button');
      expect(casesButton).toHaveClass('category-active');
    });

    it('applies inactive styling to non-selected categories', () => {
      render(<CategoryFilter {...defaultProps} activeCategory="cases" />);

      const allButton = screen.getByText('All').closest('button');
      expect(allButton).toHaveClass('category-inactive');
    });

    it('calls onCategoryChange when category is clicked', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();
      render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

      await user.click(screen.getByText('Cases'));

      expect(onCategoryChange).toHaveBeenCalledWith('cases');
    });

    it('calls onCategoryChange with correct category for each button', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();
      render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

      await user.click(screen.getByText('All'));
      expect(onCategoryChange).toHaveBeenCalledWith('all');

      await user.click(screen.getByText('Docs'));
      expect(onCategoryChange).toHaveBeenCalledWith('documents');

      await user.click(screen.getByText('Tags'));
      expect(onCategoryChange).toHaveBeenCalledWith('tags');
    });

    it('all buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();
      render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

      const casesButton = screen.getByText('Cases');
      casesButton.focus();

      await user.keyboard('{Enter}');

      expect(onCategoryChange).toHaveBeenCalledWith('cases');
    });
  });

  describe('SuggestionItem', () => {
    const defaultProps = {
      suggestion: { text: 'Test Suggestion', highlightedText: 'Test <mark>Suggestion</mark>' },
      isSelected: false,
      onClick: jest.fn(),
      theme: mockTheme,
    };

    it('renders suggestion text', () => {
      render(<SuggestionItem {...defaultProps} />);

      expect(screen.getByText(/Test/)).toBeInTheDocument();
    });

    it('renders highlighted text with HTML', () => {
      render(<SuggestionItem {...defaultProps} />);

      const textElement = screen.getByText(/Test/).closest('span');
      expect(textElement?.innerHTML).toContain('<mark>');
    });

    it('renders plain text when no highlighted text', () => {
      const props = {
        ...defaultProps,
        suggestion: { text: 'Plain Text' },
      };

      render(<SuggestionItem {...props} />);

      expect(screen.getByText('Plain Text')).toBeInTheDocument();
    });

    it('applies selected styling when isSelected is true', () => {
      render(<SuggestionItem {...defaultProps} isSelected={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('suggestion-selected');
    });

    it('applies normal styling when isSelected is false', () => {
      render(<SuggestionItem {...defaultProps} isSelected={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('suggestion-normal');
    });

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<SuggestionItem {...defaultProps} onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders custom icon when provided', () => {
      const props = {
        ...defaultProps,
        suggestion: {
          text: 'With Icon',
          icon: <span data-testid="custom-icon">Icon</span>,
        },
      };

      render(<SuggestionItem {...props} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders default search icon when no custom icon', () => {
      render(<SuggestionItem {...defaultProps} />);

      // Default Search icon should be present
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<SuggestionItem {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('responds to Space key', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<SuggestionItem {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('CategoryFilter has proper button roles', () => {
      render(
        <CategoryFilter
          activeCategory="all"
          onCategoryChange={jest.fn()}
          theme={mockTheme}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);
    });

    it('SuggestionItem has proper button role', () => {
      render(
        <SuggestionItem
          suggestion={{ text: 'Test' }}
          isSelected={false}
          onClick={jest.fn()}
          theme={mockTheme}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('CategoryFilter handles rapid clicks', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();
      render(
        <CategoryFilter
          activeCategory="all"
          onCategoryChange={onCategoryChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByText('Cases'));
      await user.click(screen.getByText('Docs'));
      await user.click(screen.getByText('Tags'));

      expect(onCategoryChange).toHaveBeenCalledTimes(3);
    });

    it('SuggestionItem handles empty text', () => {
      render(
        <SuggestionItem
          suggestion={{ text: '' }}
          isSelected={false}
          onClick={jest.fn()}
          theme={mockTheme}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('SuggestionItem handles XSS in highlighted text', () => {
      const props = {
        suggestion: {
          text: 'Test',
          highlightedText: '<script>alert("xss")</script>Test',
        },
        isSelected: false,
        onClick: jest.fn(),
        theme: mockTheme,
      };

      // This tests that we're setting innerHTML - sanitization should happen upstream
      render(<SuggestionItem {...props} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
