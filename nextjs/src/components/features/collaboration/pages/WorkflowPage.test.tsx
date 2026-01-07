/**
 * @jest-environment jsdom
 * @module WorkflowPage.test
 * @description Enterprise-grade tests for WorkflowPage component
 *
 * Test coverage:
 * - Page rendering
 * - MasterWorkflow integration
 * - PageContainerLayout wrapper
 * - React.memo optimization
 * - onSelectCase callback
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowPage } from './WorkflowPage';

// ============================================================================
// MOCKS
// ============================================================================

const mockOnSelectCase = jest.fn();

jest.mock('@/features/cases/components/workflow/MasterWorkflow', () => ({
  MasterWorkflow: ({ onSelectCase }: { onSelectCase: (id: string) => void }) => (
    <div data-testid="master-workflow">
      <h1>Workflow Management</h1>
      <div data-testid="workflow-content">
        <button onClick={() => onSelectCase('case-123')} data-testid="select-case-btn">
          Select Case
        </button>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('WorkflowPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<WorkflowPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders MasterWorkflow component', () => {
      render(<WorkflowPage />);

      expect(screen.getByTestId('master-workflow')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<WorkflowPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('master-workflow'));
    });

    it('renders workflow content', () => {
      render(<WorkflowPage />);

      expect(screen.getByTestId('workflow-content')).toBeInTheDocument();
    });

    it('displays workflow heading', () => {
      render(<WorkflowPage />);

      expect(screen.getByText('Workflow Management')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts optional caseId prop', () => {
      expect(() => render(<WorkflowPage caseId="case-123" />)).not.toThrow();
    });

    it('works without caseId prop', () => {
      expect(() => render(<WorkflowPage />)).not.toThrow();
    });
  });

  describe('MasterWorkflow Integration', () => {
    it('passes onSelectCase callback to MasterWorkflow', () => {
      render(<WorkflowPage />);

      // The callback is provided but it's a no-op in the current implementation
      expect(screen.getByTestId('select-case-btn')).toBeInTheDocument();
    });

    it('onSelectCase callback does not throw', async () => {
      const user = userEvent.setup();
      render(<WorkflowPage />);

      // Clicking should not cause errors even though callback is empty
      await expect(user.click(screen.getByTestId('select-case-btn'))).resolves.not.toThrow();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(WorkflowPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when props change', () => {
      const { rerender } = render(<WorkflowPage caseId="case-1" />);

      rerender(<WorkflowPage caseId="case-2" />);

      expect(screen.getByTestId('master-workflow')).toBeInTheDocument();
    });

    it('handles multiple re-renders', () => {
      const { rerender } = render(<WorkflowPage />);

      for (let i = 0; i < 3; i++) {
        rerender(<WorkflowPage />);
      }

      expect(screen.getByTestId('master-workflow')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<WorkflowPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<WorkflowPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<WorkflowPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Workflow Management');
    });

    it('contains interactive button', () => {
      render(<WorkflowPage />);

      expect(screen.getByRole('button', { name: 'Select Case' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined caseId', () => {
      render(<WorkflowPage caseId={undefined} />);

      expect(screen.getByTestId('master-workflow')).toBeInTheDocument();
    });

    it('handles empty string caseId', () => {
      render(<WorkflowPage caseId="" />);

      expect(screen.getByTestId('master-workflow')).toBeInTheDocument();
    });
  });
});
