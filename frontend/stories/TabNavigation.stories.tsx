import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabNavigation } from '../components/common/TabNavigation';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  FolderOpen,
  Clock,
  MessageSquare 
} from 'lucide-react';

/**
 * TabNavigation provides a single-level tab interface with optional icons.
 * This component is used throughout the application for basic tab navigation.
 * 
 * ## Features
 * - Icon support with Lucide icons
 * - Active state management
 * - Overflow scroll for many tabs
 * - Keyboard navigation (future enhancement)
 * - Theme-aware styling
 */

const meta = {
  title: 'Common/TabNavigation',
  component: TabNavigation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Single-level tab navigation component with icon support and active state.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="min-h-[300px] bg-slate-50 p-6">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TabNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic tab navigation without icons
 */
export const Basic: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');
    return (
      <TabNavigation
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'details', label: 'Details' },
          { id: 'activity', label: 'Activity' },
          { id: 'settings', label: 'Settings' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  },
};

/**
 * Tabs with icons for better visual hierarchy
 */
export const WithIcons: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('documents');
    return (
      <TabNavigation
        tabs={[
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  },
};

/**
 * Many tabs demonstrating horizontal scroll behavior
 */
export const ManyTabs: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');
    return (
      <div className="max-w-2xl">
        <TabNavigation
          tabs={[
            { id: 'overview', label: 'Overview', icon: FolderOpen },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p className="text-slate-600">Active tab: <strong>{activeTab}</strong></p>
          <p className="text-sm text-slate-500 mt-2">Scroll horizontally to see all tabs</p>
        </div>
      </div>
    );
  },
};

/**
 * Case Management example showing typical usage
 */
export const CaseManagementExample: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('docket');
    return (
      <div>
        <TabNavigation
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'docket', label: 'Docket' },
            { id: 'documents', label: 'Documents' },
            { id: 'parties', label: 'Parties & Counsel' },
            { id: 'discovery', label: 'Discovery' },
            { id: 'pleadings', label: 'Pleadings' },
            { id: 'evidence', label: 'Evidence' },
            { id: 'billing', label: 'Billing' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="mt-4 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content
          </h3>
          <p className="text-slate-600">
            Content for the {activeTab} tab would appear here.
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Custom className styling demonstration
 */
export const CustomStyling: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('inbox');
    return (
      <TabNavigation
        tabs={[
          { id: 'inbox', label: 'Inbox', icon: MessageSquare },
          { id: 'sent', label: 'Sent' },
          { id: 'drafts', label: 'Drafts' },
          { id: 'archived', label: 'Archived' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="bg-white rounded-t-lg"
      />
    );
  },
};
