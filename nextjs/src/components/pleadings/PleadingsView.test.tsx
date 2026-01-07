/**
 * @jest-environment jsdom
 * PleadingsView Component Tests
 * Enterprise-grade tests for pleadings view with dashboard/editor toggle
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PleadingsView } from './PleadingsView';

// Mock dependencies
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('./PleadingDashboard', () => ({
  PleadingDashboard: ({ onCreate, onEdit }: any) => (
    <div data-testid="pleading-dashboard">
      <button onClick={onCreate} data-testid="create-btn">Create</button>
      <button onClick={() => onEdit('123')} data-testid="edit-btn">Edit</button>
    </div>
  ),
}));

describe('PleadingsView', () => {
  describe('Rendering', () => {
    it('renders PleadingDashboard by default', () => {
      render(<PleadingsView />);

      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();
    });

    it('does not render editor view by default', () => {
      render(<PleadingsView />);

      expect(screen.queryByText('Pleading Editor')).not.toBeInTheDocument();
    });
  });

  describe('View Switching', () => {
    it('switches to editor when create is triggered', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      expect(screen.queryByTestId('pleading-dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('New Pleading')).toBeInTheDocument();
    });

    it('switches to editor when edit is triggered', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('edit-btn'));

      expect(screen.queryByTestId('pleading-dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('Editing Pleading')).toBeInTheDocument();
    });

    it('switches back to dashboard when back button clicked', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      // Go to editor
      await user.click(screen.getByTestId('create-btn'));
      expect(screen.getByText('New Pleading')).toBeInTheDocument();

      // Click back
      await user.click(screen.getByText('Back to Dashboard'));

      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();
    });
  });

  describe('Editor View', () => {
    it('shows Back to Dashboard button', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });

    it('shows editor placeholder content', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      expect(screen.getByText('Pleading Editor')).toBeInTheDocument();
      expect(screen.getByText('Editor component coming soon...')).toBeInTheDocument();
    });

    it('shows New Pleading title for new documents', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      expect(screen.getByText('New Pleading')).toBeInTheDocument();
    });

    it('shows Editing Pleading title for existing documents', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('edit-btn'));

      expect(screen.getByText('Editing Pleading')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('maintains view state correctly through multiple transitions', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      // Dashboard -> Editor -> Dashboard -> Editor
      await user.click(screen.getByTestId('create-btn'));
      expect(screen.getByText('New Pleading')).toBeInTheDocument();

      await user.click(screen.getByText('Back to Dashboard'));
      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();

      await user.click(screen.getByTestId('edit-btn'));
      expect(screen.getByText('Editing Pleading')).toBeInTheDocument();

      await user.click(screen.getByText('Back to Dashboard'));
      expect(screen.getByTestId('pleading-dashboard')).toBeInTheDocument();
    });
  });

  describe('Editor Layout', () => {
    it('has header with back button', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      const header = screen.getByText('Back to Dashboard').parentElement;
      expect(header).toHaveClass('border-b');
    });

    it('has flex column layout', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      const editorContainer = screen.getByText('Pleading Editor').closest('.flex');
      expect(editorContainer).toHaveClass('flex-col');
    });
  });

  describe('Document ID Tracking', () => {
    it('sets selectedId to new for create', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      expect(screen.getByText('New Pleading')).toBeInTheDocument();
    });

    it('sets selectedId to document ID for edit', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('edit-btn'));

      expect(screen.getByText('Editing Pleading')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('editor has full height', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      const container = screen.getByText('Pleading Editor').closest('.h-full');
      expect(container).toBeInTheDocument();
    });

    it('applies proper background colors', async () => {
      const user = userEvent.setup();
      render(<PleadingsView />);

      await user.click(screen.getByTestId('create-btn'));

      const header = screen.getByText('Back to Dashboard').closest('.bg-white');
      expect(header).toBeInTheDocument();
    });
  });
});
