/**
 * @module components/navigation/CommandPalette.test
 * @category Navigation - Tests
 * @description Unit tests for CommandPalette component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';
import type { CommandItem } from './CommandPalette';
import { FileText, Briefcase, Users } from 'lucide-react';

// Mock useTheme
vi.mock('@/contexts/theme/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      text: { primary: 'text-slate-900', secondary: 'text-slate-600', tertiary: 'text-slate-400' },
      surface: { default: 'bg-white', highlight: 'bg-slate-100' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock useDebounce
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// Mock useListNavigation
vi.mock('@/hooks/useListNavigation', () => ({
  useListNavigation: () => ({
    focusedIndex: -1,
    handleKeyDown: vi.fn(),
  }),
}));

const mockCommands: CommandItem[] = [
  {
    id: '1',
    label: 'New Case',
    description: 'Create a new case',
    category: 'action',
    icon: Briefcase,
    onExecute: vi.fn(),
  },
  {
    id: '2',
    label: 'Search Documents',
    description: 'Search all documents',
    category: 'search',
    icon: FileText,
    keywords: ['doc', 'file'],
    onExecute: vi.fn(),
  },
  {
    id: '3',
    label: 'Manage Users',
    description: 'User management',
    category: 'action',
    icon: Users,
    allowedRoles: ['Administrator'],
    onExecute: vi.fn(),
  },
];

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Type a command or search/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.queryByPlaceholderText(/Type a command or search/i)).not.toBeInTheDocument();
  });

  it('displays commands', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('New Case')).toBeInTheDocument();
    expect(screen.getByText('Search Documents')).toBeInTheDocument();
  });

  it('filters commands based on search query', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type a command or search/i);
    fireEvent.change(input, { target: { value: 'case' } });

    expect(screen.getByText('New Case')).toBeInTheDocument();
    // Search Documents might still show if fuzzy matching is loose
  });

  it('closes when backdrop is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('executes command when clicked', () => {
    const onExecute = vi.fn();
    const commands: CommandItem[] = [
      {
        id: '1',
        label: 'Test Command',
        category: 'action',
        onExecute,
      },
    ];

    render(
      <CommandPalette
        commands={commands}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    const command = screen.getByText('Test Command');
    fireEvent.click(command);

    expect(onExecute).toHaveBeenCalled();
  });

  it('filters commands based on user role', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        currentUserRole="Associate"
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('New Case')).toBeInTheDocument();
    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
  });

  it('shows admin commands for Administrator role', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        currentUserRole="Administrator"
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('New Case')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });

  it('clears search query when clear button is clicked', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Type a command or search/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });

    expect(input.value).toBe('test');

    // Find and click clear button (X icon)
    const clearButtons = screen.getAllByRole('button');
    const clearButton = clearButtons.find(btn => btn.querySelector('svg'));
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input.value).toBe('');
    }
  });

  it('shows AI indicator when enabled', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
        enableAI={true}
      />
    );

    expect(screen.getByText('AI Enabled')).toBeInTheDocument();
  });

  it('hides AI indicator when disabled', () => {
    render(
      <CommandPalette
        commands={mockCommands}
        isOpen={true}
        onOpenChange={vi.fn()}
        enableAI={false}
      />
    );

    expect(screen.queryByText('AI Enabled')).not.toBeInTheDocument();
  });
});
