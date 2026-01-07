/**
 * @module components/enterprise/data/DataGridToolbar.test
 * @description Unit tests for DataGridToolbar component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGridToolbar, type ToolbarAction } from './DataGridToolbar';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

const mockExport = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DataGridToolbar rendering', () => {
  it('should render nothing when no features are enabled', () => {
    const { container } = render(<DataGridToolbar />);
    expect(container.firstChild).toBeNull();
  });

  it('should render title when provided', () => {
    render(<DataGridToolbar title="User Management" />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <DataGridToolbar
        title="Users"
        description="Manage all users in the system"
      />
    );
    expect(screen.getByText('Manage all users in the system')).toBeInTheDocument();
  });

  it('should render export button when onExport is provided', () => {
    render(<DataGridToolbar onExport={mockExport} />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should render custom actions', () => {
    const actions: ToolbarAction[] = [
      { id: 'add', label: 'Add User', onClick: jest.fn() },
      { id: 'delete', label: 'Delete Selected', onClick: jest.fn() },
    ];

    render(<DataGridToolbar actions={actions} />);

    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument();
  });

  it('should render action with icon', () => {
    const actions: ToolbarAction[] = [
      {
        id: 'add',
        label: 'Add',
        icon: <span data-testid="add-icon">+</span>,
        onClick: jest.fn(),
      },
    ];

    render(<DataGridToolbar actions={actions} />);

    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });
});

// ============================================================================
// EXPORT FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridToolbar export functionality', () => {
  it('should open export menu when clicking export button', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as Excel')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
  });

  it('should call onExport with csv when clicking CSV option', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as CSV'));

    expect(mockExport).toHaveBeenCalledWith('csv');
  });

  it('should call onExport with excel when clicking Excel option', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as Excel'));

    expect(mockExport).toHaveBeenCalledWith('excel');
  });

  it('should call onExport with pdf when clicking PDF option', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as PDF'));

    expect(mockExport).toHaveBeenCalledWith('pdf');
  });

  it('should close export menu after selection', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
    });
  });

  it('should close export menu when clicking backdrop', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();

    // Click on the backdrop (fixed inset-0 element)
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      await userEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
    });
  });

  it('should toggle export menu on button click', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });

    // Open menu
    await userEvent.click(exportButton);
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();

    // Close menu by clicking again
    await userEvent.click(exportButton);
    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
    });
  });

  it('should rotate chevron icon when menu is open', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    await userEvent.click(screen.getByRole('button', { name: /export/i }));

    // The chevron should have rotate-180 class when menu is open
    const chevron = document.querySelector('.rotate-180');
    expect(chevron).toBeInTheDocument();
  });
});

// ============================================================================
// ACTION BUTTON TESTS
// ============================================================================

describe('DataGridToolbar action buttons', () => {
  it('should call action onClick when clicking action button', async () => {
    const handleClick = jest.fn();
    const actions: ToolbarAction[] = [
      { id: 'add', label: 'Add User', onClick: handleClick },
    ];

    render(<DataGridToolbar actions={actions} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should disable action button when disabled is true', () => {
    const actions: ToolbarAction[] = [
      { id: 'delete', label: 'Delete', onClick: jest.fn(), disabled: true },
    ];

    render(<DataGridToolbar actions={actions} />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('should not call onClick when disabled button is clicked', async () => {
    const handleClick = jest.fn();
    const actions: ToolbarAction[] = [
      { id: 'delete', label: 'Delete', onClick: handleClick, disabled: true },
    ];

    render(<DataGridToolbar actions={actions} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply primary variant styling', () => {
    const actions: ToolbarAction[] = [
      { id: 'add', label: 'Add', onClick: jest.fn(), variant: 'primary' },
    ];

    render(<DataGridToolbar actions={actions} />);

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should apply danger variant styling', () => {
    const actions: ToolbarAction[] = [
      { id: 'delete', label: 'Delete', onClick: jest.fn(), variant: 'danger' },
    ];

    render(<DataGridToolbar actions={actions} />);

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bg-red-500', 'text-white');
  });

  it('should apply secondary variant styling by default', () => {
    const actions: ToolbarAction[] = [
      { id: 'edit', label: 'Edit', onClick: jest.fn() },
    ];

    render(<DataGridToolbar actions={actions} />);

    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toHaveClass('border');
  });

  it('should render multiple actions in order', () => {
    const actions: ToolbarAction[] = [
      { id: 'first', label: 'First', onClick: jest.fn() },
      { id: 'second', label: 'Second', onClick: jest.fn() },
      { id: 'third', label: 'Third', onClick: jest.fn() },
    ];

    render(<DataGridToolbar actions={actions} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('First');
    expect(buttons[1]).toHaveTextContent('Second');
    expect(buttons[2]).toHaveTextContent('Third');
  });
});

// ============================================================================
// COMBINED FEATURES TESTS
// ============================================================================

describe('DataGridToolbar combined features', () => {
  it('should render title, actions, and export together', () => {
    const actions: ToolbarAction[] = [
      { id: 'add', label: 'Add', onClick: jest.fn() },
    ];

    render(
      <DataGridToolbar
        title="Data Table"
        description="View and manage data"
        actions={actions}
        onExport={mockExport}
      />
    );

    expect(screen.getByText('Data Table')).toBeInTheDocument();
    expect(screen.getByText('View and manage data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should render without title but with actions and export', () => {
    const actions: ToolbarAction[] = [
      { id: 'refresh', label: 'Refresh', onClick: jest.fn() },
    ];

    render(
      <DataGridToolbar
        actions={actions}
        onExport={mockExport}
      />
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should handle many actions gracefully', () => {
    const actions: ToolbarAction[] = Array.from({ length: 5 }, (_, i) => ({
      id: `action-${i}`,
      label: `Action ${i}`,
      onClick: jest.fn(),
    }));

    render(<DataGridToolbar actions={actions} />);

    actions.forEach((action) => {
      expect(screen.getByRole('button', { name: action.label })).toBeInTheDocument();
    });
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('DataGridToolbar styling', () => {
  it('should have flex layout', () => {
    const { container } = render(<DataGridToolbar title="Test" />);
    const toolbar = container.firstChild as HTMLElement;

    expect(toolbar).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('should apply theme surface classes', () => {
    const { container } = render(<DataGridToolbar title="Test" />);
    const toolbar = container.firstChild as HTMLElement;

    expect(toolbar).toHaveClass('bg-white');
  });

  it('should apply theme border classes', () => {
    const { container } = render(<DataGridToolbar title="Test" />);
    const toolbar = container.firstChild as HTMLElement;

    expect(toolbar).toHaveClass('border-b');
  });

  it('should apply proper spacing', () => {
    const { container } = render(<DataGridToolbar title="Test" />);
    const toolbar = container.firstChild as HTMLElement;

    expect(toolbar).toHaveClass('px-4', 'py-3');
  });

  it('should style title correctly', () => {
    render(<DataGridToolbar title="Test Title" />);
    const title = screen.getByText('Test Title');

    expect(title).toHaveClass('text-lg', 'font-semibold');
  });

  it('should style description correctly', () => {
    render(<DataGridToolbar title="Title" description="Description text" />);
    const description = screen.getByText('Description text');

    expect(description).toHaveClass('text-sm');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DataGridToolbar accessibility', () => {
  it('should have proper heading element for title', () => {
    render(<DataGridToolbar title="Accessible Title" />);
    const heading = screen.getByRole('heading', { level: 3 });

    expect(heading).toHaveTextContent('Accessible Title');
  });

  it('should have accessible buttons', () => {
    const actions: ToolbarAction[] = [
      { id: 'add', label: 'Add User', onClick: jest.fn() },
    ];

    render(<DataGridToolbar actions={actions} onExport={mockExport} />);

    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should have proper disabled state for buttons', () => {
    const actions: ToolbarAction[] = [
      { id: 'disabled', label: 'Disabled Action', onClick: jest.fn(), disabled: true },
    ];

    render(<DataGridToolbar actions={actions} />);

    const button = screen.getByRole('button', { name: 'Disabled Action' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should have keyboard-accessible export menu', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });

    // Focus and activate with keyboard
    exportButton.focus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DataGridToolbar edge cases', () => {
  it('should handle empty actions array', () => {
    const { container } = render(<DataGridToolbar actions={[]} title="Test" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle very long title', () => {
    const longTitle = 'A'.repeat(100);
    render(<DataGridToolbar title={longTitle} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const longDescription = 'B'.repeat(200);
    render(<DataGridToolbar title="Title" description={longDescription} />);

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should handle very long action labels', () => {
    const longLabel = 'Click me '.repeat(10);
    const actions: ToolbarAction[] = [
      { id: 'long', label: longLabel, onClick: jest.fn() },
    ];

    render(<DataGridToolbar actions={actions} />);

    expect(screen.getByRole('button', { name: longLabel })).toBeInTheDocument();
  });

  it('should handle rapid export menu toggling', async () => {
    render(<DataGridToolbar onExport={mockExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });

    // Rapidly toggle
    await userEvent.click(exportButton);
    await userEvent.click(exportButton);
    await userEvent.click(exportButton);

    // Should be in open state (odd number of clicks)
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
  });

  it('should handle rapid action clicks', async () => {
    const handleClick = jest.fn();
    const actions: ToolbarAction[] = [
      { id: 'rapid', label: 'Rapid Click', onClick: handleClick },
    ];

    render(<DataGridToolbar actions={actions} />);

    const button = screen.getByRole('button', { name: 'Rapid Click' });

    // Rapid clicks
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});
