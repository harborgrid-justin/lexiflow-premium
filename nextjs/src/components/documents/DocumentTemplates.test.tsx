/**
 * DocumentTemplates Component Tests
 * Enterprise-grade tests for document templates display.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentTemplates } from './DocumentTemplates';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, variant, ...props }: any) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader', () => ({
  AdaptiveLoader: ({ contentType, itemCount }: any) => (
    <div data-testid="adaptive-loader">
      Loading {itemCount} {contentType}
    </div>
  ),
}));

describe('DocumentTemplates', () => {
  describe('Rendering', () => {
    it('renders automated drafting section', () => {
      render(<DocumentTemplates />);

      expect(screen.getByText('Automated Drafting')).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<DocumentTemplates />);

      expect(screen.getByText(/select a template to launch/i)).toBeInTheDocument();
    });

    it('renders Create New Template button', () => {
      render(<DocumentTemplates />);

      expect(screen.getByRole('button', { name: /create new template/i })).toBeInTheDocument();
    });

    it('renders all mock templates', () => {
      render(<DocumentTemplates />);

      expect(screen.getByText('Non-Disclosure Agreement')).toBeInTheDocument();
      expect(screen.getByText('Employment Contract')).toBeInTheDocument();
      expect(screen.getByText('Cease and Desist Letter')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Independent Contractor Agreement')).toBeInTheDocument();
    });

    it('renders template categories', () => {
      render(<DocumentTemplates />);

      expect(screen.getAllByText('Contracts').length).toBeGreaterThan(0);
      expect(screen.getByText('HR')).toBeInTheDocument();
      expect(screen.getByText('Litigation')).toBeInTheDocument();
      expect(screen.getAllByText('Compliance').length).toBeGreaterThan(0);
    });

    it('renders file icons for each template', () => {
      const { container } = render(<DocumentTemplates />);

      const fileIcons = container.querySelectorAll('svg');
      // Should have at least one icon per template plus section icon
      expect(fileIcons.length).toBeGreaterThan(6);
    });
  });

  describe('Popular Badge', () => {
    it('shows Popular badge for popular templates', () => {
      render(<DocumentTemplates />);

      const popularBadges = screen.getAllByText('Popular');
      expect(popularBadges.length).toBe(3); // NDA, Employment Contract, Terms of Service
    });

    it('does not show Popular badge for non-popular templates', () => {
      render(<DocumentTemplates />);

      // Get all template cards
      const ceaseDesistCard = screen.getByText('Cease and Desist Letter').closest('div');
      expect(ceaseDesistCard).not.toContainElement(screen.queryByText('Popular'));
    });

    it('Popular badge has correct styling', () => {
      render(<DocumentTemplates />);

      const popularBadges = screen.getAllByText('Popular');
      popularBadges.forEach(badge => {
        expect(badge).toHaveClass('text-emerald-800', 'bg-emerald-100');
      });
    });
  });

  describe('Template Cards', () => {
    it('templates are displayed in a grid', () => {
      const { container } = render(<DocumentTemplates />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('template cards have hover styling', () => {
      const { container } = render(<DocumentTemplates />);

      const templateCards = container.querySelectorAll('.group');
      templateCards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-md', 'transition-all', 'cursor-pointer');
      });
    });

    it('displays version number on each template', () => {
      render(<DocumentTemplates />);

      const versionLabels = screen.getAllByText('v2.4');
      expect(versionLabels.length).toBe(6);
    });

    it('displays Start Draft action', () => {
      render(<DocumentTemplates />);

      const startDraftLinks = screen.getAllByText('Start Draft');
      expect(startDraftLinks.length).toBe(6);
    });
  });

  describe('Header Section', () => {
    it('has proper header styling', () => {
      const { container } = render(<DocumentTemplates />);

      const header = container.querySelector('.p-6.rounded-lg.shadow-sm');
      expect(header).toBeInTheDocument();
    });

    it('header has flex layout', () => {
      const { container } = render(<DocumentTemplates />);

      const header = container.querySelector('.flex.justify-between.items-center');
      expect(header).toBeInTheDocument();
    });

    it('header has Wand2 icon', () => {
      const { container } = render(<DocumentTemplates />);

      const headerIcon = container.querySelector('.text-purple-600');
      expect(headerIcon).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has animation class', () => {
      const { container } = render(<DocumentTemplates />);

      expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('template cards have border styling', () => {
      const { container } = render(<DocumentTemplates />);

      const cards = container.querySelectorAll('.rounded-xl.border');
      expect(cards.length).toBe(6);
    });

    it('template cards have proper padding', () => {
      const { container } = render(<DocumentTemplates />);

      const cards = container.querySelectorAll('.p-5');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Dark Mode', () => {
    it('header has dark mode classes', () => {
      const { container } = render(<DocumentTemplates />);

      const header = container.querySelector('.dark\\:bg-gray-900');
      expect(header).toBeInTheDocument();
    });

    it('template cards have dark mode classes', () => {
      const { container } = render(<DocumentTemplates />);

      const cards = container.querySelectorAll('.dark\\:bg-gray-900');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('text has dark mode classes', () => {
      render(<DocumentTemplates />);

      const description = screen.getByText(/select a template to launch/i);
      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('Popular badge has dark mode classes', () => {
      render(<DocumentTemplates />);

      const popularBadges = screen.getAllByText('Popular');
      popularBadges.forEach(badge => {
        expect(badge).toHaveClass('dark:bg-emerald-900/30', 'dark:text-emerald-400');
      });
    });
  });

  describe('Template Icons', () => {
    it('each template has a file icon container', () => {
      const { container } = render(<DocumentTemplates />);

      const iconContainers = container.querySelectorAll('.rounded-lg.bg-gray-50');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('icons have proper color', () => {
      const { container } = render(<DocumentTemplates />);

      const blueIcons = container.querySelectorAll('.text-blue-600');
      expect(blueIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Start Draft Action', () => {
    it('Start Draft has arrow icon', () => {
      const { container } = render(<DocumentTemplates />);

      const arrows = container.querySelectorAll('.h-3.w-3.ml-1');
      expect(arrows.length).toBe(6);
    });

    it('Start Draft has hover translation', () => {
      const { container } = render(<DocumentTemplates />);

      const startDraftLinks = container.querySelectorAll('.group-hover\\:translate-x-1');
      expect(startDraftLinks.length).toBe(6);
    });
  });

  describe('Layout', () => {
    it('has proper spacing between sections', () => {
      const { container } = render(<DocumentTemplates />);

      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('grid has proper gap', () => {
      const { container } = render(<DocumentTemplates />);

      const grid = container.querySelector('.gap-6');
      expect(grid).toBeInTheDocument();
    });

    it('template cards have footer border', () => {
      const { container } = render(<DocumentTemplates />);

      const footers = container.querySelectorAll('.pt-3.border-t');
      expect(footers.length).toBe(6);
    });
  });

  describe('Accessibility', () => {
    it('templates are interactive', () => {
      const { container } = render(<DocumentTemplates />);

      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(6);
    });

    it('Create New Template button is accessible', () => {
      render(<DocumentTemplates />);

      const button = screen.getByRole('button', { name: /create new template/i });
      expect(button).toBeEnabled();
    });
  });

  describe('Button Variant', () => {
    it('Create New Template button has primary variant', () => {
      render(<DocumentTemplates />);

      const button = screen.getByRole('button', { name: /create new template/i });
      expect(button).toHaveAttribute('data-variant', 'primary');
    });
  });
});
