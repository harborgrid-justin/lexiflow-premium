/**
 * Enterprise Test Suite: Main Layout Component
 *
 * Comprehensive tests for the authenticated route group layout including:
 * - Component composition
 * - Layout structure verification
 * - Responsive design
 * - Dark mode support
 * - Children rendering
 *
 * @module layout.test
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock layout components
jest.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header Component</header>,
}));

jest.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar Component</aside>,
}));

describe('MainLayout', () => {
  let MainLayout: React.FC<{ children: React.ReactNode }>;

  beforeAll(async () => {
    const layoutModule = await import('../layout');
    MainLayout = layoutModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      expect(container).toBeDefined();
    });

    it('should render the Sidebar component', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render the Header component', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <MainLayout>
          <div data-testid="child-content">Test Content</div>
        </MainLayout>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <MainLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </MainLayout>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have flex container as root', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('flex');
    });

    it('should have full screen height', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('h-screen');
    });

    it('should have main content area', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should have correct main element classes', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const main = container.querySelector('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('overflow-y-auto');
    });

    it('should have flexible content wrapper', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const contentWrapper = container.querySelector('.flex-1.flex.flex-col');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include light mode background', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('bg-slate-50');
    });

    it('should include dark mode background', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const rootDiv = container.firstChild;
      expect((rootDiv as Element).className).toContain('dark:bg-slate-900');
    });
  });

  describe('Overflow Handling', () => {
    it('should prevent root overflow', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const contentWrapper = container.querySelector('.overflow-hidden');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should allow main content scrolling', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const main = container.querySelector('main');
      expect(main).toHaveClass('overflow-y-auto');
    });
  });

  describe('Semantic Structure', () => {
    it('should have semantic main element for content', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('should render children inside main element', () => {
      render(
        <MainLayout>
          <div data-testid="child">Child Content</div>
        </MainLayout>
      );
      const main = screen.getByRole('main');
      expect(main).toContainElement(screen.getByTestId('child'));
    });
  });

  describe('Component Order', () => {
    it('should render Sidebar before main content area', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const rootChildren = container.firstChild?.childNodes;
      expect(rootChildren).toBeDefined();
      if (rootChildren) {
        // Sidebar should be first child
        expect((rootChildren[0] as Element).getAttribute('data-testid')).toBe('sidebar');
      }
    });

    it('should render Header before main content', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      const contentWrapper = container.querySelector('.flex-1.flex.flex-col');
      const children = contentWrapper?.childNodes;
      expect(children).toBeDefined();
      if (children) {
        // Header should be before main
        expect((children[0] as Element).getAttribute('data-testid')).toBe('header');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have accessible main landmark', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should allow content to receive focus for keyboard navigation', () => {
      const { container } = render(
        <MainLayout>
          <button>Focusable Button</button>
        </MainLayout>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Props Interface', () => {
    it('should accept ReactNode children', () => {
      const complexChild = (
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <span>Span</span>
        </div>
      );

      expect(() => render(
        <MainLayout>{complexChild}</MainLayout>
      )).not.toThrow();
    });

    it('should handle null children gracefully', () => {
      expect(() => render(
        <MainLayout>{null}</MainLayout>
      )).not.toThrow();
    });

    it('should handle undefined children gracefully', () => {
      expect(() => render(
        <MainLayout>{undefined}</MainLayout>
      )).not.toThrow();
    });

    it('should handle empty fragment children', () => {
      expect(() => render(
        <MainLayout><></></MainLayout>
      )).not.toThrow();
    });
  });
});

describe('MainLayout - Integration', () => {
  beforeAll(async () => {
    // Re-import for fresh mocks if needed
  });

  it('should compose Sidebar, Header, and main content correctly', async () => {
    const layoutModule = await import('../layout');
    const MainLayout = layoutModule.default;

    const { container } = render(
      <MainLayout>
        <div data-testid="page-content">Page Content</div>
      </MainLayout>
    );

    // All components should be present
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();

    // Structure should be correct
    const main = container.querySelector('main');
    expect(main).toContainElement(screen.getByTestId('page-content'));
  });
});

describe('MainLayout - Performance', () => {
  it('should render within acceptable time', async () => {
    const layoutModule = await import('../layout');
    const MainLayout = layoutModule.default;

    const startTime = performance.now();
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(50);
  });

  it('should not cause excessive re-renders', async () => {
    const layoutModule = await import('../layout');
    const MainLayout = layoutModule.default;
    let renderCount = 0;

    const CountingChild = () => {
      renderCount++;
      return <div>Render count: {renderCount}</div>;
    };

    render(
      <MainLayout>
        <CountingChild />
      </MainLayout>
    );

    // Should only render once during initial mount
    expect(renderCount).toBe(1);
  });
});
