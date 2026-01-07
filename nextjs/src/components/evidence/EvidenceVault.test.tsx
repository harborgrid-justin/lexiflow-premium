/**
 * @fileoverview Enterprise-grade tests for EvidenceVault component
 * @module components/evidence/EvidenceVault.test
 *
 * Tests evidence inventory, chain of custody, forensics, and detail views.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EvidenceVault from './EvidenceVault';

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
    },
  }),
}));

// Mock Button component
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, icon: Icon, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}));

// Mock LazyLoader
jest.mock('@/components/ui/molecules/LazyLoader/LazyLoader', () => ({
  LazyLoader: ({ message }: { message: string }) => <div data-testid="lazy-loader">{message}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Box: () => <svg data-testid="box-icon" />,
  FileSearch: () => <svg data-testid="file-search-icon" />,
  History: () => <svg data-testid="history-icon" />,
  LayoutDashboard: () => <svg data-testid="layout-dashboard-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Search: () => <svg data-testid="search-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('EvidenceVault', () => {
  describe('Header', () => {
    it('renders the Evidence Vault title', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('heading', { name: /evidence vault/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<EvidenceVault />);
      expect(screen.getByText(/secure chain of custody & forensic asset management/i)).toBeInTheDocument();
    });

    it('renders Search Vault button', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /search vault/i })).toBeInTheDocument();
    });

    it('renders Log New Item button', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /log new item/i })).toBeInTheDocument();
    });

    it('hides header when caseId is provided', () => {
      render(<EvidenceVault caseId="123" />);
      expect(screen.queryByRole('heading', { name: /evidence vault/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // PARENT TAB NAVIGATION TESTS
  // ============================================================================

  describe('Parent Tab Navigation', () => {
    it('renders Overview tab', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
    });

    it('renders Chain of Custody tab', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /chain of custody/i })).toBeInTheDocument();
    });

    it('renders Forensics tab', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /forensics/i })).toBeInTheDocument();
    });

    it('defaults to Overview tab', () => {
      render(<EvidenceVault />);
      const overviewTab = screen.getByRole('button', { name: /overview/i });
      expect(overviewTab).toHaveClass('border-blue-600', 'text-blue-600');
    });
  });

  // ============================================================================
  // SUB-TAB NAVIGATION TESTS
  // ============================================================================

  describe('Sub-Tab Navigation', () => {
    it('renders Dashboard sub-tab for Overview', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /^dashboard$/i })).toBeInTheDocument();
    });

    it('renders Inventory sub-tab for Overview', () => {
      render(<EvidenceVault />);
      expect(screen.getByRole('button', { name: /^inventory$/i })).toBeInTheDocument();
    });

    it('changes sub-tabs when parent tab changes', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /chain of custody/i }));

      expect(screen.getByRole('button', { name: /custody log/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /intake wizard/i })).toBeInTheDocument();
    });

    it('shows Analysis sub-tab for Forensics', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /forensics/i }));

      expect(screen.getByRole('button', { name: /analysis/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DASHBOARD CONTENT TESTS
  // ============================================================================

  describe('Dashboard Content', () => {
    it('renders Total Items metric', () => {
      render(<EvidenceVault />);
      expect(screen.getByText(/total items/i)).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });

    it('renders In Custody metric', () => {
      render(<EvidenceVault />);
      expect(screen.getByText(/in custody/i)).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
    });

    it('renders Pending Intake metric', () => {
      render(<EvidenceVault />);
      expect(screen.getByText(/pending intake/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INVENTORY VIEW TESTS
  // ============================================================================

  describe('Inventory View', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);
      await user.click(screen.getByRole('button', { name: /^inventory$/i }));
    });

    it('renders Evidence Inventory heading', () => {
      expect(screen.getByText(/evidence inventory/i)).toBeInTheDocument();
    });

    it('renders evidence items', () => {
      expect(screen.getByText('Hard Drive - Seagate 2TB')).toBeInTheDocument();
      expect(screen.getByText('Email Archive - PST')).toBeInTheDocument();
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument();
    });

    it('renders evidence types', () => {
      const physicalLabels = screen.getAllByText(/physical/i);
      expect(physicalLabels.length).toBeGreaterThan(0);
      expect(screen.getByText(/digital/i)).toBeInTheDocument();
    });

    it('renders custodian names', () => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
      expect(screen.getByText(/robert johnson/i)).toBeInTheDocument();
    });

    it('renders status badges', () => {
      const inCustodyBadges = screen.getAllByText('In Custody');
      expect(inCustodyBadges.length).toBe(2);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('renders Log New Item button in inventory', () => {
      const logButtons = screen.getAllByRole('button', { name: /log new item/i });
      expect(logButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // ITEM CLICK AND DETAIL VIEW TESTS
  // ============================================================================

  describe('Item Click and Detail View', () => {
    it('opens detail view when item is clicked', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /^inventory$/i }));
      await user.click(screen.getByText('Hard Drive - Seagate 2TB'));

      expect(screen.getByRole('heading', { name: /hard drive - seagate 2tb/i })).toBeInTheDocument();
    });

    it('shows Back to Inventory button in detail view', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /^inventory$/i }));
      await user.click(screen.getByText('Hard Drive - Seagate 2TB'));

      expect(screen.getByRole('button', { name: /back to inventory/i })).toBeInTheDocument();
    });

    it('displays item details in detail view', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /^inventory$/i }));
      await user.click(screen.getByText('Hard Drive - Seagate 2TB'));

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Custodian')).toBeInTheDocument();
    });

    it('returns to inventory when back button clicked', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /^inventory$/i }));
      await user.click(screen.getByText('Hard Drive - Seagate 2TB'));
      await user.click(screen.getByRole('button', { name: /back to inventory/i }));

      expect(screen.getByText(/evidence inventory/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PLACEHOLDER VIEWS TESTS
  // ============================================================================

  describe('Placeholder Views', () => {
    it('shows placeholder for Chain of Custody', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /chain of custody/i }));

      expect(screen.getByText(/chain of custody/i)).toBeInTheDocument();
    });

    it('shows placeholder for Forensics', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /forensics/i }));

      expect(screen.getByText(/module under construction/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INITIAL TAB PROP TESTS
  // ============================================================================

  describe('Initial Tab Prop', () => {
    it('starts on inventory when specified', () => {
      render(<EvidenceVault initialTab="inventory" />);
      expect(screen.getByText(/evidence inventory/i)).toBeInTheDocument();
    });

    it('starts on chain_of_custody when specified', () => {
      render(<EvidenceVault initialTab="chain_of_custody" />);
      // The placeholder shows chain of custody
      expect(screen.getByText(/chain of custody/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // METRIC STYLING TESTS
  // ============================================================================

  describe('Metric Styling', () => {
    it('applies blue color to Total Items count', () => {
      render(<EvidenceVault />);

      const totalCount = screen.getByText('142');
      expect(totalCount).toHaveClass('text-blue-600');
    });

    it('applies emerald color to In Custody count', () => {
      render(<EvidenceVault />);

      const custodyCount = screen.getByText('89');
      expect(custodyCount).toHaveClass('text-emerald-600');
    });

    it('applies amber color to Pending Intake count', () => {
      render(<EvidenceVault />);

      const pendingCount = screen.getByText('12');
      expect(pendingCount).toHaveClass('text-amber-600');
    });
  });

  // ============================================================================
  // STATUS BADGE STYLING TESTS
  // ============================================================================

  describe('Status Badge Styling', () => {
    it('applies blue styling to status badges', async () => {
      const user = userEvent.setup();
      render(<EvidenceVault />);

      await user.click(screen.getByRole('button', { name: /^inventory$/i }));

      const inCustodyBadges = screen.getAllByText('In Custody');
      inCustodyBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
      });
    });
  });

  // ============================================================================
  // TAB ICONS TESTS
  // ============================================================================

  describe('Tab Icons', () => {
    it('renders LayoutDashboard icon for Overview', () => {
      render(<EvidenceVault />);
      const dashboardIcons = screen.getAllByTestId('layout-dashboard-icon');
      expect(dashboardIcons.length).toBeGreaterThan(0);
    });

    it('renders Lock icon for Chain of Custody', () => {
      render(<EvidenceVault />);
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('renders FileSearch icon for Forensics', () => {
      render(<EvidenceVault />);
      expect(screen.getByTestId('file-search-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to metric cards', () => {
      render(<EvidenceVault />);

      const card = screen.getByText(/total items/i).closest('.dark\\:bg-gray-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to container', () => {
      render(<EvidenceVault />);

      const container = screen.getByRole('heading', { name: /evidence vault/i }).closest('.dark\\:bg-gray-900');
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for dashboard metrics', () => {
      render(<EvidenceVault />);

      const metricsGrid = screen.getByText(/total items/i).closest('.grid');
      expect(metricsGrid).toHaveClass('md:grid-cols-3');
    });
  });
});
