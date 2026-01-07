import React from 'react';
import { render, screen } from '@testing-library/react';
import { StackLayout } from './StackLayout';

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('StackLayout', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <StackLayout>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </StackLayout>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('renders with single child', () => {
      render(
        <StackLayout>
          <div data-testid="single">Single Child</div>
        </StackLayout>
      );
      expect(screen.getByTestId('single')).toBeInTheDocument();
    });

    it('uses flex display', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('flex');
    });
  });

  describe('Direction', () => {
    it('uses vertical direction by default', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('applies horizontal direction', () => {
      const { container } = render(
        <StackLayout direction="horizontal">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('flex-row');
    });
  });

  describe('Spacing', () => {
    it('uses medium spacing by default', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-4');
    });

    it('applies no spacing', () => {
      const { container } = render(
        <StackLayout spacing="none">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-0');
    });

    it('applies xs spacing', () => {
      const { container } = render(
        <StackLayout spacing="xs">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-1');
    });

    it('applies sm spacing', () => {
      const { container } = render(
        <StackLayout spacing="sm">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-2');
    });

    it('applies lg spacing', () => {
      const { container } = render(
        <StackLayout spacing="lg">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('applies xl spacing', () => {
      const { container } = render(
        <StackLayout spacing="xl">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-y-8');
    });

    it('uses horizontal spacing for horizontal direction', () => {
      const { container } = render(
        <StackLayout direction="horizontal" spacing="md">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('space-x-4');
    });
  });

  describe('Alignment', () => {
    it('uses stretch alignment by default', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('items-stretch');
    });

    it('applies start alignment', () => {
      const { container } = render(
        <StackLayout align="start">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('items-start');
    });

    it('applies center alignment', () => {
      const { container } = render(
        <StackLayout align="center">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('applies end alignment', () => {
      const { container } = render(
        <StackLayout align="end">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('items-end');
    });
  });

  describe('Justification', () => {
    it('uses start justification by default', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('justify-start');
    });

    it('applies center justification', () => {
      const { container } = render(
        <StackLayout justify="center">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('justify-center');
    });

    it('applies end justification', () => {
      const { container } = render(
        <StackLayout justify="end">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('justify-end');
    });

    it('applies between justification', () => {
      const { container } = render(
        <StackLayout justify="between">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('justify-between');
    });

    it('applies around justification', () => {
      const { container } = render(
        <StackLayout justify="around">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('justify-around');
    });
  });

  describe('Wrap', () => {
    it('does not wrap by default', () => {
      const { container } = render(
        <StackLayout>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).not.toHaveClass('flex-wrap');
    });

    it('applies wrap when enabled', () => {
      const { container } = render(
        <StackLayout wrap>
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('flex-wrap');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StackLayout className="custom-stack">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('custom-stack');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <StackLayout className="my-custom-class">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('my-custom-class');
      expect(container.firstChild).toHaveClass('flex');
    });

    it('handles empty className', () => {
      const { container } = render(
        <StackLayout className="">
          <div>Child</div>
        </StackLayout>
      );
      expect(container.firstChild).toHaveClass('flex');
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(StackLayout.displayName).toBe('StackLayout');
    });
  });

  describe('Use Cases', () => {
    it('works for form layout', () => {
      render(
        <StackLayout spacing="md">
          <input data-testid="input-1" placeholder="Name" />
          <input data-testid="input-2" placeholder="Email" />
          <button data-testid="submit">Submit</button>
        </StackLayout>
      );
      expect(screen.getByTestId('input-1')).toBeInTheDocument();
      expect(screen.getByTestId('input-2')).toBeInTheDocument();
      expect(screen.getByTestId('submit')).toBeInTheDocument();
    });

    it('works for button group', () => {
      render(
        <StackLayout direction="horizontal" spacing="sm">
          <button>Cancel</button>
          <button>Save</button>
          <button>Delete</button>
        </StackLayout>
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('works for toolbar', () => {
      render(
        <StackLayout direction="horizontal" justify="between" align="center">
          <span>Logo</span>
          <nav>Navigation</nav>
          <button>Profile</button>
        </StackLayout>
      );
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('works for card content', () => {
      render(
        <StackLayout spacing="sm">
          <h2>Card Title</h2>
          <p>Card description</p>
          <span>Additional info</span>
        </StackLayout>
      );
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<StackLayout>{null}</StackLayout>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles many children', () => {
      const items = Array.from({ length: 20 }, (_, i) => (
        <div key={i} data-testid={`item-${i}`}>Item {i}</div>
      ));
      render(<StackLayout>{items}</StackLayout>);
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-19')).toBeInTheDocument();
    });

    it('handles nested StackLayouts', () => {
      render(
        <StackLayout>
          <StackLayout direction="horizontal" data-testid="inner-stack">
            <div data-testid="nested-child">Nested</div>
          </StackLayout>
        </StackLayout>
      );
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <StackLayout
          direction="horizontal"
          spacing="lg"
          align="center"
          justify="between"
          wrap
          className="complete-stack"
        >
          <div data-testid="complete-child">Complete</div>
        </StackLayout>
      );

      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-row');
      expect(container.firstChild).toHaveClass('space-x-6');
      expect(container.firstChild).toHaveClass('items-center');
      expect(container.firstChild).toHaveClass('justify-between');
      expect(container.firstChild).toHaveClass('flex-wrap');
      expect(container.firstChild).toHaveClass('complete-stack');
      expect(screen.getByTestId('complete-child')).toBeInTheDocument();
    });
  });
});
