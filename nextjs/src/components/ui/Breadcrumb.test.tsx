import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Breadcrumb', () => {
  const basicItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Details', current: true },
  ];

  describe('Rendering', () => {
    it('renders all breadcrumb items', () => {
      render(<Breadcrumb items={basicItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders as nav element with proper aria-label', () => {
      render(<Breadcrumb items={basicItems} />);
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
    });

    it('renders empty when items array is empty', () => {
      render(<Breadcrumb items={[]} />);
      const nav = screen.getByRole('navigation');
      expect(nav.children).toHaveLength(0);
    });
  });

  describe('Links', () => {
    it('renders items with href as links', () => {
      render(<Breadcrumb items={basicItems} />);
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('renders current item as span, not link', () => {
      render(<Breadcrumb items={basicItems} />);
      const currentItem = screen.getByText('Details');
      expect(currentItem.tagName).toBe('SPAN');
    });

    it('renders item without href as span', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'No Link' },
      ];
      render(<Breadcrumb items={items} />);
      const noLinkItem = screen.getByText('No Link');
      expect(noLinkItem.tagName).toBe('SPAN');
    });

    it('does not render link for current item even if href provided', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Current Page', href: '/current', current: true },
      ];
      render(<Breadcrumb items={items} />);
      const currentItem = screen.getByText('Current Page');
      expect(currentItem.tagName).toBe('SPAN');
    });
  });

  describe('Separators', () => {
    it('renders chevron separators between items', () => {
      const { container } = render(<Breadcrumb items={basicItems} />);
      const chevrons = container.querySelectorAll('svg');
      // Should have 2 separators for 3 items
      expect(chevrons).toHaveLength(2);
    });

    it('does not render separator before first item', () => {
      const { container } = render(<Breadcrumb items={basicItems} />);
      const firstItem = container.querySelector('.flex.items-center.gap-1');
      const firstChild = firstItem?.firstChild;
      expect(firstChild?.nodeName).not.toBe('svg');
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on navigation element', () => {
      render(<Breadcrumb items={basicItems} />);
      expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    });

    it('marks current item with aria-current="page"', () => {
      render(<Breadcrumb items={basicItems} />);
      const currentItem = screen.getByText('Details');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('non-current items do not have aria-current', () => {
      render(<Breadcrumb items={basicItems} />);
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<Breadcrumb items={basicItems} className="custom-breadcrumb" />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-breadcrumb');
    });

    it('current item has font-semibold class', () => {
      render(<Breadcrumb items={basicItems} />);
      const currentItem = screen.getByText('Details');
      expect(currentItem).toHaveClass('font-semibold');
    });

    it('links have hover styling class', () => {
      render(<Breadcrumb items={basicItems} />);
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('hover:underline');
    });
  });

  describe('Edge Cases', () => {
    it('handles single item', () => {
      const items: BreadcrumbItem[] = [{ label: 'Single', current: true }];
      render(<Breadcrumb items={items} />);
      expect(screen.getByText('Single')).toBeInTheDocument();
      // No separators for single item
      const { container } = render(<Breadcrumb items={items} />);
      const chevrons = container.querySelectorAll('svg');
      expect(chevrons).toHaveLength(0);
    });

    it('handles items with special characters in labels', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home & Garden', href: '/' },
        { label: 'Products > All', current: true },
      ];
      render(<Breadcrumb items={items} />);
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Products > All')).toBeInTheDocument();
    });

    it('handles long breadcrumb chains', () => {
      const items: BreadcrumbItem[] = Array.from({ length: 10 }, (_, i) => ({
        label: `Level ${i + 1}`,
        href: i < 9 ? `/level-${i + 1}` : undefined,
        current: i === 9,
      }));
      render(<Breadcrumb items={items} />);
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 10')).toBeInTheDocument();
    });

    it('handles external URLs', () => {
      const items: BreadcrumbItem[] = [
        { label: 'External', href: 'https://example.com' },
        { label: 'Current', current: true },
      ];
      render(<Breadcrumb items={items} />);
      const externalLink = screen.getByRole('link', { name: 'External' });
      expect(externalLink).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Multiple Breadcrumbs', () => {
    it('renders multiple independent breadcrumb components', () => {
      render(
        <>
          <Breadcrumb items={[{ label: 'First Nav', current: true }]} />
          <Breadcrumb items={[{ label: 'Second Nav', current: true }]} />
        </>
      );
      expect(screen.getByText('First Nav')).toBeInTheDocument();
      expect(screen.getByText('Second Nav')).toBeInTheDocument();
    });
  });
});
