/**
 * @jest-environment jsdom
 * @module PleadingsPage.test
 * @description Enterprise-grade tests for PleadingsPage component
 *
 * Test coverage:
 * - Page rendering
 * - PleadingDashboard integration
 * - onCreate callback
 * - onEdit callback
 * - caseId prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PleadingsPage } from './PleadingsPage';
import type { PleadingDocument } from '@/types';

// ============================================================================
// MOCKS
// ============================================================================

const mockPleadingDoc: PleadingDocument = {
  id: 'pleading-123',
  title: 'Motion to Dismiss',
  type: 'motion',
  content: 'Motion content...',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

jest.mock('@/features/litigation/pleadings/PleadingDashboard', () => ({
  PleadingDashboard: ({
    onCreate,
    onEdit,
    caseId,
  }: {
    onCreate: (doc: PleadingDocument) => void;
    onEdit: (id: string) => void;
    caseId?: string;
  }) => (
    <div data-testid="pleading-dashboard">
      <h1>Pleadings Management</h1>
      {caseId && <p data-testid="case-id">Case: {caseId}</p>}
      <div data-testid="pleading-content">
        <button onClick={() => onCreate(mockPleadingDoc)} data-testid="create-btn">
          Create Pleading
        </button>
        <button onClick={() => onEdit('pleading-456')} data-testid="edit-btn">
          Edit Pleading
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

describe('PleadingsPage', () => {
  const mockOnCreate = jest.fn();
  const mockOnEdit = jest.fn();

  const defaultProps = {
    onCreate: mockOnCreate,
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders PleadingDashboard component', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<PleadingsPage {...defaultProps} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('pleading-dashboard'));
    });

    it('displays pleadings heading', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pleadings Management');
    });

    it('renders pleading content', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByTestId('pleading-content')).toBeInTheDocument();
    });
  });

  describe('Props Propagation', () => {
    it('passes onCreate to PleadingDashboard', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByTestId('create-btn')).toBeInTheDocument();
    });

    it('passes onEdit to PleadingDashboard', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
    });

    it('passes caseId to PleadingDashboard when provided', () => {
      render(<PleadingsPage {...defaultProps} caseId="case-789" />);

      expect(screen.getByTestId('case-id')).toHaveTextContent('Case: case-789');
    });

    it('does not display caseId when not provided', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.queryByTestId('case-id')).not.toBeInTheDocument();
    });
  });

  describe('onCreate Callback', () => {
    it('calls onCreate with new pleading document', async () => {
      const user = userEvent.setup();
      render(<PleadingsPage {...defaultProps} />);

      await user.click(screen.getByTestId('create-btn'));

      expect(mockOnCreate).toHaveBeenCalledWith(mockPleadingDoc);
    });

    it('calls onCreate exactly once per click', async () => {
      const user = userEvent.setup();
      render(<PleadingsPage {...defaultProps} />);

      await user.click(screen.getByTestId('create-btn'));

      expect(mockOnCreate).toHaveBeenCalledTimes(1);
    });

    it('does not call onCreate on initial render', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  describe('onEdit Callback', () => {
    it('calls onEdit with pleading ID', async () => {
      const user = userEvent.setup();
      render(<PleadingsPage {...defaultProps} />);

      await user.click(screen.getByTestId('edit-btn'));

      expect(mockOnEdit).toHaveBeenCalledWith('pleading-456');
    });

    it('calls onEdit exactly once per click', async () => {
      const user = userEvent.setup();
      render(<PleadingsPage {...defaultProps} />);

      await user.click(screen.getByTestId('edit-btn'));

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('does not call onEdit on initial render', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(PleadingsPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when callbacks change', () => {
      const { rerender } = render(<PleadingsPage {...defaultProps} />);

      const newOnCreate = jest.fn();
      const newOnEdit = jest.fn();
      rerender(<PleadingsPage onCreate={newOnCreate} onEdit={newOnEdit} />);

      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();
    });

    it('re-renders correctly when caseId changes', () => {
      const { rerender } = render(<PleadingsPage {...defaultProps} caseId="case-1" />);

      expect(screen.getByTestId('case-id')).toHaveTextContent('Case: case-1');

      rerender(<PleadingsPage {...defaultProps} caseId="case-2" />);

      expect(screen.getByTestId('case-id')).toHaveTextContent('Case: case-2');
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<PleadingsPage {...defaultProps} />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<PleadingsPage {...defaultProps} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Action Buttons', () => {
    it('renders create button', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByText('Create Pleading')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByText('Edit Pleading')).toBeInTheDocument();
    });

    it('both buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<PleadingsPage {...defaultProps} />);

      await user.click(screen.getByText('Create Pleading'));
      await user.click(screen.getByText('Edit Pleading'));

      expect(mockOnCreate).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<PleadingsPage {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('all buttons are accessible', () => {
      render(<PleadingsPage {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined caseId', () => {
      render(<PleadingsPage {...defaultProps} caseId={undefined} />);

      expect(screen.queryByTestId('case-id')).not.toBeInTheDocument();
    });

    it('handles empty caseId', () => {
      render(<PleadingsPage {...defaultProps} caseId="" />);

      // Empty string is truthy for the condition, but displays empty
      expect(screen.queryByTestId('case-id')).not.toBeInTheDocument();
    });
  });
});
