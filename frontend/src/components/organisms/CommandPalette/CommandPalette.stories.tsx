/**
 * @module components/navigation/CommandPalette.stories
 * @category Navigation - Stories
 * @description Storybook stories for CommandPalette component
 */

import {
  Briefcase, Users, Calendar, Clock,
  Settings, Search, Home, FolderOpen
} from 'lucide-react';
import { useState } from 'react';

import { CommandPalette } from './CommandPalette';

import type { CommandItem } from './CommandPalette';
import type { UserRole } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CommandPalette> = {
  title: 'Navigation/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Enhanced command palette with Cmd+K keyboard shortcut, fuzzy search, and AI-powered suggestions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    enableAI: { control: 'boolean' },
    maxRecentCommands: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// Sample commands
const sampleCommands: CommandItem[] = [
  // Navigation
  {
    id: 'nav-home',
    label: 'Go to Dashboard',
    description: 'Navigate to main dashboard',
    category: 'navigation',
    icon: Home,
    shortcut: 'Ctrl+H',
    onExecute: () => console.log('Navigate to Dashboard'),
  },
  {
    id: 'nav-cases',
    label: 'Go to Cases',
    description: 'View all cases',
    category: 'navigation',
    icon: Briefcase,
    keywords: ['case', 'matter'],
    onExecute: () => console.log('Navigate to Cases'),
  },
  {
    id: 'nav-documents',
    label: 'Go to Documents',
    description: 'Browse document library',
    category: 'navigation',
    icon: FolderOpen,
    keywords: ['doc', 'file'],
    onExecute: () => console.log('Navigate to Documents'),
  },

  // Actions
  {
    id: 'action-new-case',
    label: 'New Case',
    description: 'Create a new case',
    category: 'action',
    icon: Briefcase,
    shortcut: 'Ctrl+N',
    badge: 'New',
    onExecute: () => console.log('New Case'),
  },
  {
    id: 'action-log-time',
    label: 'Log Time',
    description: 'Log billable time',
    category: 'action',
    icon: Clock,
    shortcut: 'Ctrl+T',
    onExecute: () => console.log('Log Time'),
  },
  {
    id: 'action-schedule',
    label: 'Schedule Meeting',
    description: 'Schedule a team meeting',
    category: 'action',
    icon: Calendar,
    onExecute: () => console.log('Schedule Meeting'),
  },

  // Search
  {
    id: 'search-docs',
    label: 'Search Documents',
    description: 'Search all documents',
    category: 'search',
    icon: Search,
    keywords: ['find', 'lookup'],
    onExecute: () => console.log('Search Documents'),
  },
  {
    id: 'search-clients',
    label: 'Search Clients',
    description: 'Find clients and contacts',
    category: 'search',
    icon: Users,
    onExecute: () => console.log('Search Clients'),
  },

  // Admin
  {
    id: 'admin-users',
    label: 'Manage Users',
    description: 'User management and permissions',
    category: 'action',
    icon: Users,
    allowedRoles: ['Administrator'],
    onExecute: () => console.log('Manage Users'),
  },
  {
    id: 'admin-settings',
    label: 'System Settings',
    description: 'Configure system settings',
    category: 'action',
    icon: Settings,
    allowedRoles: ['Administrator', 'Senior Partner'],
    onExecute: () => console.log('System Settings'),
  },
];

// Interactive wrapper component
interface WrapperProps {
  commands: CommandItem[];
  currentUserRole?: string;
  placeholder?: string;
  maxRecentCommands?: number;
  enableAI?: boolean;
  className?: string;
}

const CommandPaletteWrapper = (args: WrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            Command Palette Demo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 text-sm font-mono">Cmd+K</kbd> or <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 text-sm font-mono">Ctrl+K</kbd> to open the command palette.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Command Palette
          </button>
        </div>
      </div>

      <CommandPalette
        commands={args.commands}
        currentUserRole={args.currentUserRole as UserRole}
        placeholder={args.placeholder}
        maxRecentCommands={args.maxRecentCommands}
        enableAI={args.enableAI}
        className={args.className}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  );
};

// Stories
export const Default: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands,
    enableAI: true,
    maxRecentCommands: 5,
  },
};

export const WithRoleFiltering: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands,
    currentUserRole: 'Associate',
    enableAI: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin commands are hidden for Associate role.',
      },
    },
  },
};

export const AdminView: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands,
    currentUserRole: 'Administrator',
    enableAI: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All commands visible for Administrator role.',
      },
    },
  },
};

export const WithoutAI: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands,
    enableAI: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command palette without AI indicator.',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands,
    placeholder: 'What would you like to do?',
    enableAI: true,
  },
};

export const FewCommands: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: sampleCommands.slice(0, 5),
    enableAI: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command palette with a smaller set of commands.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: (args) => <CommandPaletteWrapper {...args} />,
  args: {
    commands: [],
    enableAI: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command palette with no commands (empty state).',
      },
    },
  },
};
