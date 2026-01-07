/**
 * @fileoverview Enterprise-grade tests for Breadcrumb component
 * @module components/layout/Breadcrumb.test
 *
 * Tests breadcrumb rendering, navigation links, and accessibility.
 */

import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const simpleBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Cases', href: '/cases' },
  { label: 'Smith v. Jones' },
];

const singleBreadcrumb: BreadcrumbItem[] = [
  { label: 'Dashboard' },
];

const allLinksBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'Recent', href: '/documents/recent' },
];

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('Breadcrumb', () => {
  describe('Basic Rendering', () => {
    it('renders all breadcrumb items', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });

    it('renders as navigation element', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders single breadcrumb without separator', () => {
      render(<Breadcrumb items={singleBreadcrumb} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      // No ChevronRight should be rendered for single item
      const separators = document.querySelectorAll('svg');
      expect(separators.length).toBe(0);
    });
  });

  // ============================================================================
  // LINK BEHAVIOR TESTS
  // ============================================================================

  describe('Link Behavior', () => {
    it('renders items with href as links', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/');

      const casesLink = screen.getByRole('link', { name: 'Cases' });
      expect(casesLink).toHaveAttribute('href', '/cases');
    });

    it('renders items without href as plain text', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const currentItem = screen.getByText('Smith v. Jones');
      expect(currentItem.tagName).toBe('SPAN');
    });

    it('renders all items as links when all have href', () => {
      render(<Breadcrumb items={allLinksBreadcrumbs} />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Documents' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Recent' })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SEPARATOR TESTS
  // ============================================================================

  describe('Separators', () => {
    it('renders separator between items', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      // Should have 2 separators (ChevronRight icons) for 3 items
      const separators = document.querySelectorAll('svg');
      expect(separators.length).toBe(2);
    });

    it('does not render separator before first item', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      // First item container should not have a preceding separator
      const homeItem = screen.getByText('Home');
      const container = homeItem.closest('div');
      const firstElement = container?.firstChild;
      expect(firstElement?.nodeName).not.toBe('svg');
    });

    it('renders ChevronRight icons as separators', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const separators = document.querySelectorAll('svg');
      separators.forEach(separator => {
        expect(separator).toHaveClass('h-4', 'w-4');
      });
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('applies hover styles to links', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('hover:text-slate-900');
    });

    it('applies font-medium to current item (no href)', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const currentItem = screen.getByText('Smith v. Jones');
      expect(currentItem).toHaveClass('font-medium');
    });

    it('applies different text colors for current vs navigable items', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const currentItem = screen.getByText('Smith v. Jones');
      expect(currentItem).toHaveClass('text-slate-900');

      // Links should have standard text color
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('hover:text-slate-900');
    });

    it('applies gap between items', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('gap-2');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to navigation', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('dark:text-slate-400');
    });

    it('applies dark mode hover classes to links', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('dark:hover:text-slate-100');
    });

    it('applies dark mode classes to current item', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const currentItem = screen.getByText('Smith v. Jones');
      expect(currentItem).toHaveClass('dark:text-slate-50');
    });

    it('applies dark mode classes to separators', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const separators = document.querySelectorAll('svg');
      separators.forEach(separator => {
        expect(separator).toHaveClass('dark:text-slate-600');
      });
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('renders empty navigation when no items provided', () => {
      render(<Breadcrumb items={[]} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.children.length).toBe(0);
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('uses semantic navigation element', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('links are keyboard accessible', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('maintains proper text contrast', () => {
      render(<Breadcrumb items={simpleBreadcrumbs} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('text-slate-600');
    });
  });

  // ============================================================================
  // EDGE CASES TESTS
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles long breadcrumb labels', () => {
      const longLabels: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'This is a very long breadcrumb label that should still render correctly' },
      ];

      render(<Breadcrumb items={longLabels} />);

      expect(screen.getByText(/this is a very long breadcrumb label/i)).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialChars: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: "O'Brien & Associates - Case #123" },
      ];

      render(<Breadcrumb items={specialChars} />);

      expect(screen.getByText("O'Brien & Associates - Case #123")).toBeInTheDocument();
    });

    it('handles many breadcrumb items', () => {
      const manyItems: BreadcrumbItem[] = Array.from({ length: 10 }, (_, i) => ({
        label: `Level ${i + 1}`,
        href: i < 9 ? `/level-${i + 1}` : undefined,
      }));

      render(<Breadcrumb items={manyItems} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 10')).toBeInTheDocument();

      // Should have 9 separators for 10 items
      const separators = document.querySelectorAll('svg');
      expect(separators.length).toBe(9);
    });
  });
});
