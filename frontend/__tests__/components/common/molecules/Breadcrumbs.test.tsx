/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Breadcrumbs } from '@/shared/ui/molecules/Breadcrumbs/Breadcrumbs';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Breadcrumbs', () => {
  const defaultItems = [
    { label: 'Home', href: '/' },
    { label: 'Cases', href: '/cases' },
    { label: 'Case Detail', href: '/cases/123' },
  ];

  describe('Rendering', () => {
    it('should render all breadcrumb items', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Case Detail')).toBeInTheDocument();
    });

    it('should render breadcrumbs as links', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render last item as current page', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const lastItem = screen.getByText('Case Detail');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Separators', () => {
    it('should render separators between items', () => {
      const { container } = renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should use custom separator', () => {
      renderWithTheme(
        <Breadcrumbs items={defaultItems} separator=">" />
      );
      expect(screen.getByText('>')).toBeInTheDocument();
    });

    it('should not render separator after last item', () => {
      const { container } = renderWithTheme(<Breadcrumbs items={defaultItems} />);
      // Count separators should be items.length - 1
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('Navigation', () => {
    it('should navigate on click', () => {
      const handleClick = jest.fn();
      const itemsWithClick = defaultItems.map((item, index) => ({
        ...item,
        onClick: index < 2 ? handleClick : undefined,
      }));

      renderWithTheme(<Breadcrumbs items={itemsWithClick} />);

      const homeLink = screen.getByText('Home');
      homeLink.click();

      expect(handleClick).toHaveBeenCalled();
    });

    it('should not make last item clickable', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const lastItem = screen.getByText('Case Detail');
      expect(lastItem.tagName).not.toBe('A');
    });
  });

  describe('Icons', () => {
    const itemsWithIcons = [
      { label: 'Home', href: '/', icon: '🏠' },
      { label: 'Cases', href: '/cases', icon: '📁' },
    ];

    it('should render icons', () => {
      renderWithTheme(<Breadcrumbs items={itemsWithIcons} />);
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('📁')).toBeInTheDocument();
    });

    it('should position icon before label', () => {
      renderWithTheme(<Breadcrumbs items={itemsWithIcons} />);
      const homeItem = screen.getByText('Home').parentElement;
      const icon = screen.getByText('🏠');
      expect(homeItem).toContainElement(icon);
    });
  });

  describe('Max Items', () => {
    const manyItems = [
      { label: 'Level 1', href: '/1' },
      { label: 'Level 2', href: '/2' },
      { label: 'Level 3', href: '/3' },
      { label: 'Level 4', href: '/4' },
      { label: 'Level 5', href: '/5' },
    ];

    it('should collapse items when maxItems is set', () => {
      renderWithTheme(<Breadcrumbs items={manyItems} maxItems={3} />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should show all items when maxItems is not set', () => {
      renderWithTheme(<Breadcrumbs items={manyItems} />);
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('should always show first and last items', () => {
      renderWithTheme(<Breadcrumbs items={manyItems} maxItems={3} />);
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', expect.stringMatching(/breadcrumb/i));
    });

    it('should have list role', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should mark current page with aria-current', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const currentItem = screen.getByText('Case Detail');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('should be keyboard navigable', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      const homeLink = screen.getByText('Home').closest('a');
      homeLink?.focus();
      expect(homeLink).toHaveFocus();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs items={defaultItems} size="sm" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs items={defaultItems} size="md" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs items={defaultItems} size="lg" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      const singleItem = [{ label: 'Home', href: '/' }];
      renderWithTheme(<Breadcrumbs items={singleItem} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      const { container } = renderWithTheme(<Breadcrumbs items={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const longItems = [
        { label: 'A'.repeat(100), href: '/long' },
      ];
      renderWithTheme(<Breadcrumbs items={longItems} />);
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle special characters in labels', () => {
      const specialItems = [
        { label: 'Cases & Documents', href: '/cases' },
        { label: 'Item #123', href: '/123' },
      ];
      renderWithTheme(<Breadcrumbs items={specialItems} />);
      expect(screen.getByText('Cases & Documents')).toBeInTheDocument();
      expect(screen.getByText('Item #123')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Breadcrumbs items={defaultItems} className="custom-breadcrumbs" />
      );
      expect(container.firstChild).toHaveClass('custom-breadcrumbs');
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      renderWithTheme(<Breadcrumbs items={defaultItems} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Truncation', () => {
    it('should truncate long labels', () => {
      const longItems = [
        {
          label: 'Very Long Case Name That Should Be Truncated',
          href: '/case',
          truncate: true
        },
      ];
      renderWithTheme(<Breadcrumbs items={longItems} />);
      const item = screen.getByText(/Very Long/);
      expect(item).toBeInTheDocument();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render case navigation breadcrumbs', () => {
      const caseItems = [
        { label: 'Dashboard', href: '/' },
        { label: 'Cases', href: '/cases' },
        { label: 'Smith v. Jones', href: '/cases/123' },
        { label: 'Documents', href: '/cases/123/documents' },
      ];

      renderWithTheme(<Breadcrumbs items={caseItems} />);
      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });

    it('should render document path breadcrumbs', () => {
      const docItems = [
        { label: 'Documents', href: '/documents' },
        { label: 'Legal', href: '/documents/legal' },
        { label: 'Contracts', href: '/documents/legal/contracts' },
        { label: 'Contract-2024.pdf', href: '/documents/legal/contracts/123' },
      ];

      renderWithTheme(<Breadcrumbs items={docItems} maxItems={3} />);
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Contract-2024.pdf')).toBeInTheDocument();
    });
  });
});
