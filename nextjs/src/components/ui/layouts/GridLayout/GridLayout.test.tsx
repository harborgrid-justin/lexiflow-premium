import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridLayout } from './GridLayout';

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('GridLayout', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <GridLayout>
          <div data-testid="child-1">Item 1</div>
          <div data-testid="child-2">Item 2</div>
          <div data-testid="child-3">Item 3</div>
        </GridLayout>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('uses grid display', () => {
      const { container } = render(
        <GridLayout>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('grid');
    });
  });

  describe('Columns', () => {
    it('uses 3 columns by default', () => {
      const { container } = render(
        <GridLayout>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('lg:grid-cols-3');
    });

    it('renders 1 column', () => {
      const { container } = render(
        <GridLayout columns={1}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('grid-cols-1');
    });

    it('renders 2 columns', () => {
      const { container } = render(
        <GridLayout columns={2}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('md:grid-cols-2');
    });

    it('renders 4 columns', () => {
      const { container } = render(
        <GridLayout columns={4}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('lg:grid-cols-4');
    });

    it('renders 5 columns', () => {
      const { container } = render(
        <GridLayout columns={5}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('xl:grid-cols-5');
    });

    it('renders 6 columns', () => {
      const { container } = render(
        <GridLayout columns={6}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('xl:grid-cols-6');
    });
  });

  describe('Gap', () => {
    it('uses medium gap by default', () => {
      const { container } = render(
        <GridLayout>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-4');
    });

    it('renders with no gap', () => {
      const { container } = render(
        <GridLayout gap="none">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-0');
    });

    it('renders with small gap', () => {
      const { container } = render(
        <GridLayout gap="sm">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-2');
    });

    it('renders with large gap', () => {
      const { container } = render(
        <GridLayout gap="lg">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });

    it('renders with xl gap', () => {
      const { container } = render(
        <GridLayout gap="xl">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-8');
    });
  });

  describe('Auto-Fit Mode', () => {
    it('uses auto-fit when enabled', () => {
      const { container } = render(
        <GridLayout autoFit>
          <div>Item</div>
        </GridLayout>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toContain('auto-fit');
    });

    it('uses default minItemWidth in auto-fit mode', () => {
      const { container } = render(
        <GridLayout autoFit>
          <div>Item</div>
        </GridLayout>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toContain('250px');
    });

    it('uses custom minItemWidth in auto-fit mode', () => {
      const { container } = render(
        <GridLayout autoFit minItemWidth="300px">
          <div>Item</div>
        </GridLayout>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toContain('300px');
    });

    it('applies gap in auto-fit mode', () => {
      const { container } = render(
        <GridLayout autoFit gap="lg">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <GridLayout className="custom-grid">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('custom-grid');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <GridLayout className="my-custom-class">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('my-custom-class');
      expect(container.firstChild).toHaveClass('grid');
    });

    it('handles empty className', () => {
      const { container } = render(
        <GridLayout className="">
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('grid');
    });
  });

  describe('Responsive Behavior', () => {
    it('starts with 1 column on mobile for multi-column layouts', () => {
      const { container } = render(
        <GridLayout columns={3}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('grid-cols-1');
    });

    it('increases columns at md breakpoint', () => {
      const { container } = render(
        <GridLayout columns={3}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('md:grid-cols-2');
    });

    it('reaches full columns at lg breakpoint for 3 columns', () => {
      const { container } = render(
        <GridLayout columns={3}>
          <div>Item</div>
        </GridLayout>
      );
      expect(container.firstChild).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Use Cases', () => {
    it('works for card grid', () => {
      render(
        <GridLayout columns={3} gap="lg">
          <div data-testid="card-1">Card 1</div>
          <div data-testid="card-2">Card 2</div>
          <div data-testid="card-3">Card 3</div>
        </GridLayout>
      );
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-3')).toBeInTheDocument();
    });

    it('works for stat cards', () => {
      render(
        <GridLayout columns={4}>
          <div data-testid="stat-1">Revenue: $10k</div>
          <div data-testid="stat-2">Users: 500</div>
          <div data-testid="stat-3">Orders: 200</div>
          <div data-testid="stat-4">Growth: 15%</div>
        </GridLayout>
      );
      expect(screen.getByTestId('stat-1')).toBeInTheDocument();
      expect(screen.getByTestId('stat-4')).toBeInTheDocument();
    });

    it('works for gallery', () => {
      render(
        <GridLayout autoFit minItemWidth="200px" gap="sm">
          <img data-testid="img-1" src="1.jpg" alt="Image 1" />
          <img data-testid="img-2" src="2.jpg" alt="Image 2" />
          <img data-testid="img-3" src="3.jpg" alt="Image 3" />
        </GridLayout>
      );
      expect(screen.getByTestId('img-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single child', () => {
      render(
        <GridLayout>
          <div data-testid="single">Single Item</div>
        </GridLayout>
      );
      expect(screen.getByTestId('single')).toBeInTheDocument();
    });

    it('handles empty children', () => {
      const { container } = render(<GridLayout>{null}</GridLayout>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles many children', () => {
      const items = Array.from({ length: 20 }, (_, i) => (
        <div key={i} data-testid={`item-${i}`}>Item {i}</div>
      ));
      render(<GridLayout>{items}</GridLayout>);
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-19')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <GridLayout
          columns={4}
          gap="lg"
          className="custom-grid"
        >
          <div data-testid="complete-item">Complete</div>
        </GridLayout>
      );

      expect(container.firstChild).toHaveClass('grid');
      expect(container.firstChild).toHaveClass('lg:grid-cols-4');
      expect(container.firstChild).toHaveClass('gap-6');
      expect(container.firstChild).toHaveClass('custom-grid');
      expect(screen.getByTestId('complete-item')).toBeInTheDocument();
    });
  });
});
