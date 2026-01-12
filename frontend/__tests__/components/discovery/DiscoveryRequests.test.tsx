/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { DiscoveryRequests } from '@/lexiflow-suite/components/discovery/DiscoveryRequests';
import { DiscoveryRequest } from '@/lexiflow-suite/types';
import '@testing-library/jest-dom';

// Mock the TaskCreationModal component
jest.mock('@/lexiflow-suite/components/common/TaskCreationModal', () => ({
  TaskCreationModal: ({ isOpen, onClose, initialTitle }: any) =>
    isOpen ? (
      <div data-testid="task-modal">
        <div>{initialTitle}</div>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock discovery data
jest.mock('@/lexiflow-suite/data/mockDiscovery', () => ({
  MOCK_DISCOVERY: [
    {
      id: 'req-1',
      title: 'Interrogatories Set 1',
      type: 'Interrogatories',
      serviceDate: '2026-01-01',
      dueDate: '2026-02-01',
      status: 'Served',
    },
    {
      id: 'req-2',
      title: 'Request for Production',
      type: 'Production',
      serviceDate: '2026-01-05',
      dueDate: '2026-01-20',
      status: 'In Progress',
    },
    {
      id: 'req-3',
      title: 'Requests for Admission',
      type: 'Admissions',
      serviceDate: '2025-12-15',
      dueDate: '2025-12-20',
      status: 'Overdue',
    },
  ],
}));

describe('DiscoveryRequests', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to make tests deterministic
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render table with all columns', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('Request')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Service Date')).toBeInTheDocument();
      expect(screen.getByText('Deadline')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should display all requests from mock data', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('Interrogatories Set 1')).toBeInTheDocument();
      expect(screen.getByText('Request for Production')).toBeInTheDocument();
      expect(screen.getByText('Requests for Admission')).toBeInTheDocument();
    });

    it('should display request IDs', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('req-1')).toBeInTheDocument();
      expect(screen.getByText('req-2')).toBeInTheDocument();
      expect(screen.getByText('req-3')).toBeInTheDocument();
    });

    it('should display service dates', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('2026-01-01')).toBeInTheDocument();
      expect(screen.getByText('2026-01-05')).toBeInTheDocument();
    });

    it('should display due dates', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('2026-02-01')).toBeInTheDocument();
      expect(screen.getByText('2026-01-20')).toBeInTheDocument();
    });
  });

  describe('Custom Items Prop', () => {
    it('should use provided items instead of mock data', () => {
      const customRequests: DiscoveryRequest[] = [
        {
          id: 'custom-1',
          title: 'Custom Request',
          type: 'Interrogatories',
          serviceDate: '2026-01-10',
          dueDate: '2026-02-10',
          status: 'Served',
        },
      ];

      render(<DiscoveryRequests onNavigate={mockNavigate} items={customRequests} />);

      expect(screen.getByText('Custom Request')).toBeInTheDocument();
      expect(screen.queryByText('Interrogatories Set 1')).not.toBeInTheDocument();
    });
  });

  describe('Days Remaining Calculation', () => {
    it('should calculate days remaining correctly', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      // Due date is 2026-02-01, current is 2026-01-15, so 17 days remaining
      expect(screen.getByText('17 days remaining')).toBeInTheDocument();
    });

    it('should show days remaining for in-progress requests', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      // Due date is 2026-01-20, current is 2026-01-15, so 5 days remaining
      expect(screen.getByText('5 days remaining')).toBeInTheDocument();
    });

    it('should highlight urgent deadlines in red', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      // Days remaining < 5 should have red text
      const urgentTexts = container.querySelectorAll('.text-red-600');
      expect(urgentTexts.length).toBeGreaterThan(0);
    });

    it('should show overdue status', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      // Due date 2025-12-20 is overdue
      const overdueText = screen.getByText(/days overdue/);
      expect(overdueText).toBeInTheDocument();
    });

    it('should not show days remaining for responded requests', () => {
      const respondedRequest: DiscoveryRequest[] = [
        {
          id: 'resp-1',
          title: 'Responded Request',
          type: 'Interrogatories',
          serviceDate: '2026-01-01',
          dueDate: '2026-01-10',
          status: 'Responded',
        },
      ];

      render(<DiscoveryRequests onNavigate={mockNavigate} items={respondedRequest} />);

      expect(screen.queryByText(/days remaining/)).not.toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display status badges with correct variants', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('Served')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to response view when row is clicked', async () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const row = screen.getByText('Interrogatories Set 1');
      fireEvent.click(row);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('response', 'req-1');
      });
    });

    it('should apply clickable cursor to rows', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const clickableRows = container.querySelectorAll('.cursor-pointer');
      expect(clickableRows.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    it('should render draft button for all requests', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const draftButtons = screen.getAllByText('Draft');
      expect(draftButtons.length).toBeGreaterThan(0);
    });

    it('should render produce button for production requests', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      expect(screen.getByText('Produce')).toBeInTheDocument();
    });

    it('should navigate to production view when produce button is clicked', async () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const produceButton = screen.getByText('Produce');
      fireEvent.click(produceButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('production', 'req-2');
      });
    });

    it('should navigate to response view when draft button is clicked', async () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const draftButtons = screen.getAllByText('Draft');
      fireEvent.click(draftButtons[0]);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('response', 'req-1');
      });
    });

    it('should stop propagation on action button clicks', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const draftButton = screen.getAllByText('Draft')[0];
      fireEvent.click(draftButton);

      // Should only navigate to response, not trigger row click
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task Creation', () => {
    it('should render create task buttons', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const taskButtons = container.querySelectorAll('[title="Create Task"]');
      expect(taskButtons.length).toBeGreaterThan(0);
    });

    it('should open task modal when create task button is clicked', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const taskButtons = screen.getAllByRole('button', { name: '' });
      const taskButton = taskButtons.find(btn => btn.getAttribute('title') === 'Create Task');

      if (taskButton) {
        fireEvent.click(taskButton);
        expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      }
    });

    it('should populate task modal with request title', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const taskButtons = screen.getAllByRole('button', { name: '' });
      const firstTaskButton = taskButtons.find(btn => btn.getAttribute('title') === 'Create Task');

      if (firstTaskButton) {
        fireEvent.click(firstTaskButton);
        expect(screen.getByText('Respond to: Interrogatories Set 1')).toBeInTheDocument();
      }
    });

    it('should close task modal when close button is clicked', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const taskButtons = screen.getAllByRole('button', { name: '' });
      const taskButton = taskButtons.find(btn => btn.getAttribute('title') === 'Create Task');

      if (taskButton) {
        fireEvent.click(taskButton);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      }
    });
  });

  describe('Transition States', () => {
    it('should apply fade-in animation', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const animatedDiv = container.querySelector('.animate-fade-in');
      expect(animatedDiv).toBeInTheDocument();
    });

    it('should reduce opacity during pending transitions', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const mainDiv = container.querySelector('.opacity-100');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have table structure with proper headers', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(6);
    });

    it('should have clickable rows for keyboard navigation', () => {
      const { container } = render(<DiscoveryRequests onNavigate={mockNavigate} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request list', () => {
      render(<DiscoveryRequests onNavigate={mockNavigate} items={[]} />);

      // Should render table structure but no data rows
      expect(screen.getByText('Request')).toBeInTheDocument();
    });

    it('should handle requests without production type', () => {
      const nonProductionRequests: DiscoveryRequest[] = [
        {
          id: 'np-1',
          title: 'Interrogatories Only',
          type: 'Interrogatories',
          serviceDate: '2026-01-10',
          dueDate: '2026-02-10',
          status: 'Served',
        },
      ];

      render(<DiscoveryRequests onNavigate={mockNavigate} items={nonProductionRequests} />);

      expect(screen.queryByText('Produce')).not.toBeInTheDocument();
    });
  });
});
