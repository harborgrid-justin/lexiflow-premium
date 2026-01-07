/**
 * @fileoverview Enterprise-grade tests for ClientPortalList component
 * @module components/client-portal/ClientPortalList.test
 *
 * Tests client listing, search, filtering, and portal access management.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientPortalList } from './ClientPortalList';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Building2: () => <svg data-testid="building-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  Key: () => <svg data-testid="key-icon" />,
  MoreVertical: () => <svg data-testid="more-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  User: () => <svg data-testid="user-icon" />,
}));

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'Corporate',
    contactEmail: 'legal@acme.com',
    portalEnabled: true,
    lastAccess: '2024-01-15',
    activeCases: 3,
  },
  {
    id: '2',
    name: 'John Smith',
    type: 'Individual',
    contactEmail: 'john.smith@email.com',
    portalEnabled: true,
    lastAccess: '2024-01-10',
    activeCases: 1,
  },
  {
    id: '3',
    name: 'Global Industries Inc',
    type: 'Corporate',
    contactEmail: 'counsel@global.com',
    portalEnabled: false,
    lastAccess: null,
    activeCases: 0,
  },
];

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('ClientPortalList', () => {
  describe('Header', () => {
    it('renders the Client Portal title', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('heading', { name: /client portal/i })).toBeInTheDocument();
    });

    it('renders New Client button', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('button', { name: /new client/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CLIENT LIST TESTS
  // ============================================================================

  describe('Client List', () => {
    it('renders all clients', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Global Industries Inc')).toBeInTheDocument();
    });

    it('renders client types', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const corporateLabels = screen.getAllByText('Corporate');
      expect(corporateLabels.length).toBe(2);
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    it('renders client emails', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByText('legal@acme.com')).toBeInTheDocument();
      expect(screen.getByText('john.smith@email.com')).toBeInTheDocument();
      expect(screen.getByText('counsel@global.com')).toBeInTheDocument();
    });

    it('renders active case counts', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByText('3 active cases')).toBeInTheDocument();
      expect(screen.getByText('1 active case')).toBeInTheDocument();
      expect(screen.getByText('0 active cases')).toBeInTheDocument();
    });

    it('renders portal status badges', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const enabledBadges = screen.getAllByText('Enabled');
      expect(enabledBadges.length).toBe(2);
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PORTAL STATUS TESTS
  // ============================================================================

  describe('Portal Status', () => {
    it('shows green badge for enabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const enabledBadges = screen.getAllByText('Enabled');
      enabledBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('shows gray badge for disabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const disabledBadge = screen.getByText('Disabled');
      expect(disabledBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('shows last access date for enabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      // Check for formatted date text
      expect(screen.getByText(/last access:/i)).toBeInTheDocument();
    });

    it('shows Never accessed for disabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByText(/never accessed/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================================================

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByPlaceholderText(/search clients/i)).toBeInTheDocument();
    });

    it('filters clients by name', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const searchInput = screen.getByPlaceholderText(/search clients/i);
      await user.type(searchInput, 'Acme');

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('filters clients by email', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const searchInput = screen.getByPlaceholderText(/search clients/i);
      await user.type(searchInput, 'john.smith');

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Acme Corporation')).not.toBeInTheDocument();
    });

    it('shows all clients when search is cleared', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const searchInput = screen.getByPlaceholderText(/search clients/i);
      await user.type(searchInput, 'Acme');
      await user.clear(searchInput);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FILTER FUNCTIONALITY TESTS
  // ============================================================================

  describe('Filter Functionality', () => {
    it('renders filter dropdown', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has All Clients filter option', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('option', { name: /all clients/i })).toBeInTheDocument();
    });

    it('has Portal Enabled filter option', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('option', { name: /portal enabled/i })).toBeInTheDocument();
    });

    it('has Portal Disabled filter option', () => {
      render(<ClientPortalList initialClients={mockClients} />);
      expect(screen.getByRole('option', { name: /portal disabled/i })).toBeInTheDocument();
    });

    it('filters by portal enabled status', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const filterSelect = screen.getByRole('combobox');
      await user.selectOptions(filterSelect, 'enabled');

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Global Industries Inc')).not.toBeInTheDocument();
    });

    it('filters by portal disabled status', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const filterSelect = screen.getByRole('combobox');
      await user.selectOptions(filterSelect, 'disabled');

      expect(screen.queryByText('Acme Corporation')).not.toBeInTheDocument();
      expect(screen.getByText('Global Industries Inc')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACTION BUTTONS TESTS
  // ============================================================================

  describe('Action Buttons', () => {
    it('renders Access Portal button for enabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const accessButtons = screen.getAllByRole('button', { name: /access portal/i });
      expect(accessButtons.length).toBe(2);
    });

    it('renders Enable Portal button for disabled portals', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByRole('button', { name: /enable portal/i })).toBeInTheDocument();
    });

    it('renders Reset Credentials button', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const resetButtons = screen.getAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('[data-testid="key-icon"]')
      );
      expect(resetButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('shows empty state when no clients', () => {
      render(<ClientPortalList initialClients={[]} />);

      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });

    it('shows empty state when search has no results', async () => {
      const user = userEvent.setup();
      render(<ClientPortalList initialClients={mockClients} />);

      const searchInput = screen.getByPlaceholderText(/search clients/i);
      await user.type(searchInput, 'nonexistentclient');

      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for client cards', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const grid = screen.getByText('Acme Corporation').closest('.grid');
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to container', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const container = screen.getByRole('heading', { name: /client portal/i }).closest('.dark\\:bg-slate-900');
      expect(container).toBeInTheDocument();
    });

    it('applies dark mode classes to client cards', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const card = screen.getByText('Acme Corporation').closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to portal status badges', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const enabledBadge = screen.getAllByText('Enabled')[0];
      expect(enabledBadge).toHaveClass('dark:bg-green-900', 'dark:text-green-200');
    });
  });

  // ============================================================================
  // CLIENT TYPE ICON TESTS
  // ============================================================================

  describe('Client Type Icons', () => {
    it('renders building icon for corporate clients', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      const buildingIcons = screen.getAllByTestId('building-icon');
      expect(buildingIcons.length).toBe(2);
    });

    it('renders user icon for individual clients', () => {
      render(<ClientPortalList initialClients={mockClients} />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });
});
