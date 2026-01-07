/**
 * DocumentManager Component Tests
 * Enterprise-grade tests for document manager with tab navigation.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentManager } from './DocumentManager';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('./DocumentExplorer', () => ({
  DocumentExplorer: () => <div data-testid="document-explorer">Document Explorer</div>,
}));

jest.mock('./DocumentTemplates', () => ({
  DocumentTemplates: () => <div data-testid="document-templates">Document Templates</div>,
}));

jest.mock('./RecentFiles', () => ({
  RecentFiles: () => <div data-testid="recent-files">Recent Files</div>,
}));

describe('DocumentManager', () => {
  describe('Rendering', () => {
    it('renders the document manager container', () => {
      const { container } = render(<DocumentManager />);

      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('renders all tab buttons', () => {
      render(<DocumentManager />);

      expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recent/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
    });

    it('renders browse tab as active by default', () => {
      render(<DocumentManager />);

      expect(screen.getByTestId('document-explorer')).toBeInTheDocument();
    });

    it('renders tab icons', () => {
      const { container } = render(<DocumentManager />);

      // Each tab button should have an icon (SVG)
      const tabButtons = screen.getAllByRole('button');
      tabButtons.forEach(button => {
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Recent tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      await user.click(screen.getByRole('button', { name: /recent/i }));

      expect(screen.getByTestId('recent-files')).toBeInTheDocument();
      expect(screen.queryByTestId('document-explorer')).not.toBeInTheDocument();
    });

    it('switches to Templates tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      await user.click(screen.getByRole('button', { name: /templates/i }));

      expect(screen.getByTestId('document-templates')).toBeInTheDocument();
      expect(screen.queryByTestId('document-explorer')).not.toBeInTheDocument();
    });

    it('switches back to Browse tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      // Go to Recent
      await user.click(screen.getByRole('button', { name: /recent/i }));
      expect(screen.getByTestId('recent-files')).toBeInTheDocument();

      // Go back to Browse
      await user.click(screen.getByRole('button', { name: /browse files/i }));
      expect(screen.getByTestId('document-explorer')).toBeInTheDocument();
    });
  });

  describe('Active Tab Styling', () => {
    it('Browse tab has active styling by default', () => {
      render(<DocumentManager />);

      const browseTab = screen.getByRole('button', { name: /browse files/i });
      expect(browseTab).toHaveClass('border-blue-500', 'text-blue-600');
    });

    it('inactive tabs have transparent border', () => {
      render(<DocumentManager />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      const templatesTab = screen.getByRole('button', { name: /templates/i });

      expect(recentTab).toHaveClass('border-transparent');
      expect(templatesTab).toHaveClass('border-transparent');
    });

    it('active styling moves to clicked tab', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      await user.click(screen.getByRole('button', { name: /recent/i }));

      const recentTab = screen.getByRole('button', { name: /recent/i });
      const browseTab = screen.getByRole('button', { name: /browse files/i });

      expect(recentTab).toHaveClass('border-blue-500', 'text-blue-600');
      expect(browseTab).toHaveClass('border-transparent');
    });
  });

  describe('Tab Button Structure', () => {
    it('tab buttons have proper structure', () => {
      render(<DocumentManager />);

      const tabs = screen.getAllByRole('button');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('flex', 'items-center', 'space-x-2');
      });
    });

    it('tab buttons are in a horizontal layout', () => {
      const { container } = render(<DocumentManager />);

      const tabContainer = container.querySelector('.flex.space-x-4');
      expect(tabContainer).toBeInTheDocument();
    });

    it('tabs container has bottom border', () => {
      const { container } = render(<DocumentManager />);

      const tabsWrapper = container.querySelector('.border-b');
      expect(tabsWrapper).toBeInTheDocument();
    });
  });

  describe('Content Area', () => {
    it('content area fills remaining space', () => {
      const { container } = render(<DocumentManager />);

      const contentArea = container.querySelector('.flex-1.overflow-hidden');
      expect(contentArea).toBeInTheDocument();
    });

    it('only one tab content is visible at a time', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      // Initially only browse is visible
      expect(screen.getByTestId('document-explorer')).toBeInTheDocument();
      expect(screen.queryByTestId('recent-files')).not.toBeInTheDocument();
      expect(screen.queryByTestId('document-templates')).not.toBeInTheDocument();

      // Switch to Recent
      await user.click(screen.getByRole('button', { name: /recent/i }));

      expect(screen.queryByTestId('document-explorer')).not.toBeInTheDocument();
      expect(screen.getByTestId('recent-files')).toBeInTheDocument();
      expect(screen.queryByTestId('document-templates')).not.toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background class', () => {
      const { container } = render(<DocumentManager />);

      expect(container.firstChild).toHaveClass('dark:bg-slate-900');
    });

    it('tabs container has dark mode border', () => {
      const { container } = render(<DocumentManager />);

      const tabsWrapper = container.querySelector('.dark\\:border-slate-700');
      expect(tabsWrapper).toBeInTheDocument();
    });

    it('inactive tabs have dark mode text', () => {
      render(<DocumentManager />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      expect(recentTab).toHaveClass('dark:text-slate-400', 'dark:hover:text-slate-200');
    });

    it('active tab has dark mode text', () => {
      render(<DocumentManager />);

      const browseTab = screen.getByRole('button', { name: /browse files/i });
      expect(browseTab).toHaveClass('dark:text-blue-400');
    });
  });

  describe('Accessibility', () => {
    it('all tabs are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      const browseTab = screen.getByRole('button', { name: /browse files/i });
      browseTab.focus();
      expect(document.activeElement).toBe(browseTab);

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /recent/i }));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /templates/i }));
    });

    it('tabs can be activated with Enter key', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      recentTab.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('recent-files')).toBeInTheDocument();
    });

    it('tabs have accessible names', () => {
      render(<DocumentManager />);

      expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recent/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
    });
  });

  describe('Tab Interactions', () => {
    it('clicking same tab does not cause issues', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      // Click browse tab multiple times
      await user.click(screen.getByRole('button', { name: /browse files/i }));
      await user.click(screen.getByRole('button', { name: /browse files/i }));

      expect(screen.getByTestId('document-explorer')).toBeInTheDocument();
    });

    it('rapid tab switching works correctly', async () => {
      const user = userEvent.setup();
      render(<DocumentManager />);

      await user.click(screen.getByRole('button', { name: /recent/i }));
      await user.click(screen.getByRole('button', { name: /templates/i }));
      await user.click(screen.getByRole('button', { name: /browse files/i }));

      expect(screen.getByTestId('document-explorer')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('tabs have proper padding', () => {
      const { container } = render(<DocumentManager />);

      const tabsWrapper = container.querySelector('.px-4');
      expect(tabsWrapper).toBeInTheDocument();
    });

    it('tab buttons have consistent height', () => {
      render(<DocumentManager />);

      const tabs = screen.getAllByRole('button');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('py-4');
      });
    });

    it('icons have consistent size', () => {
      const { container } = render(<DocumentManager />);

      const icons = container.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveClass('w-4', 'h-4');
      });
    });
  });
});
