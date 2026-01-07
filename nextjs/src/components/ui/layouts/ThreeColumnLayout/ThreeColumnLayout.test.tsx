import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThreeColumnLayout } from './ThreeColumnLayout';

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('ThreeColumnLayout', () => {
  const defaultProps = {
    leftColumn: <div data-testid="left-column">Left Content</div>,
    centerColumn: <div data-testid="center-column">Center Content</div>,
    rightColumn: <div data-testid="right-column">Right Content</div>,
  };

  describe('Rendering', () => {
    it('renders all three columns', () => {
      render(<ThreeColumnLayout {...defaultProps} />);
      expect(screen.getByTestId('left-column')).toBeInTheDocument();
      expect(screen.getByTestId('center-column')).toBeInTheDocument();
      expect(screen.getByTestId('right-column')).toBeInTheDocument();
    });

    it('renders columns in correct order', () => {
      const { container } = render(<ThreeColumnLayout {...defaultProps} />);
      const flexContainer = container.firstChild as HTMLElement;
      const columns = Array.from(flexContainer.children);

      expect(columns[0]).toContainElement(screen.getByTestId('left-column'));
      expect(columns[1]).toContainElement(screen.getByTestId('center-column'));
      expect(columns[2]).toContainElement(screen.getByTestId('right-column'));
    });
  });

  describe('Layout Structure', () => {
    it('has flex layout', () => {
      const { container } = render(<ThreeColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex');
    });

    it('has full height', () => {
      const { container } = render(<ThreeColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('center column is flexible', () => {
      render(<ThreeColumnLayout {...defaultProps} />);
      const centerWrapper = screen.getByTestId('center-column').parentElement;
      expect(centerWrapper).toHaveClass('flex-1');
    });

    it('columns are scrollable', () => {
      render(<ThreeColumnLayout {...defaultProps} />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      const centerWrapper = screen.getByTestId('center-column').parentElement;
      const rightWrapper = screen.getByTestId('right-column').parentElement;

      expect(leftWrapper).toHaveClass('overflow-auto');
      expect(centerWrapper).toHaveClass('overflow-auto');
      expect(rightWrapper).toHaveClass('overflow-auto');
    });
  });

  describe('Column Widths', () => {
    it('uses medium width for left column by default', () => {
      render(<ThreeColumnLayout {...defaultProps} />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('w-80');
    });

    it('uses medium width for right column by default', () => {
      render(<ThreeColumnLayout {...defaultProps} />);
      const rightWrapper = screen.getByTestId('right-column').parentElement;
      expect(rightWrapper).toHaveClass('w-80');
    });

    it('applies small left width', () => {
      render(<ThreeColumnLayout {...defaultProps} leftWidth="sm" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('w-64');
    });

    it('applies large left width', () => {
      render(<ThreeColumnLayout {...defaultProps} leftWidth="lg" />);
      const leftWrapper = screen.getByTestId('left-column').parentElement;
      expect(leftWrapper).toHaveClass('w-96');
    });

    it('applies small right width', () => {
      render(<ThreeColumnLayout {...defaultProps} rightWidth="sm" />);
      const rightWrapper = screen.getByTestId('right-column').parentElement;
      expect(rightWrapper).toHaveClass('w-64');
    });

    it('applies large right width', () => {
      render(<ThreeColumnLayout {...defaultProps} rightWidth="lg" />);
      const rightWrapper = screen.getByTestId('right-column').parentElement;
      expect(rightWrapper).toHaveClass('w-96');
    });
  });

  describe('Gap', () => {
    it('uses medium gap by default', () => {
      const { container } = render(<ThreeColumnLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('gap-4');
    });

    it('applies no gap', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} gap="none" />
      );
      expect(container.firstChild).toHaveClass('gap-0');
    });

    it('applies small gap', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} gap="sm" />
      );
      expect(container.firstChild).toHaveClass('gap-2');
    });

    it('applies large gap', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} gap="lg" />
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });
  });

  describe('Mobile Visibility', () => {
    it('shows only center column on mobile by default', () => {
      render(<ThreeColumnLayout {...defaultProps} />);

      const leftWrapper = screen.getByTestId('left-column').parentElement;
      const rightWrapper = screen.getByTestId('right-column').parentElement;

      expect(leftWrapper).toHaveClass('hidden', 'lg:flex');
      expect(rightWrapper).toHaveClass('hidden', 'xl:flex');
    });

    it('shows all columns on mobile when showOnMobile is all', () => {
      render(<ThreeColumnLayout {...defaultProps} showOnMobile="all" />);

      const leftWrapper = screen.getByTestId('left-column').parentElement;
      const rightWrapper = screen.getByTestId('right-column').parentElement;

      expect(leftWrapper).toHaveClass('flex');
      expect(rightWrapper).toHaveClass('flex');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} className="custom-three-col" />
      );
      expect(container.firstChild).toHaveClass('custom-three-col');
    });

    it('merges custom className with defaults', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} className="my-custom" />
      );
      expect(container.firstChild).toHaveClass('my-custom', 'flex', 'h-full');
    });

    it('handles empty className', () => {
      const { container } = render(
        <ThreeColumnLayout {...defaultProps} className="" />
      );
      expect(container.firstChild).toHaveClass('flex');
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(ThreeColumnLayout.displayName).toBe('ThreeColumnLayout');
    });
  });

  describe('Use Cases', () => {
    it('works for navigation/content/details layout', () => {
      render(
        <ThreeColumnLayout
          leftColumn={<nav data-testid="nav">Navigation</nav>}
          centerColumn={<main data-testid="main">Main Content</main>}
          rightColumn={<aside data-testid="aside">Details Panel</aside>}
        />
      );
      expect(screen.getByTestId('nav')).toBeInTheDocument();
      expect(screen.getByTestId('main')).toBeInTheDocument();
      expect(screen.getByTestId('aside')).toBeInTheDocument();
    });

    it('works for email client layout', () => {
      render(
        <ThreeColumnLayout
          leftWidth="sm"
          rightWidth="lg"
          leftColumn={<div data-testid="folders">Folders</div>}
          centerColumn={<div data-testid="inbox">Inbox List</div>}
          rightColumn={<div data-testid="preview">Email Preview</div>}
        />
      );
      expect(screen.getByTestId('folders')).toBeInTheDocument();
      expect(screen.getByTestId('inbox')).toBeInTheDocument();
      expect(screen.getByTestId('preview')).toBeInTheDocument();
    });

    it('works for IDE-like layout', () => {
      render(
        <ThreeColumnLayout
          gap="none"
          leftColumn={<div data-testid="explorer">File Explorer</div>}
          centerColumn={<div data-testid="editor">Code Editor</div>}
          rightColumn={<div data-testid="properties">Properties Panel</div>}
        />
      );
      expect(screen.getByTestId('explorer')).toBeInTheDocument();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
      expect(screen.getByTestId('properties')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty left column', () => {
      render(
        <ThreeColumnLayout
          leftColumn={<div data-testid="empty-left" />}
          centerColumn={<div>Center</div>}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByTestId('empty-left')).toBeInTheDocument();
    });

    it('handles empty center column', () => {
      render(
        <ThreeColumnLayout
          leftColumn={<div>Left</div>}
          centerColumn={<div data-testid="empty-center" />}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByTestId('empty-center')).toBeInTheDocument();
    });

    it('handles empty right column', () => {
      render(
        <ThreeColumnLayout
          leftColumn={<div>Left</div>}
          centerColumn={<div>Center</div>}
          rightColumn={<div data-testid="empty-right" />}
        />
      );
      expect(screen.getByTestId('empty-right')).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <ThreeColumnLayout
          leftColumn={
            <div>
              <header>Left Header</header>
              <nav>Left Nav</nav>
            </div>
          }
          centerColumn={
            <div>
              <header>Center Header</header>
              <main>Center Main</main>
            </div>
          }
          rightColumn={
            <div>
              <header>Right Header</header>
              <aside>Right Aside</aside>
            </div>
          }
        />
      );
      expect(screen.getByText('Left Header')).toBeInTheDocument();
      expect(screen.getByText('Center Main')).toBeInTheDocument();
      expect(screen.getByText('Right Aside')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <ThreeColumnLayout
          leftColumn={<div data-testid="left">Left</div>}
          centerColumn={<div data-testid="center">Center</div>}
          rightColumn={<div data-testid="right">Right</div>}
          leftWidth="lg"
          rightWidth="sm"
          gap="lg"
          showOnMobile="all"
          className="complete-layout"
        />
      );

      expect(container.firstChild).toHaveClass('complete-layout', 'gap-6');
      expect(screen.getByTestId('left').parentElement).toHaveClass('w-96');
      expect(screen.getByTestId('right').parentElement).toHaveClass('w-64');
    });
  });
});
