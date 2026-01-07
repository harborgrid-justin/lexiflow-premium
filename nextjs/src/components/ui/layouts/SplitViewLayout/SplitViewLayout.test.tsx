import React from 'react';
import { render, screen } from '@testing-library/react';
import { SplitViewLayout } from './SplitViewLayout';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-slate-50' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('SplitViewLayout', () => {
  const defaultProps = {
    sidebar: <div data-testid="sidebar">Sidebar Content</div>,
    content: <div data-testid="content">Main Content</div>,
  };

  describe('Rendering', () => {
    it('renders sidebar content', () => {
      render(<SplitViewLayout {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('renders main content', () => {
      render(<SplitViewLayout {...defaultProps} />);
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders both sections together', () => {
      render(<SplitViewLayout {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Sidebar Position', () => {
    it('renders sidebar on left by default', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      const firstChild = wrapper.firstChild as HTMLElement;
      expect(firstChild).toContainElement(screen.getByTestId('sidebar'));
    });

    it('renders sidebar on left when sidebarPosition is left', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarPosition="left" />
      );
      const wrapper = container.firstChild as HTMLElement;
      const firstChild = wrapper.firstChild as HTMLElement;
      expect(firstChild).toContainElement(screen.getByTestId('sidebar'));
    });

    it('renders sidebar on right when sidebarPosition is right', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarPosition="right" />
      );
      const wrapper = container.firstChild as HTMLElement;
      const children = Array.from(wrapper.children);
      const lastChild = children[children.length - 1] as HTMLElement;
      expect(lastChild).toContainElement(screen.getByTestId('sidebar'));
    });

    it('sidebar has left border when positioned right', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarPosition="right" />
      );
      const sidebarWrapper = container.querySelector('.border-l');
      expect(sidebarWrapper).toBeInTheDocument();
    });

    it('sidebar has right border when positioned left', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarPosition="left" />
      );
      const sidebarWrapper = container.querySelector('.border-r');
      expect(sidebarWrapper).toBeInTheDocument();
    });
  });

  describe('Sidebar Width', () => {
    it('uses large width by default', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      const sidebarWrapper = container.querySelector('.md\\:w-96');
      expect(sidebarWrapper).toBeInTheDocument();
    });

    it('applies small width', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarWidth="sm" />
      );
      const sidebarWrapper = container.querySelector('.md\\:w-64');
      expect(sidebarWrapper).toBeInTheDocument();
    });

    it('applies medium width', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarWidth="md" />
      );
      const sidebarWrapper = container.querySelector('.md\\:w-80');
      expect(sidebarWrapper).toBeInTheDocument();
    });

    it('applies xl width', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} sidebarWidth="xl" />
      );
      const sidebarWrapper = container.querySelector('.md\\:w-\\[28rem\\]');
      expect(sidebarWrapper).toBeInTheDocument();
    });
  });

  describe('Mobile Visibility', () => {
    it('shows sidebar on mobile by default', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      // Sidebar should be visible (flex class without hidden)
      const sidebarWrapper = screen.getByTestId('sidebar').parentElement;
      expect(sidebarWrapper).toHaveClass('flex');
    });

    it('hides sidebar on mobile when showSidebarOnMobile is false', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} showSidebarOnMobile={false} />
      );
      const sidebarWrapper = screen.getByTestId('sidebar').parentElement;
      expect(sidebarWrapper).toHaveClass('hidden');
      expect(sidebarWrapper).toHaveClass('md:flex');
    });

    it('shows content on mobile when sidebar is hidden', () => {
      render(
        <SplitViewLayout {...defaultProps} showSidebarOnMobile={false} />
      );
      const contentWrapper = screen.getByTestId('content').parentElement;
      expect(contentWrapper).toHaveClass('flex');
    });

    it('hides content on mobile when showSidebarOnMobile is true', () => {
      render(<SplitViewLayout {...defaultProps} showSidebarOnMobile={true} />);
      const contentWrapper = screen.getByTestId('content').parentElement;
      expect(contentWrapper).toHaveClass('hidden');
      expect(contentWrapper).toHaveClass('md:flex');
    });
  });

  describe('Layout Structure', () => {
    it('has flex layout', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex');
    });

    it('has rounded corners', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('has border and shadow', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('border', 'shadow-sm');
    });

    it('prevents overflow', () => {
      const { container } = render(<SplitViewLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });

    it('content area has min-w-0 for proper flex shrinking', () => {
      render(<SplitViewLayout {...defaultProps} />);
      const contentWrapper = screen.getByTestId('content').parentElement;
      expect(contentWrapper).toHaveClass('min-w-0');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme surface style to sidebar', () => {
      render(<SplitViewLayout {...defaultProps} />);
      const sidebarWrapper = screen.getByTestId('sidebar').parentElement;
      expect(sidebarWrapper).toHaveClass('bg-slate-50');
    });

    it('applies theme surface style to content', () => {
      render(<SplitViewLayout {...defaultProps} />);
      const contentWrapper = screen.getByTestId('content').parentElement;
      expect(contentWrapper).toHaveClass('bg-white');
    });

    it('applies theme border style', () => {
      render(<SplitViewLayout {...defaultProps} />);
      const sidebarWrapper = screen.getByTestId('sidebar').parentElement;
      expect(sidebarWrapper).toHaveClass('border-slate-200');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} className="custom-split" />
      );
      expect(container.firstChild).toHaveClass('custom-split');
    });

    it('handles empty className', () => {
      const { container } = render(
        <SplitViewLayout {...defaultProps} className="" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(SplitViewLayout.displayName).toBe('SplitViewLayout');
    });
  });

  describe('Use Cases', () => {
    it('works for inbox layout', () => {
      render(
        <SplitViewLayout
          sidebar={
            <ul data-testid="message-list">
              <li>Message 1</li>
              <li>Message 2</li>
            </ul>
          }
          content={
            <div data-testid="message-detail">
              <h2>Message Subject</h2>
              <p>Message body...</p>
            </div>
          }
        />
      );
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-detail')).toBeInTheDocument();
    });

    it('works for master-detail pattern', () => {
      render(
        <SplitViewLayout
          sidebarWidth="md"
          sidebar={<nav data-testid="nav">Navigation</nav>}
          content={<main data-testid="detail">Detail View</main>}
        />
      );
      expect(screen.getByTestId('nav')).toBeInTheDocument();
      expect(screen.getByTestId('detail')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty sidebar', () => {
      render(
        <SplitViewLayout
          sidebar={<div data-testid="empty-sidebar" />}
          content={<div>Content</div>}
        />
      );
      expect(screen.getByTestId('empty-sidebar')).toBeInTheDocument();
    });

    it('handles empty content', () => {
      render(
        <SplitViewLayout
          sidebar={<div>Sidebar</div>}
          content={<div data-testid="empty-content" />}
        />
      );
      expect(screen.getByTestId('empty-content')).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <SplitViewLayout
          sidebar={
            <div>
              <header>Sidebar Header</header>
              <nav>Navigation</nav>
              <footer>Sidebar Footer</footer>
            </div>
          }
          content={
            <div>
              <header>Content Header</header>
              <article>Article</article>
              <footer>Content Footer</footer>
            </div>
          }
        />
      );
      expect(screen.getByText('Sidebar Header')).toBeInTheDocument();
      expect(screen.getByText('Content Header')).toBeInTheDocument();
    });
  });
});
