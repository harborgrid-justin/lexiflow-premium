import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabbedPageLayout, TabConfigItem } from '../components/layout/TabbedPageLayout';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState } from 'react';
import { 
  UserCircle, 
  Shield, 
  Settings, 
  Sliders, 
  Activity,
  FolderOpen,
  FileText,
  Users,
  Calendar,
  Scale,
  Search,
  BookOpen,
  Gavel,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  MessageSquare,
  Bell
} from 'lucide-react';

/**
 * TabbedPageLayout provides a two-level tab navigation system used throughout
 * the application for complex feature areas. Parent tabs organize major sections,
 * and sub-tabs provide detailed navigation within each section.
 * 
 * ## Features
 * - Two-level navigation hierarchy
 * - Parent tabs with underline indicator
 * - Sub-tabs as pills/segmented buttons
 * - Icon support at all levels
 * - Responsive layout with mobile support
 * - Automatic active state management
 * - Page header integration
 * - Flexible content area
 */

const meta = {
  title: 'Layout/TabbedPageLayout',
  component: TabbedPageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Two-level tabbed page layout for complex feature areas with parent/sub-tab hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="h-screen bg-slate-100">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TabbedPageLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * User Profile Manager - typical two-level navigation
 */
export const UserProfile: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'general',
        label: 'General',
        icon: UserCircle,
        subTabs: [
          { id: 'overview', label: 'Overview', icon: UserCircle },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
        ],
      },
      {
        id: 'security',
        label: 'Security & Access',
        icon: Shield,
        subTabs: [
          { id: 'access', label: 'Access Matrix', icon: Settings },
          { id: 'security', label: 'Security & Sessions', icon: Shield },
          { id: 'audit', label: 'Audit Log', icon: Activity },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="User Profile"
        pageSubtitle="Manage identity, granular permissions, and workspace preferences."
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content
          </h3>
          <p className="text-slate-600">
            Content for the <strong>{activeTab}</strong> tab would be rendered here.
          </p>
        </div>
      </TabbedPageLayout>
    );
  },
};

/**
 * Case Management Hub with extensive sub-navigation
 */
export const CaseManagement: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'case-info',
        label: 'Case Information',
        icon: FolderOpen,
        subTabs: [
          { id: 'overview', label: 'Overview', icon: FolderOpen },
          { id: 'parties', label: 'Parties & Counsel', icon: Users },
          { id: 'timeline', label: 'Timeline', icon: Clock },
        ],
      },
      {
        id: 'documents',
        label: 'Documents & Pleadings',
        icon: FileText,
        subTabs: [
          { id: 'documents', label: 'All Documents', icon: FileText },
          { id: 'pleadings', label: 'Pleadings', icon: Gavel },
          { id: 'evidence', label: 'Evidence', icon: CheckCircle },
        ],
      },
      {
        id: 'docket',
        label: 'Docket & Calendar',
        icon: Calendar,
        subTabs: [
          { id: 'docket', label: 'Docket Entries', icon: Scale },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'deadlines', label: 'Deadlines', icon: AlertTriangle },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        icon: Settings,
        subTabs: [
          { id: 'billing', label: 'Billing', icon: DollarSign },
          { id: 'communications', label: 'Communications', icon: MessageSquare },
          { id: 'alerts', label: 'Alerts', icon: Bell },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="Smith v. Johnson Construction"
        pageSubtitle="Civil Litigation • Case No. 2024-CV-12345 • Active"
        pageActions={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add Entry
          </button>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
            </h3>
            <p className="text-slate-600">Main content area</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Related Info</h4>
            <p className="text-sm text-slate-500">Sidebar content</p>
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};

/**
 * Discovery Platform with analysis tools
 */
export const DiscoveryPlatform: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('database');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'discovery',
        label: 'Discovery',
        icon: Search,
        subTabs: [
          { id: 'database', label: 'Database', icon: FolderOpen },
          { id: 'review', label: 'Review Queue', icon: CheckCircle },
          { id: 'production', label: 'Production Sets', icon: FileText },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        subTabs: [
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'patterns', label: 'Patterns', icon: Activity },
          { id: 'timeline', label: 'Timeline Analysis', icon: Clock },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="Discovery Platform"
        pageSubtitle="Document review, analysis, and production management"
        pageActions={
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
              Import
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              New Review Set
            </button>
          </div>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              {activeTab === 'database' && 'Document Database'}
              {activeTab === 'review' && 'Review Queue'}
              {activeTab === 'production' && 'Production Sets'}
              {activeTab === 'overview' && 'Analytics Overview'}
              {activeTab === 'patterns' && 'Pattern Analysis'}
              {activeTab === 'timeline' && 'Timeline Analysis'}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800">{i * 150}</div>
                  <div className="text-sm text-slate-600">Metric {i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};

/**
 * Knowledge Base with research tools
 */
export const KnowledgeBase: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('search');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'research',
        label: 'Research',
        icon: Search,
        subTabs: [
          { id: 'search', label: 'Search', icon: Search },
          { id: 'saved', label: 'Saved Research', icon: BookOpen },
        ],
      },
      {
        id: 'library',
        label: 'Library',
        icon: BookOpen,
        subTabs: [
          { id: 'clauses', label: 'Clauses', icon: FileText },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'precedents', label: 'Precedents', icon: Gavel },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="Knowledge Base"
        pageSubtitle="Legal research, templates, and practice guides"
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
          <p className="text-slate-600 mb-4">
            Content area for {activeTab} functionality
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors">
                <div className="text-sm font-medium text-slate-800">Item {i}</div>
                <div className="text-xs text-slate-500 mt-1">Description</div>
              </div>
            ))}
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};

/**
 * Minimal configuration - single parent with no sub-tabs
 */
export const MinimalConfiguration: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('settings');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'main',
        label: 'Settings',
        icon: Settings,
        subTabs: [
          { id: 'settings', label: 'All Settings', icon: Settings },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="Settings"
        pageSubtitle="Configure application preferences"
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Settings Content</h3>
          <p className="text-slate-600">
            Example showing minimal tab configuration with a single parent and sub-tab.
          </p>
        </div>
      </TabbedPageLayout>
    );
  },
};

/**
 * With complex content and multiple sections
 */
export const ComplexContent: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'general',
        label: 'General',
        icon: UserCircle,
        subTabs: [
          { id: 'overview', label: 'Overview', icon: UserCircle },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
        ],
      },
      {
        id: 'security',
        label: 'Security & Access',
        icon: Shield,
        subTabs: [
          { id: 'access', label: 'Access Matrix', icon: Settings },
          { id: 'security', label: 'Security', icon: Shield },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="Complex Layout Example"
        pageSubtitle="Demonstrating rich content within tabbed layout"
        pageActions={
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">
              Cancel
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Save Changes
            </button>
          </div>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Primary Section</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium text-slate-700">Setting 1</span>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium text-slate-700">Setting 2</span>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Items</span>
                  <span className="font-semibold text-slate-800">42</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Active</span>
                  <span className="font-semibold text-slate-800">38</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h4>
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};
