/**
 * @module components/navigation/MegaMenu.stories
 * @category Navigation - Stories
 * @description Storybook stories for MegaMenu component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MegaMenu } from './MegaMenu';
import {
  Briefcase, FileText, Users, Calendar, Clock,
  FolderOpen, CheckSquare, MessageSquare, Settings,
  Scale, Book, GraduationCap, Shield, TrendingUp
} from 'lucide-react';
import type { MegaMenuSection } from './MegaMenu';

const meta: Meta<typeof MegaMenu> = {
  title: 'Navigation/MegaMenu',
  component: MegaMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Enterprise mega menu with multi-column layouts and role-based visibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    layout: {
      control: 'select',
      options: ['single', 'double', 'triple', 'quad'],
    },
    showFeatured: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MegaMenu>;

// Sample data
const caseManagementSections: MegaMenuSection[] = [
  {
    id: 'cases',
    title: 'Case Management',
    icon: Briefcase,
    items: [
      {
        id: '1',
        label: 'Active Cases',
        path: '/cases/active',
        icon: FolderOpen,
        description: 'View and manage all active cases',
        isFeatured: true,
      },
      {
        id: '2',
        label: 'Case Calendar',
        path: '/cases/calendar',
        icon: Calendar,
        description: 'Upcoming deadlines and hearings',
      },
      {
        id: '3',
        label: 'Case Analytics',
        path: '/cases/analytics',
        icon: TrendingUp,
        description: 'Case metrics and insights',
        badge: 'New',
        badgeVariant: 'primary',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: FileText,
    items: [
      {
        id: '4',
        label: 'Document Library',
        path: '/docs',
        icon: Book,
        description: 'Browse all documents',
        isFeatured: true,
      },
      {
        id: '5',
        label: 'Templates',
        path: '/docs/templates',
        icon: FileText,
        description: 'Legal document templates',
      },
      {
        id: '6',
        label: 'Recent Uploads',
        path: '/docs/recent',
        icon: Clock,
        description: 'Recently uploaded documents',
      },
    ],
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    items: [
      {
        id: '7',
        label: 'Team Workspace',
        path: '/team',
        icon: Users,
        description: 'Collaborate with your team',
        isFeatured: true,
      },
      {
        id: '8',
        label: 'Tasks & Workflows',
        path: '/tasks',
        icon: CheckSquare,
        description: 'Manage tasks and workflows',
        badge: 'Beta',
        badgeVariant: 'info',
      },
      {
        id: '9',
        label: 'Messages',
        path: '/messages',
        icon: MessageSquare,
        description: 'Internal communications',
      },
    ],
  },
];

const productsSections: MegaMenuSection[] = [
  {
    id: 'litigation',
    title: 'Litigation Tools',
    icon: Scale,
    items: [
      { id: '1', label: 'Discovery Manager', path: '/discovery', icon: FileText, description: 'Manage discovery requests' },
      { id: '2', label: 'Trial Prep', path: '/trial', icon: CheckSquare, description: 'Trial preparation tools' },
      { id: '3', label: 'Evidence Tracker', path: '/evidence', icon: Shield, description: 'Track evidence and exhibits' },
    ],
  },
  {
    id: 'research',
    title: 'Legal Research',
    icon: Book,
    items: [
      { id: '4', label: 'Case Law Search', path: '/research/cases', icon: Scale, description: 'Search case law database', isFeatured: true },
      { id: '5', label: 'Statute Library', path: '/research/statutes', icon: Book, description: 'Browse statutes and codes' },
      { id: '6', label: 'Legal Briefs', path: '/research/briefs', icon: FileText, description: 'Sample legal briefs' },
    ],
  },
];

const adminSections: MegaMenuSection[] = [
  {
    id: 'settings',
    title: 'System Settings',
    icon: Settings,
    allowedRoles: ['Administrator'],
    items: [
      { id: '1', label: 'User Management', path: '/admin/users', icon: Users, description: 'Manage users and roles' },
      { id: '2', label: 'Security', path: '/admin/security', icon: Shield, description: 'Security settings' },
      { id: '3', label: 'Billing', path: '/admin/billing', icon: TrendingUp, description: 'Billing and subscriptions' },
    ],
  },
  {
    id: 'training',
    title: 'Training & Support',
    items: [
      { id: '4', label: 'Training Center', path: '/training', icon: GraduationCap, description: 'Video tutorials and guides' },
      { id: '5', label: 'Documentation', path: '/docs', icon: Book, description: 'API and user documentation', isExternal: true },
      { id: '6', label: 'Support Portal', path: '/support', icon: MessageSquare, description: 'Contact support team' },
    ],
  },
];

// Stories
export const Default: Story = {
  args: {
    label: 'Products',
    sections: caseManagementSections,
    layout: 'triple',
    showFeatured: true,
  },
};

export const SingleColumn: Story = {
  args: {
    label: 'Quick Links',
    sections: productsSections.slice(0, 1),
    layout: 'single',
    showFeatured: false,
  },
};

export const DoubleColumn: Story = {
  args: {
    label: 'Products',
    sections: productsSections,
    layout: 'double',
    showFeatured: true,
  },
};

export const TripleColumn: Story = {
  args: {
    label: 'Workspace',
    sections: caseManagementSections,
    layout: 'triple',
    showFeatured: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Menu',
    icon: Briefcase,
    sections: caseManagementSections,
    layout: 'triple',
    showFeatured: true,
  },
};

export const NoFeaturedItems: Story = {
  args: {
    label: 'Products',
    sections: caseManagementSections,
    layout: 'triple',
    showFeatured: false,
  },
};

export const RoleBasedFiltering: Story = {
  args: {
    label: 'Admin',
    sections: adminSections,
    currentUserRole: 'Associate',
    layout: 'double',
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin section is hidden for Associate role.',
      },
    },
  },
};

export const AdminView: Story = {
  args: {
    label: 'Admin',
    sections: adminSections,
    currentUserRole: 'Administrator',
    layout: 'double',
  },
  parameters: {
    docs: {
      description: {
        story: 'All sections visible for Administrator role.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Menu',
    sections: caseManagementSections,
    layout: 'triple',
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    label: 'Products',
    sections: caseManagementSections,
    layout: 'triple',
    showFeatured: true,
    onNavigate: (item) => {
      console.log('Navigate to:', item);
      alert(`Navigating to: ${item.label} (${item.path})`);
    },
  },
};
