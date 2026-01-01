/**
 * @module components/navigation/QuickActions.test
 * @category Navigation - Tests
 * @description Unit tests for QuickActions component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuickActions } from './QuickActions';
import type { QuickActionGroup } from './QuickActions';
import { Clock, FileText, UserPlus, Briefcase } from 'lucide-react';

// Mock useTheme
vi.mock('@/providers/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      text: { primary: 'text-slate-900', secondary: 'text-slate-600', tertiary: 'text-slate-400' },
      surface: { default: 'bg-white', highlight: 'bg-slate-100' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock useClickOutside
vi.mock('@/hooks/useClickOutside', () => ({
  useClickOutside: vi.fn(),
}));

const mockGroups: QuickActionGroup[] = [
  {
    id: 'common',
    title: 'Common Actions',
    actions: [
      {
        id: '1',
        label: 'Log Time',
        description: 'Log billable time',
        icon: Clock,
        iconVariant: 'success',
        onClick: vi.fn(),
      },
      {
        id: '2',
        label: 'New Document',
        icon: FileText,
        iconVariant: 'primary',
        onClick: vi.fn(),
        shortcut: 'Ctrl+N',
        shortcutKey: 'ctrl+n',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin Actions',
    allowedRoles: ['Administrator'],
    actions: [
      {
        id: '3',
        label: 'New Client',
        icon: UserPlus,
        onClick: vi.fn(),
      },
    ],
  },
];

describe('QuickActions', () => {
  it('renders trigger button with label', () => {
    render(<QuickActions groups={mockGroups} label="Quick Add" />);

    expect(screen.getByLabelText('Quick Add')).toBeInTheDocument();
  });

  it('opens menu when trigger is clicked', () => {
    render(<QuickActions groups={mockGroups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Common Actions')).toBeInTheDocument();
  });

  it('displays action items correctly', () => {
    render(<QuickActions groups={mockGroups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Log Time')).toBeInTheDocument();
    expect(screen.getByText('Log billable time')).toBeInTheDocument();
    expect(screen.getByText('New Document')).toBeInTheDocument();
  });

  it('calls action onClick when clicked', () => {
    const mockOnClick = vi.fn();
    const groups: QuickActionGroup[] = [
      {
        id: 'test',
        actions: [
          {
            id: '1',
            label: 'Test Action',
            icon: Briefcase,
            onClick: mockOnClick,
          },
        ],
      },
    ];

    render(<QuickActions groups={groups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    const action = screen.getByText('Test Action');
    fireEvent.click(action);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('filters actions based on user role', () => {
    render(<QuickActions groups={mockGroups} currentUserRole="Associate" />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Common Actions')).toBeInTheDocument();
    expect(screen.queryByText('Admin Actions')).not.toBeInTheDocument();
  });

  it('shows admin actions for Administrator role', () => {
    render(<QuickActions groups={mockGroups} currentUserRole="Administrator" />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Common Actions')).toBeInTheDocument();
    expect(screen.getByText('Admin Actions')).toBeInTheDocument();
    expect(screen.getByText('New Client')).toBeInTheDocument();
  });

  it('displays keyboard shortcuts', () => {
    render(<QuickActions groups={mockGroups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
  });

  it('closes menu when close button is clicked', () => {
    render(<QuickActions groups={mockGroups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
  });

  it('does not trigger action when disabled', () => {
    const mockOnClick = vi.fn();
    const groups: QuickActionGroup[] = [
      {
        id: 'test',
        actions: [
          {
            id: '1',
            label: 'Disabled Action',
            icon: Briefcase,
            onClick: mockOnClick,
            disabled: true,
          },
        ],
      },
    ];

    render(<QuickActions groups={groups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    const action = screen.getByText('Disabled Action');
    fireEvent.click(action);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('does not open when disabled', () => {
    render(<QuickActions groups={mockGroups} disabled={true} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
  });

  it('renders custom trigger', () => {
    const customTrigger = <button>Custom Trigger</button>;
    render(<QuickActions groups={mockGroups} trigger={customTrigger} />);

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
  });

  it('displays badges on actions', () => {
    const groups: QuickActionGroup[] = [
      {
        id: 'test',
        actions: [
          {
            id: '1',
            label: 'New Feature',
            icon: Briefcase,
            onClick: vi.fn(),
            badge: 'Beta',
          },
        ],
      },
    ];

    render(<QuickActions groups={groups} />);

    const trigger = screen.getByLabelText('Quick Add');
    fireEvent.click(trigger);

    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
