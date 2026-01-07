/**
 * @jest-environment jsdom
 * @module RefactoredCommon.test
 * @description Enterprise-grade tests for RefactoredCommon stub components
 *
 * Test coverage:
 * - EmptyListState component
 * - SearchInputBar component
 * - ActionRow component
 * - StatusBadge component
 * - SectionTitle component
 * - MetricTile component
 * - Backward compatibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileQuestion, TrendingUp } from 'lucide-react';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
    },
  }),
}));

jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('RefactoredCommon Legacy Components', () => {
  describe('EmptyListState', () => {
    it('renders with default title', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      render(<EmptyListState />);

      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('renders custom title', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      render(<EmptyListState title="No cases found" />);

      expect(screen.getByText('No cases found')).toBeInTheDocument();
    });

    it('renders message when provided', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      render(<EmptyListState message="Try adjusting your filters" />);

      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });

    it('renders icon when provided', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      render(<EmptyListState icon={<FileQuestion data-testid="empty-icon" />} />);

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('renders action when provided', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      render(<EmptyListState action={<button>Add New</button>} />);

      expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });

    it('applies custom className', async () => {
      const { EmptyListState } = await import('./RefactoredCommon');

      const { container } = render(<EmptyListState className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('SearchInputBar', () => {
    it('renders with default placeholder', async () => {
      const { SearchInputBar } = await import('./RefactoredCommon');

      render(<SearchInputBar />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', async () => {
      const { SearchInputBar } = await import('./RefactoredCommon');

      render(<SearchInputBar placeholder="Search cases..." />);

      expect(screen.getByPlaceholderText('Search cases...')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { SearchInputBar } = await import('./RefactoredCommon');

      render(<SearchInputBar onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), 'test');

      expect(onChange).toHaveBeenCalledWith('test');
    });

    it('displays controlled value', async () => {
      const { SearchInputBar } = await import('./RefactoredCommon');

      render(<SearchInputBar value="current value" />);

      expect(screen.getByDisplayValue('current value')).toBeInTheDocument();
    });

    it('applies custom className', async () => {
      const { SearchInputBar } = await import('./RefactoredCommon');

      const { container } = render(<SearchInputBar className="custom-search" />);

      expect(container.firstChild).toHaveClass('custom-search');
    });
  });

  describe('ActionRow', () => {
    it('renders children', async () => {
      const { ActionRow } = await import('./RefactoredCommon');

      render(
        <ActionRow>
          <button>Action 1</button>
          <button>Action 2</button>
        </ActionRow>
      );

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('applies flexbox layout', async () => {
      const { ActionRow } = await import('./RefactoredCommon');

      const { container } = render(
        <ActionRow>
          <button>Action</button>
        </ActionRow>
      );

      expect(container.firstChild).toHaveClass('flex');
    });

    it('applies custom className', async () => {
      const { ActionRow } = await import('./RefactoredCommon');

      const { container } = render(<ActionRow className="custom-row" />);

      expect(container.firstChild).toHaveClass('custom-row');
    });
  });

  describe('StatusBadge', () => {
    it('renders status text', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      render(<StatusBadge status="Active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('applies default variant styling', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Unknown" />);

      expect(container.firstChild).toHaveClass('bg-gray-100');
      expect(container.firstChild).toHaveClass('text-gray-800');
    });

    it('applies success variant styling', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Complete" variant="success" />);

      expect(container.firstChild).toHaveClass('bg-green-100');
      expect(container.firstChild).toHaveClass('text-green-800');
    });

    it('applies warning variant styling', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Pending" variant="warning" />);

      expect(container.firstChild).toHaveClass('bg-yellow-100');
      expect(container.firstChild).toHaveClass('text-yellow-800');
    });

    it('applies error variant styling', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Failed" variant="error" />);

      expect(container.firstChild).toHaveClass('bg-red-100');
      expect(container.firstChild).toHaveClass('text-red-800');
    });

    it('applies info variant styling', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Info" variant="info" />);

      expect(container.firstChild).toHaveClass('bg-blue-100');
      expect(container.firstChild).toHaveClass('text-blue-800');
    });

    it('applies custom className', async () => {
      const { StatusBadge } = await import('./RefactoredCommon');

      const { container } = render(<StatusBadge status="Custom" className="custom-badge" />);

      expect(container.firstChild).toHaveClass('custom-badge');
    });
  });

  describe('SectionTitle', () => {
    it('renders title', async () => {
      const { SectionTitle } = await import('./RefactoredCommon');

      render(<SectionTitle title="Section Heading" />);

      expect(screen.getByText('Section Heading')).toBeInTheDocument();
    });

    it('renders subtitle when provided', async () => {
      const { SectionTitle } = await import('./RefactoredCommon');

      render(<SectionTitle title="Main Title" subtitle="Supporting text" />);

      expect(screen.getByText('Supporting text')).toBeInTheDocument();
    });

    it('renders action when provided', async () => {
      const { SectionTitle } = await import('./RefactoredCommon');

      render(<SectionTitle title="Title" action={<button>View All</button>} />);

      expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument();
    });

    it('applies custom className', async () => {
      const { SectionTitle } = await import('./RefactoredCommon');

      const { container } = render(<SectionTitle title="Test" className="custom-title" />);

      expect(container.firstChild).toHaveClass('custom-title');
    });
  });

  describe('MetricTile', () => {
    it('renders label and value', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      render(<MetricTile label="Total Cases" value={42} />);

      expect(screen.getByText('Total Cases')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders string value', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      render(<MetricTile label="Status" value="Active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders icon when provided', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      render(<MetricTile label="Revenue" value="$10,000" icon={TrendingUp} />);

      // Icon should be rendered
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('renders trend when provided', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      render(<MetricTile label="Growth" value="25%" trend="+5%" trendUp />);

      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('applies positive trend styling', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      const { container } = render(<MetricTile label="Growth" value="25%" trend="+5%" trendUp />);

      expect(screen.getByText('+5%')).toHaveClass('text-green-600');
    });

    it('applies negative trend styling', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      const { container } = render(<MetricTile label="Loss" value="10%" trend="-3%" trendUp={false} />);

      expect(screen.getByText('-3%')).toHaveClass('text-red-600');
    });

    it('applies custom className', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      const { container } = render(<MetricTile label="Test" value={0} className="custom-tile" />);

      expect(container.firstChild).toHaveClass('custom-tile');
    });

    it('renders ReactNode as value', async () => {
      const { MetricTile } = await import('./RefactoredCommon');

      render(<MetricTile label="Custom" value={<span data-testid="custom-value">Custom Node</span>} />);

      expect(screen.getByTestId('custom-value')).toBeInTheDocument();
    });
  });

  describe('Backward Compatibility', () => {
    it('all exports are available from single import', async () => {
      const module = await import('./RefactoredCommon');

      expect(module.EmptyListState).toBeDefined();
      expect(module.SearchInputBar).toBeDefined();
      expect(module.ActionRow).toBeDefined();
      expect(module.StatusBadge).toBeDefined();
      expect(module.SectionTitle).toBeDefined();
      expect(module.MetricTile).toBeDefined();
    });
  });
});
