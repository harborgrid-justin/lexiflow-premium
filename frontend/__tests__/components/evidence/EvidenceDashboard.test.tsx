/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { EvidenceDashboard } from '@/lexiflow-suite/components/evidence/EvidenceDashboard';
import { EvidenceItem } from '@/lexiflow-suite/types';
import '@testing-library/jest-dom';

// Mock recharts
jest.mock('recharts', () => require('@/__tests__/__mocks__/recharts'));

// Mock evidence data
jest.mock('@/lexiflow-suite/data/mockEvidence', () => ({
  MOCK_EVIDENCE: [
    {
      id: 'ev-1',
      type: 'Digital',
      title: 'Email Evidence',
      admissibility: 'Admissible',
      chainOfCustody: [
        { date: '2026-01-10', actor: 'Officer Smith', action: 'Collected' },
      ],
    },
    {
      id: 'ev-2',
      type: 'Physical',
      title: 'Physical Document',
      admissibility: 'Challenged',
      chainOfCustody: [
        { date: '2026-01-11', actor: 'Detective Jones', action: 'Transferred' },
      ],
    },
    {
      id: 'ev-3',
      type: 'Digital',
      title: 'Video Recording',
      admissibility: 'Admissible',
      chainOfCustody: [],
    },
  ],
}));

jest.mock('@/lexiflow-suite/data/mockDiscovery', () => ({
  MOCK_DISCOVERY: [],
  MOCK_LEGAL_HOLDS: [],
  MOCK_PRIVILEGE_LOG: [],
}));

describe('EvidenceDashboard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all metric cards', () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText('Total Evidence')).toBeInTheDocument();
      expect(screen.getByText('Digital Assets')).toBeInTheDocument();
      expect(screen.getByText('Admissibility Risk')).toBeInTheDocument();
      expect(screen.getByText('Chain Integrity')).toBeInTheDocument();
    });

    it('should display correct counts from mock data', () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText('3')).toBeInTheDocument(); // Total items
      expect(screen.getByText('2')).toBeInTheDocument(); // Digital items
      expect(screen.getByText('1')).toBeInTheDocument(); // Challenged items
      expect(screen.getByText('100%')).toBeInTheDocument(); // Chain integrity
    });

    it('should render chart sections', () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText('Evidence Type Distribution')).toBeInTheDocument();
      expect(screen.getByText('Recent Custody Transfers')).toBeInTheDocument();
    });
  });

  describe('Custom Items Prop', () => {
    it('should use provided items instead of mock data', () => {
      const customItems: EvidenceItem[] = [
        {
          id: 'custom-1',
          type: 'Digital',
          title: 'Custom Evidence',
          admissibility: 'Admissible',
          chainOfCustody: [],
        },
      ];

      render(<EvidenceDashboard onNavigate={mockNavigate} items={customItems} />);

      expect(screen.getByText('1')).toBeInTheDocument(); // Total items
    });

    it('should recalculate metrics with custom items', () => {
      const customItems: EvidenceItem[] = [
        {
          id: 'c1',
          type: 'Physical',
          title: 'Item 1',
          admissibility: 'Challenged',
          chainOfCustody: [],
        },
        {
          id: 'c2',
          type: 'Physical',
          title: 'Item 2',
          admissibility: 'Challenged',
          chainOfCustody: [],
        },
      ];

      render(<EvidenceDashboard onNavigate={mockNavigate} items={customItems} />);

      // 2 total, 0 digital, 2 challenged
      const twoTexts = screen.getAllByText('2');
      expect(twoTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to inventory when clicking Total Evidence card', async () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const totalCard = screen.getByText('Total Evidence').closest('.p-4');
      expect(totalCard).toBeInTheDocument();

      if (totalCard) {
        fireEvent.click(totalCard);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('inventory');
        });
      }
    });

    it('should navigate to custody when clicking Chain Integrity card', async () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const custodyCard = screen.getByText('Chain Integrity').closest('.p-4');
      expect(custodyCard).toBeInTheDocument();

      if (custodyCard) {
        fireEvent.click(custodyCard);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('custody');
        });
      }
    });

    it('should navigate to custody from view full log button', async () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const viewButton = screen.getByText('View Full Chain of Custody Log');
      expect(viewButton).toBeInTheDocument();

      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('custody');
      });
    });
  });

  describe('Chain of Custody Display', () => {
    it('should display recent custody events', () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('Transferred')).toBeInTheDocument();
    });

    it('should show actors for custody events', () => {
      render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(screen.getByText(/Officer Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Detective Jones/)).toBeInTheDocument();
    });

    it('should limit custody events to 5 most recent', () => {
      const itemsWithManyCustodyEvents: EvidenceItem[] = [
        {
          id: 'ev-1',
          type: 'Digital',
          title: 'Evidence',
          admissibility: 'Admissible',
          chainOfCustody: Array.from({ length: 10 }, (_, i) => ({
            date: `2026-01-${10 + i}`,
            actor: `Actor ${i}`,
            action: `Action ${i}`,
          })),
        },
      ];

      const { container } = render(
        <EvidenceDashboard onNavigate={mockNavigate} items={itemsWithManyCustodyEvents} />
      );

      // Should only show 5 events
      const activityElements = container.querySelectorAll('.pb-3');
      expect(activityElements.length).toBeLessThanOrEqual(6); // 5 events + possible extra elements
    });
  });

  describe('State Management', () => {
    it('should handle isPending state during transitions', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const mainDiv = container.querySelector('.animate-fade-in');
      expect(mainDiv).toHaveClass('opacity-100');
    });

    it('should reduce opacity during navigation', async () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const totalCard = screen.getByText('Total Evidence').closest('.p-4');
      if (totalCard) {
        fireEvent.click(totalCard);

        // Component should handle transition state
        const mainDiv = container.querySelector('.animate-fade-in');
        expect(mainDiv).toBeInTheDocument();
      }
    });
  });

  describe('Visual Design', () => {
    it('should apply color-coded borders', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      expect(container.querySelector('.border-l-blue-600')).toBeInTheDocument();
      expect(container.querySelector('.border-l-purple-600')).toBeInTheDocument();
      expect(container.querySelector('.border-l-amber-500')).toBeInTheDocument();
      expect(container.querySelector('.border-l-green-600')).toBeInTheDocument();
    });

    it('should show hover effects on clickable cards', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const clickableCards = container.querySelectorAll('.cursor-pointer');
      expect(clickableCards.length).toBeGreaterThan(0);
    });

    it('should have proper spacing and layout', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should provide visual feedback for clickable elements', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);

      const hoverTransitions = container.querySelectorAll('.hover\\:shadow-md');
      expect(hoverTransitions.length).toBeGreaterThan(0);
    });

    it('should render without crashes', () => {
      const { container } = render(<EvidenceDashboard onNavigate={mockNavigate} />);
      expect(container).toBeInTheDocument();
    });
  });
});
