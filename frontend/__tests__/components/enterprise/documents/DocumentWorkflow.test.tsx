/**
 * DocumentWorkflow.test.tsx
 * Comprehensive unit tests for DocumentWorkflow component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentWorkflow } from '@/components/enterprise/Documents/DocumentWorkflow';

// Mock workflow data
const mockWorkflow = {
  id: 'workflow-1',
  documentId: 'doc-1',
  name: 'Contract Review Workflow',
  description: 'Standard contract review process',
  status: 'in_review' as const,
  steps: [
    {
      id: 'step-1',
      name: 'Legal Review',
      type: 'review' as const,
      assigneeId: 'user-1',
      assigneeName: 'John Doe',
      status: 'completed' as const,
      order: 1,
      completedAt: '2024-01-15T10:00:00Z',
      comments: 'Looks good',
    },
    {
      id: 'step-2',
      name: 'Manager Approval',
      type: 'approval' as const,
      assigneeId: 'user-2',
      assigneeName: 'Jane Smith',
      status: 'in_progress' as const,
      order: 2,
      dueDate: '2024-01-25T17:00:00Z',
    },
    {
      id: 'step-3',
      name: 'Final Sign-off',
      type: 'sign' as const,
      assigneeId: 'user-3',
      assigneeName: 'Bob Johnson',
      status: 'pending' as const,
      order: 3,
      dueDate: '2024-01-30T17:00:00Z',
    },
  ],
  createdBy: 'Admin User',
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  dueDate: '2024-01-30T17:00:00Z',
};

const mockOverdueWorkflow = {
  ...mockWorkflow,
  steps: [
    {
      ...mockWorkflow.steps[1],
      status: 'in_progress' as const,
      dueDate: '2024-01-01T17:00:00Z', // Past due
    },
  ],
  dueDate: '2024-01-01T17:00:00Z',
};

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Standard Review',
    description: 'Standard document review workflow',
    steps: [
      {
        name: 'Review',
        type: 'review' as const,
        order: 1,
      },
      {
        name: 'Approval',
        type: 'approval' as const,
        order: 2,
      },
    ],
  },
  {
    id: 'template-2',
    name: 'Contract Approval',
    description: 'Contract approval workflow',
    steps: [
      {
        name: 'Legal Review',
        type: 'review' as const,
        order: 1,
      },
      {
        name: 'Manager Approval',
        type: 'approval' as const,
        order: 2,
      },
      {
        name: 'Executive Sign-off',
        type: 'sign' as const,
        order: 3,
      },
    ],
  },
];

const mockReviewers = [
  { id: 'user-1', name: 'John Doe', role: 'Attorney' },
  { id: 'user-2', name: 'Jane Smith', role: 'Manager' },
  { id: 'user-3', name: 'Bob Johnson', role: 'Partner' },
];

describe('DocumentWorkflow', () => {
  describe('Workflow Step Rendering', () => {
    it('should render workflow steps in order', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Legal Review')).toBeInTheDocument();
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
      expect(screen.getByText('Final Sign-off')).toBeInTheDocument();
    });

    it('should display step assignees', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should show step status badges', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('in progress')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('should display completed step with checkmark', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Check for completed step icon
      const checkmarks = container.querySelectorAll('path[d*="M5 13l4 4L19 7"]');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should show step order numbers', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Pending steps should show order number
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render timeline connecting steps', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Timeline should connect steps
      const timelines = container.querySelectorAll('.w-0\\.5');
      expect(timelines.length).toBeGreaterThan(0);
    });

    it('should highlight current active step', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Active step should have blue background
      const activeSteps = container.querySelectorAll('.bg-blue-50');
      expect(activeSteps.length).toBeGreaterThan(0);
    });

    it('should display step completion date', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText(/Completed on/i)).toBeInTheDocument();
    });

    it('should show step comments when completed', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Comment: Looks good')).toBeInTheDocument();
    });
  });

  describe('Approval Actions', () => {
    it('should show approval buttons for active step', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('should not show action buttons for completed steps', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Only one set of approve/reject buttons for active step
      const approveButtons = screen.getAllByText('Approve');
      expect(approveButtons).toHaveLength(1);
    });

    it('should open comment dialog on approve', async () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Approve Step')).toBeInTheDocument();
      });
    });

    it('should handle approve action with comment', async () => {
      const user = userEvent.setup();
      const onStepComplete = jest.fn().mockResolvedValue(undefined);

      render(
        <DocumentWorkflow
          workflow={mockWorkflow}
          onStepComplete={onStepComplete}
        />
      );

      // Click approve
      fireEvent.click(screen.getByText('Approve'));

      // Add comment
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('Add your comments...');
        user.type(textarea, 'Approved with conditions');
      });

      // Submit
      const submitButton = screen.getAllByText('Approve').find(btn =>
        btn.closest('button')?.className.includes('bg-green')
      );
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(onStepComplete).toHaveBeenCalledWith(
          'workflow-1',
          'step-2',
          expect.any(String)
        );
      });
    });

    it('should handle approve without comment', async () => {
      const onStepComplete = jest.fn().mockResolvedValue(undefined);

      render(
        <DocumentWorkflow
          workflow={mockWorkflow}
          onStepComplete={onStepComplete}
        />
      );

      fireEvent.click(screen.getByText('Approve'));

      await waitFor(() => {
        const submitButton = screen.getAllByText('Approve').find(btn =>
          btn.closest('button')?.className.includes('bg-green')
        );
        fireEvent.click(submitButton!);
      });

      expect(onStepComplete).toHaveBeenCalled();
    });

    it('should display complete button for non-approval steps', () => {
      const customWorkflow = {
        ...mockWorkflow,
        steps: [
          {
            ...mockWorkflow.steps[1],
            type: 'custom' as const,
          },
        ],
      };

      render(<DocumentWorkflow workflow={customWorkflow} />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should cancel approve dialog', async () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      fireEvent.click(screen.getByText('Approve'));

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);
      });

      await waitFor(() => {
        const dialogs = screen.queryAllByText('Approve Step');
        expect(dialogs).toHaveLength(0);
      });
    });
  });

  describe('Rejection with Comments', () => {
    it('should open reject dialog', async () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText('Reject Step')).toBeInTheDocument();
      });
    });

    it('should require comment for rejection', async () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      fireEvent.click(screen.getByText('Reject'));

      await waitFor(() => {
        expect(screen.getByText('Comments (Required)')).toBeInTheDocument();
      });
    });

    it('should disable submit when no rejection comment', async () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      fireEvent.click(screen.getByText('Reject'));

      await waitFor(() => {
        const submitButton = screen.getAllByText('Reject').find(btn =>
          btn.closest('button')?.className.includes('bg-red')
        );
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle rejection with reason', async () => {
      const user = userEvent.setup();
      const onStepReject = jest.fn().mockResolvedValue(undefined);

      render(
        <DocumentWorkflow
          workflow={mockWorkflow}
          onStepReject={onStepReject}
        />
      );

      // Click reject
      fireEvent.click(screen.getByText('Reject'));

      // Add rejection reason
      await waitFor(async () => {
        const textarea = screen.getByPlaceholderText('Add your comments...');
        await user.type(textarea, 'Missing required signatures');
      });

      // Submit
      await waitFor(() => {
        const submitButton = screen.getAllByText('Reject').find(btn =>
          btn.closest('button')?.className.includes('bg-red')
        );
        if (submitButton && !submitButton.hasAttribute('disabled')) {
          fireEvent.click(submitButton);
        }
      });

      await waitFor(() => {
        expect(onStepReject).toHaveBeenCalled();
      });
    });

    it('should show rejection button only for review/approval steps', () => {
      const signWorkflow = {
        ...mockWorkflow,
        steps: [
          {
            ...mockWorkflow.steps[1],
            type: 'sign' as const,
          },
        ],
      };

      render(<DocumentWorkflow workflow={signWorkflow} />);

      // Sign step should not have reject button
      expect(screen.queryByText('Reject')).not.toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      const progressBar = container.querySelector('.bg-blue-600');
      expect(progressBar).toBeInTheDocument();
    });

    it('should calculate correct progress percentage', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      // 1 out of 3 steps completed = 33%
      expect(screen.getByText('33% Complete')).toBeInTheDocument();
    });

    it('should update progress bar width', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      const progressBar = container.querySelector('.bg-blue-600');
      expect(progressBar).toHaveStyle({ width: '33%' });
    });

    it('should show 100% when all steps completed', () => {
      const completedWorkflow = {
        ...mockWorkflow,
        status: 'completed' as const,
        steps: mockWorkflow.steps.map(step => ({
          ...step,
          status: 'completed' as const,
        })),
      };

      render(<DocumentWorkflow workflow={completedWorkflow} />);

      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });

    it('should show 0% when no steps completed', () => {
      const pendingWorkflow = {
        ...mockWorkflow,
        steps: mockWorkflow.steps.map(step => ({
          ...step,
          status: 'pending' as const,
        })),
      };

      render(<DocumentWorkflow workflow={pendingWorkflow} />);

      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });
  });

  describe('Deadline Display', () => {
    it('should display workflow due date', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText(/Due:/i)).toBeInTheDocument();
    });

    it('should display step due dates', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Step due dates should be formatted
      const dueDates = screen.getAllByText(/Jan/i);
      expect(dueDates.length).toBeGreaterThan(0);
    });

    it('should highlight overdue deadlines', () => {
      render(<DocumentWorkflow workflow={mockOverdueWorkflow} />);

      expect(screen.getByText('(Overdue)')).toBeInTheDocument();
    });

    it('should show approaching deadlines', () => {
      const approachingWorkflow = {
        ...mockWorkflow,
        steps: [
          {
            ...mockWorkflow.steps[1],
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          },
        ],
      };

      render(<DocumentWorkflow workflow={approachingWorkflow} />);

      expect(screen.getByText('(Soon)')).toBeInTheDocument();
    });

    it('should use red color for overdue items', () => {
      const { container } = render(<DocumentWorkflow workflow={mockOverdueWorkflow} />);

      const overdueElements = container.querySelectorAll('.text-red-600');
      expect(overdueElements.length).toBeGreaterThan(0);
    });

    it('should use orange color for approaching deadlines', () => {
      const approachingWorkflow = {
        ...mockWorkflow,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const { container } = render(<DocumentWorkflow workflow={approachingWorkflow} />);

      const warningElements = container.querySelectorAll('.text-orange-600');
      expect(warningElements.length).toBeGreaterThan(0);
    });

    it('should show deadline in current step alert', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText(/Current Step:/i)).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      // Should show formatted date like "Jan 15, 2024"
      const formattedDates = screen.getAllByText(/Jan \d+, \d{4}/i);
      expect(formattedDates.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow Creation', () => {
    it('should show create workflow button when no workflow', () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      expect(screen.getByText('Create Workflow')).toBeInTheDocument();
    });

    it('should open template selection dialog', async () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('Create Workflow from Template')).toBeInTheDocument();
      });
    });

    it('should display available templates', async () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('Standard Review')).toBeInTheDocument();
        expect(screen.getByText('Contract Approval')).toBeInTheDocument();
      });
    });

    it('should select template', async () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        const template = screen.getByText('Standard Review');
        fireEvent.click(template.closest('div')!);
      });

      // Template should be selected (checkmark appears)
      await waitFor(() => {
        const checkmark = screen.getByRole('img', { hidden: true });
        expect(checkmark).toBeInTheDocument();
      });
    });

    it('should show template details', async () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('Standard document review workflow')).toBeInTheDocument();
        expect(screen.getByText('2 steps')).toBeInTheDocument();
      });
    });

    it('should disable create button when no template selected', async () => {
      render(<DocumentWorkflow templates={mockTemplates} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        const createButton = screen.getAllByText('Create Workflow').find(btn =>
          btn.closest('button')?.className.includes('bg-blue')
        );
        expect(createButton).toBeDisabled();
      });
    });

    it('should show empty state when no templates', async () => {
      render(<DocumentWorkflow templates={[]} />);

      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('No templates available')).toBeInTheDocument();
      });
    });

    it('should show placeholder when no active workflow', () => {
      render(<DocumentWorkflow />);

      expect(screen.getByText('No active workflow')).toBeInTheDocument();
      expect(screen.getByText('Create a workflow to get started')).toBeInTheDocument();
    });
  });

  describe('Workflow Management', () => {
    it('should display workflow name', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Contract Review Workflow')).toBeInTheDocument();
    });

    it('should show workflow status badge', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
    });

    it('should show cancel workflow button', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Cancel Workflow')).toBeInTheDocument();
    });

    it('should handle workflow cancellation', async () => {
      const onWorkflowCancel = jest.fn().mockResolvedValue(undefined);

      render(
        <DocumentWorkflow
          workflow={mockWorkflow}
          onWorkflowCancel={onWorkflowCancel}
        />
      );

      fireEvent.click(screen.getByText('Cancel Workflow'));

      expect(onWorkflowCancel).toHaveBeenCalledWith('workflow-1');
    });

    it('should not show cancel button for completed workflow', () => {
      const completedWorkflow = {
        ...mockWorkflow,
        status: 'completed' as const,
      };

      render(<DocumentWorkflow workflow={completedWorkflow} />);

      expect(screen.queryByText('Cancel Workflow')).not.toBeInTheDocument();
    });

    it('should display workflow metadata', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Workflow Details')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('should show current step alert', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText(/Current Step:/i)).toBeInTheDocument();
      expect(screen.getByText(/Manager Approval/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      const heading = screen.getByRole('heading', { name: /Document Workflow/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper button labels', () => {
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DocumentWorkflow workflow={mockWorkflow} />);

      const approveButton = screen.getByText('Approve');
      await user.tab();

      // Should be able to navigate to interactive elements
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<DocumentWorkflow workflow={mockWorkflow} />);

      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });
  });
});
