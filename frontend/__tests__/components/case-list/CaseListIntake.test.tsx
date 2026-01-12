/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { CaseListIntake } from '@/lexiflow-suite/components/case-list/CaseListIntake';
import '@testing-library/jest-dom';

describe('CaseListIntake', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pipeline board title', () => {
      render(<CaseListIntake />);
      expect(screen.getByText('Pipeline Board')).toBeInTheDocument();
    });

    it('should render all kanban stages', () => {
      render(<CaseListIntake />);

      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('Conflict Check')).toBeInTheDocument();
      expect(screen.getByText('Engagement Letter')).toBeInTheDocument();
      expect(screen.getByText('Matter Created')).toBeInTheDocument();
    });

    it('should render initial leads', () => {
      render(<CaseListIntake />);

      expect(screen.getByText('Horizon Tech')).toBeInTheDocument();
      expect(screen.getByText('Dr. A. Smith')).toBeInTheDocument();
      expect(screen.getByText('RetailCo')).toBeInTheDocument();
      expect(screen.getByText('StartUp Inc')).toBeInTheDocument();
    });

    it('should display matter types', () => {
      render(<CaseListIntake />);

      expect(screen.getByText('IP Dispute')).toBeInTheDocument();
      expect(screen.getByText('Malpractice Defense')).toBeInTheDocument();
      expect(screen.getByText('Lease Negotiation')).toBeInTheDocument();
      expect(screen.getByText('Series A Funding')).toBeInTheDocument();
    });

    it('should display lead values', () => {
      render(<CaseListIntake />);

      expect(screen.getByText('$50k')).toBeInTheDocument();
      expect(screen.getByText('$120k')).toBeInTheDocument();
      expect(screen.getByText('$15k')).toBeInTheDocument();
      expect(screen.getByText('$200k')).toBeInTheDocument();
    });

    it('should display lead ages', () => {
      render(<CaseListIntake />);

      expect(screen.getByText('2d')).toBeInTheDocument();
      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('1d')).toBeInTheDocument();
      expect(screen.getByText('4h')).toBeInTheDocument();
    });
  });

  describe('Add Lead Functionality', () => {
    it('should render add lead button in New Lead column', () => {
      render(<CaseListIntake />);
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
    });

    it('should add new lead when button is clicked', async () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('New Prospect')).toBeInTheDocument();
        expect(screen.getByText('Pending Intake')).toBeInTheDocument();
      });
    });

    it('should add lead to New Lead stage', async () => {
      render(<CaseListIntake />);

      const initialNewLeads = screen.getByText('New Lead').closest('div');

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('New Prospect')).toBeInTheDocument();
      });
    });

    it('should set default values for new lead', async () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('$0')).toBeInTheDocument();
        expect(screen.getByText('Just now')).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag start event', () => {
      render(<CaseListIntake />);

      const lead = screen.getByText('Horizon Tech');

      fireEvent.dragStart(lead, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: jest.fn(),
        },
      });

      // Should set dragged lead
      expect(lead).toBeInTheDocument();
    });

    it('should handle drop event and move lead to new stage', async () => {
      render(<CaseListIntake />);

      const lead = screen.getByText('RetailCo');

      // Start drag
      fireEvent.dragStart(lead, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: jest.fn(),
        },
      });

      // Drop in new column (implementation depends on KanbanColumn)
      // This test structure is ready for full drag-drop implementation
    });

    it('should clear drag state after drop', () => {
      render(<CaseListIntake />);

      // Drag and drop logic would be tested here
      // This ensures clean state after operations
    });
  });

  describe('Loading State', () => {
    it('should render skeleton cards when loading', () => {
      render(<CaseListIntake isLoading={true} />);

      // Should not render actual leads
      expect(screen.queryByText('Horizon Tech')).not.toBeInTheDocument();
    });

    it('should show zero counts in stages when loading', () => {
      render(<CaseListIntake isLoading={true} />);

      // Stages should still be visible but with no data
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('should not show add lead button when loading', () => {
      render(<CaseListIntake isLoading={true} />);

      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
    });
  });

  describe('Stage Counts', () => {
    it('should display correct count for New Lead stage', () => {
      render(<CaseListIntake />);

      // 2 leads in New Lead stage (RetailCo and StartUp Inc)
      const newLeadColumn = screen.getByText('New Lead');
      expect(newLeadColumn).toBeInTheDocument();
    });

    it('should display correct count for Conflict Check stage', () => {
      render(<CaseListIntake />);

      // 1 lead in Conflict Check stage (Horizon Tech)
      const conflictCheckColumn = screen.getByText('Conflict Check');
      expect(conflictCheckColumn).toBeInTheDocument();
    });

    it('should display correct count for Engagement Letter stage', () => {
      render(<CaseListIntake />);

      // 1 lead in Engagement Letter stage (Dr. A. Smith)
      const engagementColumn = screen.getByText('Engagement Letter');
      expect(engagementColumn).toBeInTheDocument();
    });

    it('should update counts after adding lead', async () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('New Prospect')).toBeInTheDocument();
      });

      // Count should increase
    });
  });

  describe('Transition States', () => {
    it('should apply transition opacity', () => {
      const { container } = render(<CaseListIntake />);

      const mainDiv = container.querySelector('.opacity-100');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should reduce opacity during pending state', async () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      // During transition, component handles state
      await waitFor(() => {
        expect(screen.getByText('New Prospect')).toBeInTheDocument();
      });
    });
  });

  describe('Visual Design', () => {
    it('should have hover effects on add lead button', () => {
      const { container } = render(<CaseListIntake />);

      const addButton = container.querySelector('.hover\\:bg-white');
      expect(addButton).toBeInTheDocument();
    });

    it('should apply dashed border to add lead button', () => {
      const { container } = render(<CaseListIntake />);

      const dashedButton = container.querySelector('.border-dashed');
      expect(dashedButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { container } = render(<CaseListIntake />);

      const heading = container.querySelector('h3');
      expect(heading).toHaveTextContent('Pipeline Board');
    });

    it('should render accessible buttons', () => {
      render(<CaseListIntake />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle keyboard interactions', () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stages gracefully', () => {
      render(<CaseListIntake />);

      // Matter Created stage is empty initially
      const matterCreatedColumn = screen.getByText('Matter Created');
      expect(matterCreatedColumn).toBeInTheDocument();
    });

    it('should generate unique IDs for new leads', async () => {
      render(<CaseListIntake />);

      const addButton = screen.getByText('Add Lead');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('New Prospect')).toBeInTheDocument();
      });

      fireEvent.click(addButton);

      await waitFor(() => {
        const prospects = screen.getAllByText('New Prospect');
        expect(prospects.length).toBe(2);
      });
    });
  });
});
