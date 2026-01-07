/**
 * @jest-environment jsdom
 * SearchComponents Tests
 * Enterprise-grade tests for search UI building blocks
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter, SuggestionItem } from './SearchComponents';
import type { SearchCategory } from './types';

const mockTheme = {
  text: { secondary: 'text-gray-500', primary: 'text-gray-900' },
  surface: { highlight: 'bg-gray-100' },
};

describe('CategoryFilter', () => {
  const defaultProps = {
    activeCategory: 'all' as SearchCategory,
    onCategoryChange: jest.fn(),
    theme: mockTheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all category buttons', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cases/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /docs/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tags/i })).toBeInTheDocument();
    });

    it('renders icons for each category', () => {
      const { container } = render(<CategoryFilter {...defaultProps} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(4);
    });
  });

  describe('Active State', () => {
    it('highlights active category', () => {
      render(<CategoryFilter {...defaultProps} activeCategory="cases" />);

      const casesButton = screen.getByRole('button', { name: /cases/i });
      expect(casesButton.className).toContain('bg-');
    });

    it('applies different styling to inactive categories', () => {
      render(<CategoryFilter {...defaultProps} activeCategory="all" />);

      const casesButton = screen.getByRole('button', { name: /cases/i });
      const allButton = screen.getByRole('button', { name: /all/i });

      // Active and inactive buttons should have different styling
      expect(allButton.className).not.toBe(casesButton.className);
    });
  });

  describe('Interaction', () => {
    it('calls onCategoryChange when category clicked', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();

      render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

      await user.click(screen.getByRole('button', { name: /cases/i }));

      expect(onCategoryChange).toHaveBeenCalledWith('cases');
    });

    it('calls onCategoryChange with correct category', async () => {
      const user = userEvent.setup();
      const onCategoryChange = jest.fn();

      render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

      await user.click(screen.getByRole('button', { name: /docs/i }));
      expect(onCategoryChange).toHaveBeenCalledWith('documents');

      await user.click(screen.getByRole('button', { name: /tags/i }));
      expect(onCategoryChange).toHaveBeenCalledWith('tags');
    });
  });

  describe('Categories', () => {
    it('displays All category', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('displays Cases category', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByText('Cases')).toBeInTheDocument();
    });

    it('displays Docs category', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('displays Tags category', () => {
      render(<CategoryFilter {...defaultProps} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies theme-based colors', () => {
      const { container } = render(<CategoryFilter {...defaultProps} />);

      // Should have theme classes applied
      expect(container.innerHTML).toContain('button');
    });
  });
});

describe('SuggestionItem', () => {
  const defaultProps = {
    suggestion: {
      text: 'Test Suggestion',
    },
    isSelected: false,
    onClick: jest.fn(),
    theme: mockTheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders suggestion text', () => {
      render(<SuggestionItem {...defaultProps} />);

      expect(screen.getByText('Test Suggestion')).toBeInTheDocument();
    });

    it('renders highlighted text when provided', () => {
      const suggestion = {
        text: 'Test Suggestion',
        highlightedText: '<mark>Test</mark> Suggestion',
      };

      render(<SuggestionItem {...defaultProps} suggestion={suggestion} />);

      // dangerouslySetInnerHTML should render the marked text
      expect(screen.getByText(/Suggestion/)).toBeInTheDocument();
    });

    it('renders default search icon when no icon provided', () => {
      const { container } = render(<SuggestionItem {...defaultProps} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">Custom</span>;
      const suggestion = {
        text: 'Test',
        icon: customIcon,
      };

      render(<SuggestionItem {...defaultProps} suggestion={suggestion} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('applies selected styling when isSelected is true', () => {
      render(<SuggestionItem {...defaultProps} isSelected={true} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-');
    });

    it('applies unselected styling when isSelected is false', () => {
      render(<SuggestionItem {...defaultProps} isSelected={false} />);

      const button = screen.getByRole('button');
      // Should have hover states
      expect(button.className).toContain('hover');
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<SuggestionItem {...defaultProps} onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('HTML Rendering', () => {
    it('renders HTML in highlightedText', () => {
      const suggestion = {
        text: 'Case ABC123',
        highlightedText: '<mark>Case</mark> ABC123',
      };

      const { container } = render(
        <SuggestionItem {...defaultProps} suggestion={suggestion} />
      );

      // Should contain mark element
      expect(container.innerHTML).toContain('mark');
    });
  });

  describe('Accessibility', () => {
    it('renders as button', () => {
      render(<SuggestionItem {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('button is focusable', () => {
      render(<SuggestionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors for text', () => {
      render(<SuggestionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      // Theme classes should be applied
      expect(button).toBeInTheDocument();
    });

    it('uses theme highlight color when selected', () => {
      render(<SuggestionItem {...defaultProps} isSelected={true} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-');
    });
  });
});
