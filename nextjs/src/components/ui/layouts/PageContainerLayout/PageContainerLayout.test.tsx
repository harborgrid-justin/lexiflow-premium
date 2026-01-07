import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageContainerLayout } from './PageContainerLayout';

describe('PageContainerLayout', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <PageContainerLayout>
          <div data-testid="child-content">Child Content</div>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <PageContainerLayout>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
          <div data-testid="child-3">Third</div>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Max Width', () => {
    it('uses 7xl max-width by default', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
    });

    it('applies sm max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="sm">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });

    it('applies md max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="md">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('applies lg max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="lg">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('applies xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-xl')).toBeInTheDocument();
    });

    it('applies 2xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="2xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('applies 3xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="3xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-3xl')).toBeInTheDocument();
    });

    it('applies 4xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="4xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('applies 5xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="5xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-5xl')).toBeInTheDocument();
    });

    it('applies 6xl max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="6xl">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-6xl')).toBeInTheDocument();
    });

    it('applies full max-width', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="full">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.max-w-full')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has full height', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('has overflow-y-auto for scrolling', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.firstChild).toHaveClass('overflow-y-auto');
    });

    it('has custom scrollbar', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.firstChild).toHaveClass('custom-scrollbar');
    });

    it('has padding', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.firstChild).toHaveClass('p-6');
    });

    it('content is centered with mx-auto', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('has vertical spacing between children', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    });

    it('has fade-in animation', () => {
      const { container } = render(
        <PageContainerLayout>
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.animate-fade-in')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PageContainerLayout className="custom-page">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.querySelector('.custom-page')).toBeInTheDocument();
    });

    it('handles empty className', () => {
      const { container } = render(
        <PageContainerLayout className="">
          <div>Content</div>
        </PageContainerLayout>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('works for settings page', () => {
      render(
        <PageContainerLayout maxWidth="4xl">
          <div data-testid="settings">
            <h1>Settings</h1>
            <form>
              <input placeholder="Name" />
              <button type="submit">Save</button>
            </form>
          </div>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('settings')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('works for dashboard page', () => {
      render(
        <PageContainerLayout maxWidth="7xl">
          <div data-testid="dashboard">
            <h1>Dashboard</h1>
            <div>Stats</div>
            <div>Charts</div>
          </div>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Stats')).toBeInTheDocument();
    });

    it('works for article page', () => {
      render(
        <PageContainerLayout maxWidth="3xl">
          <article data-testid="article">
            <h1>Article Title</h1>
            <p>Article content goes here...</p>
          </article>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('article')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<PageContainerLayout>{null}</PageContainerLayout>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <PageContainerLayout>
          <header>Header</header>
          <main>
            <section>Section 1</section>
            <section>Section 2</section>
          </main>
          <footer>Footer</footer>
        </PageContainerLayout>
      );
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longContent = 'A'.repeat(10000);
      render(
        <PageContainerLayout>
          <div data-testid="long-content">{longContent}</div>
        </PageContainerLayout>
      );
      expect(screen.getByTestId('long-content')).toBeInTheDocument();
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const { container } = render(
        <PageContainerLayout maxWidth="5xl" className="complete-page">
          <div data-testid="complete-content">Complete Content</div>
        </PageContainerLayout>
      );

      expect(container.querySelector('.max-w-5xl')).toBeInTheDocument();
      expect(container.querySelector('.complete-page')).toBeInTheDocument();
      expect(screen.getByTestId('complete-content')).toBeInTheDocument();
    });
  });
});
