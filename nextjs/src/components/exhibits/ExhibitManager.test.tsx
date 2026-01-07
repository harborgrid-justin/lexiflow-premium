/**
 * @fileoverview Enterprise-grade tests for ExhibitManager component
 * @module components/exhibits/ExhibitManager.test
 *
 * Tests exhibit listing, filtering, tab navigation, and React concurrent features.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExhibitManager from './ExhibitManager';

// ============================================================================
// MOCKS
// ============================================================================

// Mock the providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-50' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200' },
      primary: { text: 'text-blue-600' },
    },
  }),
}));

// Mock Button component
jest.mock('../ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, icon: Icon, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart2: () => <svg data-testid="bar-chart-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  PenTool: () => <svg data-testid="pen-tool-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('ExhibitManager', () => {
  describe('Header', () => {
    it('renders the Exhibit Manager title', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('heading', { name: /exhibit manager/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders List View tab', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument();
    });

    it('renders Sticker Designer tab', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /sticker designer/i })).toBeInTheDocument();
    });

    it('renders Statistics tab', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /statistics/i })).toBeInTheDocument();
    });

    it('defaults to List View tab', () => {
      render(<ExhibitManager />);
      const listViewTab = screen.getByRole('button', { name: /list view/i });
      expect(listViewTab).toHaveAttribute('data-variant', 'primary');
    });

    it('switches to Sticker Designer tab', async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);

      await user.click(screen.getByRole('button', { name: /sticker designer/i }));

      const stickerTab = screen.getByRole('button', { name: /sticker designer/i });
      expect(stickerTab).toHaveAttribute('data-variant', 'primary');
    });

    it('switches to Statistics tab', async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);

      await user.click(screen.getByRole('button', { name: /statistics/i }));

      const statsTab = screen.getByRole('button', { name: /statistics/i });
      expect(statsTab).toHaveAttribute('data-variant', 'primary');
    });
  });

  // ============================================================================
  // LIST VIEW TESTS
  // ============================================================================

  describe('List View', () => {
    it('renders exhibit table', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<ExhibitManager />);

      expect(screen.getByText('Exhibit #')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Party')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('renders exhibit data', () => {
      render(<ExhibitManager />);

      expect(screen.getByText('P-001')).toBeInTheDocument();
      expect(screen.getByText('D-001')).toBeInTheDocument();
      expect(screen.getByText('P-002')).toBeInTheDocument();
    });

    it('renders exhibit descriptions', () => {
      render(<ExhibitManager />);

      expect(screen.getByText(/contract agreement dated march 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/email correspondence/i)).toBeInTheDocument();
      expect(screen.getByText(/financial records q1 2024/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PARTY FILTER TESTS
  // ============================================================================

  describe('Party Filter', () => {
    it('renders All filter option', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    });

    it('renders Plaintiff filter option', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /plaintiff/i })).toBeInTheDocument();
    });

    it('renders Defense filter option', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /defense/i })).toBeInTheDocument();
    });

    it('defaults to All filter', () => {
      render(<ExhibitManager />);
      const allButton = screen.getByRole('button', { name: /^all$/i });
      expect(allButton).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('filters by Plaintiff when clicked', async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);

      await user.click(screen.getByRole('button', { name: /plaintiff/i }));

      // Should show only plaintiff exhibits
      await waitFor(() => {
        expect(screen.getByText('P-001')).toBeInTheDocument();
        expect(screen.getByText('P-002')).toBeInTheDocument();
      });
    });

    it('filters by Defense when clicked', async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);

      await user.click(screen.getByRole('button', { name: /defense/i }));

      // Wait for filter to apply (deferred state)
      await waitFor(() => {
        const defenseTab = screen.getByRole('button', { name: /defense/i });
        expect(defenseTab).toHaveClass('bg-blue-50', 'text-blue-700');
      });
    });

    it('shows exhibit counts for each filter', () => {
      render(<ExhibitManager />);

      // All = 3, Plaintiff = 2, Defense = 1
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WITNESS FILTER TESTS
  // ============================================================================

  describe('Witness Filter', () => {
    it('renders By Witness section', () => {
      render(<ExhibitManager />);
      expect(screen.getByText(/by witness/i)).toBeInTheDocument();
    });

    it('lists witnesses with exhibits', () => {
      render(<ExhibitManager />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VIEW MODE TOGGLE TESTS
  // ============================================================================

  describe('View Mode Toggle', () => {
    it('renders List mode button', () => {
      render(<ExhibitManager />);
      // There should be a List button for view mode
      const listButtons = screen.getAllByRole('button', { name: /^list$/i });
      expect(listButtons.length).toBeGreaterThan(0);
    });

    it('renders Grid mode button', () => {
      render(<ExhibitManager />);
      expect(screen.getByRole('button', { name: /grid/i })).toBeInTheDocument();
    });

    it('switches to Grid view', async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);

      await user.click(screen.getByRole('button', { name: /grid/i }));

      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveAttribute('data-variant', 'primary');
    });
  });

  // ============================================================================
  // PARTY BADGE COLORS TESTS
  // ============================================================================

  describe('Party Badge Colors', () => {
    it('applies blue styling for Plaintiff party', () => {
      render(<ExhibitManager />);

      const plaintiffBadges = screen.getAllByText('Plaintiff');
      plaintiffBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
      });
    });

    it('applies purple styling for Defense party', () => {
      render(<ExhibitManager />);

      const defenseBadge = screen.getByText('Defense');
      expect(defenseBadge).toHaveClass('bg-purple-100', 'text-purple-700');
    });
  });

  // ============================================================================
  // STATUS BADGE COLORS TESTS
  // ============================================================================

  describe('Status Badge Colors', () => {
    it('applies green styling for Admitted status', () => {
      render(<ExhibitManager />);

      const admittedBadges = screen.getAllByText('Admitted');
      admittedBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-700');
      });
    });

    it('applies yellow styling for Marked status', () => {
      render(<ExhibitManager />);

      const markedBadge = screen.getByText('Marked');
      expect(markedBadge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });
  });

  // ============================================================================
  // STICKER DESIGNER TESTS
  // ============================================================================

  describe('Sticker Designer', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);
      await user.click(screen.getByRole('button', { name: /sticker designer/i }));
    });

    it('renders Sticker Designer heading', () => {
      expect(screen.getByRole('heading', { name: /sticker designer/i })).toBeInTheDocument();
    });

    it('shows coming soon message', () => {
      expect(screen.getByText(/drag and drop interface.*coming soon/i)).toBeInTheDocument();
    });

    it('renders PenTool icon', () => {
      expect(screen.getByTestId('pen-tool-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STATISTICS TAB TESTS
  // ============================================================================

  describe('Statistics Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ExhibitManager />);
      await user.click(screen.getByRole('button', { name: /statistics/i }));
    });

    it('renders Admissibility Status section', () => {
      expect(screen.getByText(/admissibility status/i)).toBeInTheDocument();
    });

    it('renders Exhibits by Party section', () => {
      expect(screen.getByText(/exhibits by party/i)).toBeInTheDocument();
    });

    it('shows percentage for Admitted', () => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows party counts', () => {
      // Plaintiff: 12, Defense: 8 (mock data in component)
      expect(screen.getAllByText('Plaintiff').length).toBeGreaterThan(0);
      expect(screen.getByText('Defense')).toBeInTheDocument();
    });

    it('renders progress bar for admissibility', () => {
      const progressBar = document.querySelector('.bg-green-600.h-2\\.5');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INITIAL TAB PROP TESTS
  // ============================================================================

  describe('Initial Tab Prop', () => {
    it('starts on sticker tab when specified', () => {
      render(<ExhibitManager initialTab="sticker" />);
      expect(screen.getByRole('heading', { name: /sticker designer/i })).toBeInTheDocument();
    });

    it('starts on stats tab when specified', () => {
      render(<ExhibitManager initialTab="stats" />);
      expect(screen.getByText(/admissibility status/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FILTER ICON AND BUTTON TESTS
  // ============================================================================

  describe('Filter Button', () => {
    it('renders Filter button with icon', () => {
      render(<ExhibitManager />);

      // There's a Filter button in the main content area
      const filterButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.toLowerCase().includes('filter')
      );
      expect(filterButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to table', () => {
      render(<ExhibitManager />);

      const table = screen.getByRole('table').closest('.dark\\:bg-gray-800');
      expect(table).toBeInTheDocument();
    });

    it('applies dark mode classes to filter sidebar', () => {
      render(<ExhibitManager />);

      const sidebar = screen.getByText(/filters/i).closest('.dark\\:bg-gray-800');
      expect(sidebar).toBeInTheDocument();
    });

    it('applies dark mode classes to party badges', () => {
      render(<ExhibitManager />);

      const plaintiffBadge = screen.getAllByText('Plaintiff')[0];
      expect(plaintiffBadge).toHaveClass('dark:bg-blue-900', 'dark:text-blue-100');
    });
  });
});
