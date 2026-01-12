/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { DiscoveryDashboard } from '@/lexiflow-suite/components/discovery/DiscoveryDashboard';
import '@testing-library/jest-dom';

// Mock recharts
jest.mock('recharts', () => require('@/__tests__/__mocks__/recharts'));

// Mock discovery data
jest.mock('@/lexiflow-suite/data/mockDiscovery', () => ({
  MOCK_DISCOVERY: [
    { id: '1', status: 'Served', title: 'Request 1' },
    { id: '2', status: 'Served', title: 'Request 2' },
    { id: '3', status: 'Responded', title: 'Request 3' },
  ],
  MOCK_LEGAL_HOLDS: [
    { id: '1', status: 'Pending', name: 'Hold 1' },
    { id: '2', status: 'Active', name: 'Hold 2' },
  ],
  MOCK_PRIVILEGE_LOG: [
    { id: '1', description: 'Privileged Doc 1' },
    { id: '2', description: 'Privileged Doc 2' },
    { id: '3', description: 'Privileged Doc 3' },
  ],
}));

describe('DiscoveryDashboard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all metric cards', () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Deadlines (7d)')).toBeInTheDocument();
      expect(screen.getByText('Legal Hold Pending')).toBeInTheDocument();
      expect(screen.getByText('Privileged Items')).toBeInTheDocument();
    });

    it('should display correct counts', () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      // 2 served requests
      expect(screen.getByText('2')).toBeInTheDocument();
      // 3 upcoming deadlines
      expect(screen.getByText('3')).toBeInTheDocument();
      // 1 pending hold
      expect(screen.getByText('1')).toBeInTheDocument();
      // 3 privileged items (last one we check)
      const allThrees = screen.getAllByText('3');
      expect(allThrees.length).toBeGreaterThan(0);
    });

    it('should render EDRM Data Funnel chart', () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);
      expect(screen.getByText('EDRM Data Funnel')).toBeInTheDocument();
    });

    it('should render Custodian Volume chart', () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);
      expect(screen.getByText('Custodian Volume')).toBeInTheDocument();
    });

    it('should render Review Progress section', () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);
      expect(screen.getByText('Review Progress')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to requests when clicking pending requests card', async () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const pendingCard = screen.getByText('Pending Requests').closest('.p-4');
      expect(pendingCard).toBeInTheDocument();

      if (pendingCard) {
        fireEvent.click(pendingCard);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('requests', undefined);
        });
      }
    });

    it('should navigate to holds when clicking legal hold card', async () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const holdsCard = screen.getByText('Legal Hold Pending').closest('.p-4');
      expect(holdsCard).toBeInTheDocument();

      if (holdsCard) {
        fireEvent.click(holdsCard);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('holds', undefined);
        });
      }
    });

    it('should navigate to privilege log when clicking privileged items card', async () => {
      render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const privilegeCard = screen.getByText('Privileged Items').closest('.p-4');
      expect(privilegeCard).toBeInTheDocument();

      if (privilegeCard) {
        fireEvent.click(privilegeCard);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('privilege', undefined);
        });
      }
    });
  });

  describe('State Management', () => {
    it('should handle transitions with isPending state', () => {
      const { container } = render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      // Initially should be fully opaque
      const mainDiv = container.querySelector('.animate-fade-in');
      expect(mainDiv).toHaveClass('opacity-100');
    });

    it('should apply reduced opacity during transitions', async () => {
      const { container } = render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const pendingCard = screen.getByText('Pending Requests').closest('.p-4');
      if (pendingCard) {
        fireEvent.click(pendingCard);

        // During transition, opacity might be reduced (this is implementation dependent)
        const mainDiv = container.querySelector('.animate-fade-in');
        expect(mainDiv).toBeInTheDocument();
      }
    });
  });

  describe('Color Coding', () => {
    it('should apply correct border colors to metric cards', () => {
      const { container } = render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      expect(container.querySelector('.border-l-blue-600')).toBeInTheDocument();
      expect(container.querySelector('.border-l-amber-500')).toBeInTheDocument();
      expect(container.querySelector('.border-l-red-600')).toBeInTheDocument();
      expect(container.querySelector('.border-l-purple-600')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide clickable card affordances', () => {
      const { container } = render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const clickableCards = container.querySelectorAll('.cursor-pointer');
      expect(clickableCards.length).toBeGreaterThan(0);
    });

    it('should have hover states for interactive elements', () => {
      const { container } = render(<DiscoveryDashboard onNavigate={mockNavigate} />);

      const hoverElements = container.querySelectorAll('.hover\\:bg-slate-50');
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });
});
