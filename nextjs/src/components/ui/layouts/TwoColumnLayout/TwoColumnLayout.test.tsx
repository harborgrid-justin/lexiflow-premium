import React from 'react';
import { render, screen } from '@testing-library/react';
import { TwoColumnLayout } from './TwoColumnLayout';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {},
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('TwoColumnLayout', () => {
  const defaultProps = {
    leftColumn: <div data-testid="left-column">Left Content</div>,
    rightColumn: <div data-testid="right-column">Right Content</div>,
  };

  describe('Rendering', () => {
    it('renders both columns', () => {
      render(<TwoColumnLayout {...defaultProps} />);
      expect(screen.getByTestId('left-column')).toBeInTheDocument();
      expect(screen.getByTestId('right-column')).toBeInTheDocument();
    });

    it('renders columns in correct order', () => {
      const { container } = render(<TwoColumnLayout {...defaultProps} />);
      const flexContainer = container.firstChild as HTMLElement;
      const columns = Array.from(flexContainer.children);

      expect(columns[0]).toContainElement(screen.getByTestId('left-column'));
      expect(columns[1]).toContainElement(screen.getByTestId('right-column'));
    });
  });

  describe('Layout Structure', () => {
    it('has flex layout', () => {
      const { container } = render(<TwoColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex');
    });

    it('has full height', () => {
      const { container } = render(<TwoColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('right column is flexible', () => {
      render(<TwoColumnLayout {...defaultProps} />);
      const rightWrapper = screen.getByTestId('right-column').parentElement;
      expect(rightWrapper).toHaveClass('flex-1');
    });

    it('columns are scrollable', () => {
      render(<TwoColumnLayout {...defaultProps} />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      const rightWrapper = screen.getByTestId('right-column').parentElement;

      expect(leftWrapper).toHaveClass('overflow-auto');
      expect(rightWrapper).toHaveClass('overflow-auto');
    });
  });

  describe('Left Width', () => {
    it('uses equal width by default', () => {
      render(<TwoColumnLayout {...defaultProps} />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('md:w-1/2');
    });

    it('applies 1/3 width', () => {
      render(<TwoColumnLayout {...defaultProps} leftWidth="1/3" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('md:w-1/3');
    });

    it('applies 2/3 width', () => {
      render(<TwoColumnLayout {...defaultProps} leftWidth="2/3" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('md:w-2/3');
    });

    it('applies 1/4 width', () => {
      render(<TwoColumnLayout {...defaultProps} leftWidth="1/4" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('md:w-1/4');
    });

    it('applies 3/4 width', () => {
      render(<TwoColumnLayout {...defaultProps} leftWidth="3/4" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('md:w-3/4');
    });
  });

  describe('Gap', () => {
    it('uses medium gap by default', () => {
      const { container } = render(<TwoColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('gap-4');
    });

    it('applies no gap', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} gap="none" />
      );
      expect(container.firstChild).toHaveClass('gap-0');
    });

    it('applies small gap', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} gap="sm" />
      );
      expect(container.firstChild).toHaveClass('gap-2');
    });

    it('applies large gap', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} gap="lg" />
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });
  });

  describe('Stack on Mobile', () => {
    it('stacks on mobile by default', () => {
      const { container } = render(<TwoColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex-col', 'md:flex-row');
    });

    it('does not stack on mobile when disabled', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} stackOnMobile={false} />
      );
      expect(container.firstChild).toHaveClass('flex-row');
      expect(container.firstChild).not.toHaveClass('flex-col');
    });

    it('left column has full width on mobile when stacking', () => {
      render(<TwoColumnLayout {...defaultProps} stackOnMobile={true} />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('w-full');
    });

    it('right column has full width on mobile when stacking', () => {
      render(<TwoColumnLayout {...defaultProps} stackOnMobile={true} />);
      const rightWrapper = screen.getByTestId('right-column').parentElement;
      expect(rightWrapper).toHaveClass('w-full');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} className="custom-two-col" />
      );
      expect(container.firstChild).toHaveClass('custom-two-col');
    });

    it('merges custom className with defaults', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} className="my-custom" />
      );
      expect(container.firstChild).toHaveClass('my-custom', 'flex', 'h-full');
    });

    it('handles empty className', () => {
      const { container } = render(
        <TwoColumnLayout {...defaultProps} className="" />
      );
      expect(container.firstChild).toHaveClass('flex');
    });
  });

  describe('Use Cases', () => {
    it('works for sidebar/content layout', () => {
      render(
        <TwoColumnLayout
          leftWidth="1/4"
          leftColumn={<nav data-testid="sidebar">Sidebar Nav</nav>}
          rightColumn={<main data-testid="main">Main Content</main>}
        />
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main')).toBeInTheDocument();
    });

    it('works for comparison layout', () => {
      render(
        <TwoColumnLayout
          leftWidth="equal"
          gap="md"
          leftColumn={<div data-testid="left">Left Panel</div>}
          rightColumn={<div data-testid="right">Right Panel</div>}
        />
      );
      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
    });

    it('works for editor/preview layout', () => {
      render(
        <TwoColumnLayout
          leftWidth="equal"
          stackOnMobile={false}
          leftColumn={<div data-testid="editor">Code Editor</div>}
          rightColumn={<div data-testid="preview">Live Preview</div>}
        />
      );
      expect(screen.getByTestId('editor')).toBeInTheDocument();
      expect(screen.getByTestId('preview')).toBeInTheDocument();
    });

    it('works for form/info layout', () => {
      render(
        <TwoColumnLayout
          leftWidth="2/3"
          leftColumn={<form data-testid="form">Form Fields</form>}
          rightColumn={<aside data-testid="info">Help Info</aside>}
        />
      );
      expect(screen.getByTestId('form')).toBeInTheDocument();
      expect(screen.getByTestId('info')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty left column', () => {
      render(
        <TwoColumnLayout
          leftColumn={<div data-testid="empty-left" />}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByTestId('empty-left')).toBeInTheDocument();
    });

    it('handles empty right column', () => {
      render(
        <TwoColumnLayout
          leftColumn={<div>Left</div>}
          rightColumn={<div data-testid="empty-right" />}
        />
      );
      expect(screen.getByTestId('empty-right')).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <TwoColumnLayout
          leftColumn={
            <div>
              <header>Left Header</header>
              <nav>Left Nav</nav>
              <footer>Left Footer</footer>
            </div>
          }
          rightColumn={
            <div>
              <header>Right Header</header>
              <main>Right Main</main>
              <footer>Right Footer</footer>
            </div>
          }
        />
      );
      expect(screen.getByText('Left Header')).toBeInTheDocument();
      expect(screen.getByText('Right Main')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <TwoColumnLayout
          leftColumn={<div data-testid="left">Left</div>}
          rightColumn={<div data-testid="right">Right</div>}
          leftWidth="1/3"
          gap="lg"
          stackOnMobile={false}
          className="complete-layout"
        />
      );

      expect(container.firstChild).toHaveClass('complete-layout', 'gap-6', 'flex-row');
      expect(screen.getByTestId('left').parentElement).toHaveClass('md:w-1/3');
    });
  });
});
