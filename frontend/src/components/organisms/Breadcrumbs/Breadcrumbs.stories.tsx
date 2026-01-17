/**
 * @module components/navigation/Breadcrumbs.stories
 * @category Navigation - Stories
 * @description Storybook stories for Breadcrumbs component
 */

import { Folder, FileText, Users, Briefcase, Building } from 'lucide-react';

import { Breadcrumbs } from './Breadcrumbs';

import type { BreadcrumbItem } from './Breadcrumbs';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Enterprise breadcrumb navigation with role-based visibility and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    showHomeIcon: { control: 'boolean' },
    showIcons: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

// Sample breadcrumb items
const basicItems: BreadcrumbItem[] = [
  { id: '1', label: 'Cases', path: '/cases' },
  { id: '2', label: 'Martinez v. State', path: '/cases/123' },
  { id: '3', label: 'Documents', path: '/cases/123/documents' },
];

const itemsWithIcons: BreadcrumbItem[] = [
  { id: '1', label: 'Cases', path: '/cases', icon: Briefcase },
  { id: '2', label: 'Martinez v. State', path: '/cases/123', icon: Folder },
  { id: '3', label: 'Discovery', path: '/cases/123/discovery', icon: FileText },
  { id: '4', label: 'Exhibits', path: '/cases/123/discovery/exhibits', icon: FileText },
];

const longPath: BreadcrumbItem[] = [
  { id: '1', label: 'Organization', path: '/org', icon: Building },
  { id: '2', label: 'Departments', path: '/org/departments', icon: Briefcase },
  { id: '3', label: 'Legal Team', path: '/org/departments/legal', icon: Users },
  { id: '4', label: 'Cases', path: '/org/departments/legal/cases', icon: Folder },
  { id: '5', label: 'Active Cases', path: '/org/departments/legal/cases/active', icon: Folder },
  { id: '6', label: 'Martinez v. State', path: '/org/departments/legal/cases/active/123', icon: Folder },
  { id: '7', label: 'Documents', path: '/org/departments/legal/cases/active/123/docs', icon: FileText },
];

const roleBasedItems: BreadcrumbItem[] = [
  { id: '1', label: 'Dashboard', path: '/dashboard' },
  { id: '2', label: 'Cases', path: '/cases' },
  { id: '3', label: 'Admin Panel', path: '/admin', allowedRoles: ['Administrator', 'Senior Partner'] },
  { id: '4', label: 'User Settings', path: '/admin/users' },
];

// Stories
export const Default: Story = {
  args: {
    items: basicItems,
    showHomeIcon: true,
    showIcons: true,
  },
};

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
    showHomeIcon: true,
    showIcons: true,
  },
};

export const WithoutHomeIcon: Story = {
  args: {
    items: basicItems,
    showHomeIcon: false,
    showIcons: true,
  },
};

export const WithoutIcons: Story = {
  args: {
    items: itemsWithIcons,
    showHomeIcon: true,
    showIcons: false,
  },
};

export const LongPathCollapsed: Story = {
  args: {
    items: longPath,
    showHomeIcon: true,
    showIcons: true,
    maxItems: 3,
  },
};

export const RoleBasedFiltering: Story = {
  args: {
    items: roleBasedItems,
    currentUserRole: 'Associate',
    showHomeIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin Panel breadcrumb is hidden for Associate role.',
      },
    },
  },
};

export const AdminView: Story = {
  args: {
    items: roleBasedItems,
    currentUserRole: 'Administrator',
    showHomeIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All breadcrumbs visible for Administrator role.',
      },
    },
  },
};

export const CustomSeparator: Story = {
  args: {
    items: basicItems,
    showHomeIcon: true,
    separator: <span className="mx-2 text-gray-400">→</span>,
  },
};

export const Interactive: Story = {
  args: {
    items: itemsWithIcons,
    showHomeIcon: true,
    showIcons: true,
    onNavigate: (item) => {
      console.log('Navigating to:', item);
      alert(`Navigating to: ${item.label} (${item.path})`);
    },
  },
};
