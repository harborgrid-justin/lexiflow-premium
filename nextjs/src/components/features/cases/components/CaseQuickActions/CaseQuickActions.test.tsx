/**
 * CaseQuickActions Component Tests
 * Enterprise-grade test suite for case quick action dropdown menu
 *
 * @module components/features/cases/CaseQuickActions.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseQuickActions } from './CaseQuickActions';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';

describe('CaseQuickActions', () => {
  const mockCase: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    isArchived: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  const defaultProps = {
    case: mockCase,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onArchive: jest.fn(),
    onShare: jest.fn(),
    onDuplicate: jest.fn(),
    onExport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the actions trigger button', () => {
      render(<CaseQuickActions {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Actions/ })).toBeInTheDocument();
    });

    it('should show dropdown menu on click', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /Actions/ });
      await user.click(triggerButton);

      expect(screen.getByText('Edit Case')).toBeInTheDocument();
    });

    it('should hide dropdown by default', () => {
      render(<CaseQuickActions {...defaultProps} />);

      expect(screen.queryByText('Edit Case')).not.toBeInTheDocument();
    });
  });

  describe('Menu Items', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /Actions/ }));
    });

    it('should show Edit Case option', () => {
      expect(screen.getByText('Edit Case')).toBeInTheDocument();
    });

    it('should show Share option', () => {
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should show Duplicate option', () => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    it('should show Export option', () => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should show Archive option for non-archived cases', () => {
      expect(screen.getByText('Archive')).toBeInTheDocument();
    });

    it('should show Delete option', () => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Action Handlers', () => {
    it('should call onEdit when Edit Case is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Edit Case'));

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCase);
    });

    it('should call onShare when Share is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Share'));

      expect(defaultProps.onShare).toHaveBeenCalledWith(mockCase);
    });

    it('should call onDuplicate when Duplicate is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Duplicate'));

      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(mockCase);
    });

    it('should call onExport when Export is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Export'));

      expect(defaultProps.onExport).toHaveBeenCalledWith(mockCase);
    });

    it('should call onArchive when Archive is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Archive'));

      expect(defaultProps.onArchive).toHaveBeenCalledWith(mockCase);
    });

    it('should call onDelete when Delete is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Delete'));

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockCase);
    });
  });

  describe('Archived Case Handling', () => {
    it('should show Unarchive option for archived cases', async () => {
      const user = userEvent.setup();
      const archivedCase = { ...mockCase, isArchived: true };

      render(<CaseQuickActions {...defaultProps} case={archivedCase} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(screen.getByText('Unarchive')).toBeInTheDocument();
      expect(screen.queryByText('Archive')).not.toBeInTheDocument();
    });

    it('should call onUnarchive when Unarchive is clicked', async () => {
      const user = userEvent.setup();
      const archivedCase = { ...mockCase, isArchived: true };
      const onUnarchive = jest.fn();

      render(
        <CaseQuickActions
          {...defaultProps}
          case={archivedCase}
          onUnarchive={onUnarchive}
        />
      );

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Unarchive'));

      expect(onUnarchive).toHaveBeenCalledWith(archivedCase);
    });
  });

  describe('Optional Handlers', () => {
    it('should not show Edit option when onEdit is not provided', async () => {
      const user = userEvent.setup();
      const { onEdit, ...propsWithoutEdit } = defaultProps;

      render(<CaseQuickActions {...propsWithoutEdit} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(screen.queryByText('Edit Case')).not.toBeInTheDocument();
    });

    it('should not show Share option when onShare is not provided', async () => {
      const user = userEvent.setup();
      const { onShare, ...propsWithoutShare } = defaultProps;

      render(<CaseQuickActions {...propsWithoutShare} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });

    it('should not show Duplicate option when onDuplicate is not provided', async () => {
      const user = userEvent.setup();
      const { onDuplicate, ...propsWithoutDuplicate } = defaultProps;

      render(<CaseQuickActions {...propsWithoutDuplicate} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    });

    it('should not show Export option when onExport is not provided', async () => {
      const user = userEvent.setup();
      const { onExport, ...propsWithoutExport } = defaultProps;

      render(<CaseQuickActions {...propsWithoutExport} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(screen.queryByText('Export')).not.toBeInTheDocument();
    });
  });

  describe('Menu Closing', () => {
    it('should close menu after action is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      expect(screen.getByText('Edit Case')).toBeInTheDocument();

      await user.click(screen.getByText('Edit Case'));

      await waitFor(() => {
        expect(screen.queryByText('Edit Case')).not.toBeInTheDocument();
      });
    });

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <CaseQuickActions {...defaultProps} />
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      expect(screen.getByText('Edit Case')).toBeInTheDocument();

      await user.click(screen.getByText('Outside'));

      await waitFor(() => {
        expect(screen.queryByText('Edit Case')).not.toBeInTheDocument();
      });
    });
  });

  describe('Trigger Button Variants', () => {
    it('should render icon-only trigger when triggerVariant is icon', () => {
      render(<CaseQuickActions {...defaultProps} triggerVariant="icon" />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('Actions');
    });

    it('should render full button when triggerVariant is button', () => {
      render(<CaseQuickActions {...defaultProps} triggerVariant="button" />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable trigger button when disabled prop is true', () => {
      render(<CaseQuickActions {...defaultProps} disabled />);

      const button = screen.getByRole('button', { name: /Actions/ });
      expect(button).toBeDisabled();
    });

    it('should not open menu when disabled', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} disabled />);

      const button = screen.getByRole('button', { name: /Actions/ });
      await user.click(button);

      expect(screen.queryByText('Edit Case')).not.toBeInTheDocument();
    });
  });

  describe('Delete Confirmation', () => {
    it('should show confirmation dialog when showDeleteConfirmation is true', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} showDeleteConfirmation />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Delete'));

      // Confirmation dialog should appear
      expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    });

    it('should call onDelete after confirmation', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} showDeleteConfirmation />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Delete'));

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /Confirm/ });
      await user.click(confirmButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockCase);
    });

    it('should not call onDelete when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} showDeleteConfirmation />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));
      await user.click(screen.getByText('Delete'));

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);

      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open menu with Enter key', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Actions/ });
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Edit Case')).toBeInTheDocument();
    });

    it('should open menu with Space key', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Actions/ });
      button.focus();
      await user.keyboard(' ');

      expect(screen.getByText('Edit Case')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      render(<CaseQuickActions {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Actions/ });
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('should indicate expanded state', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Actions/ });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have accessible menu items', async () => {
      const user = userEvent.setup();
      render(<CaseQuickActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <CaseQuickActions {...defaultProps} className="custom-actions-class" />
      );

      expect(container.firstChild).toHaveClass('custom-actions-class');
    });
  });

  describe('Stop Propagation', () => {
    it('should stop click event propagation', async () => {
      const user = userEvent.setup();
      const parentClick = jest.fn();

      render(
        <div onClick={parentClick}>
          <CaseQuickActions {...defaultProps} />
        </div>
      );

      await user.click(screen.getByRole('button', { name: /Actions/ }));

      expect(parentClick).not.toHaveBeenCalled();
    });
  });
});
