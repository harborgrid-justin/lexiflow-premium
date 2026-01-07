import React from 'react';
import { render, screen } from '@testing-library/react';
import { StickyHeaderLayout } from './StickyHeaderLayout';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('StickyHeaderLayout', () => {
  const defaultProps = {
    header: <div data-testid="header">Header Content</div>,
    children: <div data-testid="main-content">Main Content</div>,
  };

  describe('Rendering', () => {
    it('renders header content', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('renders main content', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders both header and content together', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has full height', () => {
      const { container } = render(<StickyHeaderLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('has flex column layout', () => {
      const { container } = render(<StickyHeaderLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Sticky Header', () => {
    it('header has sticky positioning', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('sticky');
    });

    it('header is positioned at top', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('top-0');
    });

    it('header has z-index for layering', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('z-10');
    });

    it('header does not shrink', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('shrink-0');
    });

    it('header has bottom border', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('border-b');
    });
  });

  describe('Content Area', () => {
    it('content area is flexible', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const contentWrapper = screen.getByTestId('main-content').parentElement;
      expect(contentWrapper).toHaveClass('flex-1');
    });

    it('content area is scrollable', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const contentWrapper = screen.getByTestId('main-content').parentElement;
      expect(contentWrapper).toHaveClass('overflow-y-auto');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme surface style to header', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('bg-white');
    });

    it('applies theme border style to header', () => {
      render(<StickyHeaderLayout {...defaultProps} />);
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('border-slate-200');
    });
  });

  describe('Custom ClassNames', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(
        <StickyHeaderLayout {...defaultProps} className="custom-layout" />
      );
      expect(container.firstChild).toHaveClass('custom-layout');
    });

    it('applies custom headerClassName', () => {
      render(
        <StickyHeaderLayout {...defaultProps} headerClassName="custom-header" />
      );
      const headerWrapper = screen.getByTestId('header').parentElement;
      expect(headerWrapper).toHaveClass('custom-header');
    });

    it('applies custom contentClassName', () => {
      render(
        <StickyHeaderLayout {...defaultProps} contentClassName="custom-content" />
      );
      const contentWrapper = screen.getByTestId('main-content').parentElement;
      expect(contentWrapper).toHaveClass('custom-content');
    });

    it('merges custom classNames with defaults', () => {
      const { container } = render(
        <StickyHeaderLayout
          {...defaultProps}
          className="my-layout"
          headerClassName="my-header"
          contentClassName="my-content"
        />
      );
      expect(container.firstChild).toHaveClass('my-layout', 'h-full', 'flex');
    });

    it('handles empty classNames', () => {
      const { container } = render(
        <StickyHeaderLayout
          {...defaultProps}
          className=""
          headerClassName=""
          contentClassName=""
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(StickyHeaderLayout.displayName).toBe('StickyHeaderLayout');
    });
  });

  describe('Use Cases', () => {
    it('works for page with navigation header', () => {
      render(
        <StickyHeaderLayout
          header={
            <nav data-testid="nav">
              <a href="/">Home</a>
              <a href="/about">About</a>
            </nav>
          }
        >
          <article data-testid="article">Long article content...</article>
        </StickyHeaderLayout>
      );
      expect(screen.getByTestId('nav')).toBeInTheDocument();
      expect(screen.getByTestId('article')).toBeInTheDocument();
    });

    it('works for modal with sticky title', () => {
      render(
        <StickyHeaderLayout
          header={<h2 data-testid="modal-title">Modal Title</h2>}
          className="max-h-96"
        >
          <div data-testid="modal-body">Modal body with scrollable content</div>
        </StickyHeaderLayout>
      );
      expect(screen.getByTestId('modal-title')).toBeInTheDocument();
      expect(screen.getByTestId('modal-body')).toBeInTheDocument();
    });

    it('works for sidebar with sticky filter header', () => {
      render(
        <StickyHeaderLayout
          header={
            <div data-testid="filter-header">
              <input placeholder="Search..." />
            </div>
          }
        >
          <ul data-testid="filter-results">
            <li>Result 1</li>
            <li>Result 2</li>
          </ul>
        </StickyHeaderLayout>
      );
      expect(screen.getByTestId('filter-header')).toBeInTheDocument();
      expect(screen.getByTestId('filter-results')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty header', () => {
      render(
        <StickyHeaderLayout header={<div data-testid="empty-header" />}>
          <div>Content</div>
        </StickyHeaderLayout>
      );
      expect(screen.getByTestId('empty-header')).toBeInTheDocument();
    });

    it('handles empty children', () => {
      render(
        <StickyHeaderLayout header={<div>Header</div>}>
          {null}
        </StickyHeaderLayout>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
    });

    it('handles complex header content', () => {
      render(
        <StickyHeaderLayout
          header={
            <header>
              <div>Logo</div>
              <nav>Navigation</nav>
              <div>Actions</div>
            </header>
          }
        >
          <main>Main content</main>
        </StickyHeaderLayout>
      );
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('handles very long scrollable content', () => {
      const longContent = Array.from({ length: 100 }, (_, i) => (
        <p key={i}>Paragraph {i}</p>
      ));
      render(
        <StickyHeaderLayout header={<div>Sticky Header</div>}>
          <div data-testid="long-content">{longContent}</div>
        </StickyHeaderLayout>
      );
      expect(screen.getByTestId('long-content')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <StickyHeaderLayout
          header={<div data-testid="complete-header">Header</div>}
          headerClassName="custom-header"
          contentClassName="custom-content"
          className="complete-layout"
        >
          <div data-testid="complete-content">Content</div>
        </StickyHeaderLayout>
      );

      expect(container.firstChild).toHaveClass('complete-layout');
      const headerWrapper = screen.getByTestId('complete-header').parentElement;
      expect(headerWrapper).toHaveClass('custom-header', 'sticky');
      const contentWrapper = screen.getByTestId('complete-content').parentElement;
      expect(contentWrapper).toHaveClass('custom-content', 'flex-1');
    });
  });
});
