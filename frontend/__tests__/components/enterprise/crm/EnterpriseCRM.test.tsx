/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnterpriseCRM } from '@/components/enterprise/CRM/EnterpriseCRM';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the data service
jest.mock('@/services/data/dataService', () => ({
  DataService: {
    clients: {
      getAll: jest.fn(),
    },
  },
}));

// Mock hooks
jest.mock('@/hooks/backend', () => ({
  useQuery: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  Building2: () => <div data-testid="building-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  ArrowUpRight: () => <div data-testid="arrow-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  MapPin: () => <div data-testid="map-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  Award: () => <div data-testid="award-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
}));

const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '555-0001',
    industry: 'Technology',
    totalBilled: 450000,
    totalPaid: 400000,
    activeCases: 3,
    status: 'Active',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
  },
  {
    id: '2',
    name: 'Tech Innovations LLC',
    email: 'info@techinnovations.com',
    phone: '555-0002',
    industry: 'Technology',
    totalBilled: 320000,
    totalPaid: 320000,
    activeCases: 2,
    status: 'Active',
    address: '456 Innovation Ave',
    city: 'Austin',
    state: 'TX',
  },
];

const mockOpportunities = [
  {
    id: '1',
    clientId: '1',
    title: 'M&A Advisory Services',
    value: 500000,
    stage: 'Proposal' as const,
    probability: 75,
    expectedCloseDate: '2026-03-15',
    assignedTo: 'John Smith',
    practiceArea: 'Corporate',
    lastActivity: '2026-01-02',
  },
];

const mockRelationships = [
  {
    id: '1',
    clientId: '1',
    relatedClientId: '2',
    relatedClientName: 'Tech Subsidiary Inc.',
    relationshipType: 'Subsidiary' as const,
    strength: 8,
    notes: 'Wholly-owned subsidiary',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{component}</ThemeProvider>
    </QueryClientProvider>
  );
};

describe('EnterpriseCRM Component', () => {
  beforeEach(() => {
    const { useQuery } = require('@/hooks/backend');
    useQuery.mockImplementation((key: string[]) => {
      if (key[0] === 'clients') {
        return { data: mockClients, isLoading: false, error: null };
      }
      if (key[0] === 'crm' && key[1] === 'opportunities') {
        return { data: mockOpportunities, isLoading: false, error: null };
      }
      if (key[0] === 'crm' && key[1] === 'relationships') {
        return { data: mockRelationships, isLoading: false, error: null };
      }
      return { data: [], isLoading: false, error: null };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Client List Rendering', () => {
    test('renders client list view with all clients', () => {
      renderWithProviders(<EnterpriseCRM />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Tech Innovations LLC')).toBeInTheDocument();
    });

    test('displays correct client information in cards', () => {
      renderWithProviders(<EnterpriseCRM />);

      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText(/450k/)).toBeInTheDocument();
      expect(screen.getByText(/contact@acme.com/)).toBeInTheDocument();
      expect(screen.getByText(/555-0001/)).toBeInTheDocument();
    });

    test('displays active cases count for each client', () => {
      renderWithProviders(<EnterpriseCRM />);

      const activeMatterElements = screen.getAllByText(/Active Matters/i);
      expect(activeMatterElements.length).toBeGreaterThan(0);
    });
  });

  describe('Client 360 View', () => {
    test('switches to 360 view when client card is clicked', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Back to Client List')).toBeInTheDocument();
      });
    });

    test('displays client details in 360 view', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText(/123 Tech Street/)).toBeInTheDocument();
        expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
      });
    });

    test('shows contact information section in 360 view', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
      });
    });

    test('navigates back to list view when back button is clicked', async () => {
      renderWithProviders(<EnterpriseCRM />);

      // Go to 360 view
      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Back to Client List')).toBeInTheDocument();
      });

      // Go back to list
      const backButton = screen.getByText('Back to Client List');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.queryByText('Back to Client List')).not.toBeInTheDocument();
      });
    });
  });

  describe('Relationship Mapping', () => {
    test('displays relationship section in 360 view', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Relationships')).toBeInTheDocument();
      });
    });

    test('shows related clients with relationship type', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Tech Subsidiary Inc.')).toBeInTheDocument();
        expect(screen.getByText('Subsidiary')).toBeInTheDocument();
      });
    });

    test('displays relationship strength rating', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText(/Strength: 8\/10/)).toBeInTheDocument();
      });
    });

    test('shows message when no relationships exist', async () => {
      const { useQuery } = require('@/hooks/backend');
      useQuery.mockImplementation((key: string[]) => {
        if (key[0] === 'clients') {
          return { data: [mockClients[1]], isLoading: false, error: null };
        }
        if (key[0] === 'crm' && key[1] === 'relationships') {
          return { data: [], isLoading: false, error: null };
        }
        return { data: [], isLoading: false, error: null };
      });

      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Tech Innovations LLC').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('No relationships mapped')).toBeInTheDocument();
      });
    });
  });

  describe('Opportunity Pipeline', () => {
    test('displays opportunities section in 360 view', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Active Opportunities')).toBeInTheDocument();
      });
    });

    test('shows opportunity details with value and probability', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('M&A Advisory Services')).toBeInTheDocument();
        expect(screen.getByText(/500k/)).toBeInTheDocument();
        expect(screen.getByText(/75% probability/)).toBeInTheDocument();
      });
    });

    test('displays opportunity stage with appropriate styling', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Proposal')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    test('renders search input field', () => {
      renderWithProviders(<EnterpriseCRM />);

      const searchInput = screen.getByPlaceholderText('Search clients...');
      expect(searchInput).toBeInTheDocument();
    });

    test('renders industry filter dropdown', () => {
      renderWithProviders(<EnterpriseCRM />);

      const industryFilter = screen.getByText('All Industries').closest('select');
      expect(industryFilter).toBeInTheDocument();
    });

    test('renders status filter dropdown', () => {
      renderWithProviders(<EnterpriseCRM />);

      const statusFilter = screen.getByText('All Statuses').closest('select');
      expect(statusFilter).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    test('calculates and displays total active clients', () => {
      renderWithProviders(<EnterpriseCRM />);

      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('calculates and displays total revenue', () => {
      renderWithProviders(<EnterpriseCRM />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText(/0.8M/)).toBeInTheDocument();
    });

    test('calculates and displays pipeline value', () => {
      renderWithProviders(<EnterpriseCRM />);

      expect(screen.getByText('Pipeline Value')).toBeInTheDocument();
      expect(screen.getByText(/500k/)).toBeInTheDocument();
    });
  });

  describe('Recent Activity', () => {
    test('displays recent activity section in 360 view', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    test('shows activity entries with timestamps', async () => {
      renderWithProviders(<EnterpriseCRM />);

      const clientCard = screen.getByText('Acme Corporation').closest('div');
      if (clientCard) {
        fireEvent.click(clientCard);
      }

      await waitFor(() => {
        expect(screen.getByText('Quarterly Business Review')).toBeInTheDocument();
        expect(screen.getByText(/2026-01-02 14:00/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Privacy', () => {
    test('does not expose sensitive client data in DOM attributes', () => {
      const { container } = renderWithProviders(<EnterpriseCRM />);

      // Check that sensitive data is not in data attributes
      const elements = container.querySelectorAll('[data-email], [data-phone]');
      expect(elements.length).toBe(0);
    });

    test('renders email and phone safely without exposing in attributes', () => {
      renderWithProviders(<EnterpriseCRM />);

      // Email and phone should be in text content, not attributes
      expect(screen.getByText(/contact@acme.com/)).toBeInTheDocument();
      expect(screen.getByText(/555-0001/)).toBeInTheDocument();
    });
  });
});
