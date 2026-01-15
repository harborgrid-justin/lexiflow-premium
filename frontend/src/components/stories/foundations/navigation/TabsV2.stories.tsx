import type { Meta } from '@storybook/react-vite';
import { TabsV2, ParentTabItem } from '@/components/molecules/TabsV2/TabsV2';
import React, { useState } from 'react';
import {
  Briefcase, Folder, Activity, Plus, Settings, Clock, DollarSign,
  Users, BarChart3, TrendingUp, Eye, Lightbulb, FileText
} from 'lucide-react';

/**
 * TabsV2 - Two-Level Tab Navigation
 * 
 * Enhanced tab system with parent tabs (underline style) and sub-tabs (pill style).
 * Matches the TabbedPageLayout design pattern.
 * 
 * ## Features
 * - Two-level hierarchy (parent → sub-tabs)
 * - Parent tabs with underline indicator
 * - Sub-tabs with pill/badge style
 * - Icon support at both levels
 * - Keyboard navigation (Arrow keys)
 * - Disabled state support
 * - Badge support on sub-tabs
 * - Responsive overflow handling
 * - Size variants (sm, md, lg)
 * - Theme integration
 */

const meta = {
  title: 'Foundations/Navigation/TabsV2',
  component: TabsV2,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Two-level tab navigation system with parent tabs (underline) and sub-tabs (pill style). Designed for complex navigation hierarchies.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant for tabs',
    },
    compactSubTabs: {
      control: 'boolean',
      description: 'Display sub-tabs without background container',
    },
  },
} satisfies Meta<typeof TabsV2>;

export default meta;

// Mock tab configuration for Matter Management
const matterManagementTabs: ParentTabItem[] = [
  {
    id: 'matters_group',
    label: 'Matters',
    icon: Briefcase,
    subTabs: [
      { id: 'overview', label: 'Overview Dashboard', icon: Eye },
      { id: 'operations', label: 'Operations Center', icon: Activity },
      { id: 'intake', label: 'New Matter Intake', icon: Plus, badge: 3 },
    ],
  },
  {
    id: 'planning_group',
    label: 'Planning',
    icon: Settings,
    subTabs: [
      { id: 'calendar', label: 'Matter Calendar', icon: Clock },
      { id: 'financials', label: 'Financials', icon: DollarSign },
      { id: 'insights', label: 'Insights & Risk', icon: Lightbulb },
    ],
  },
  {
    id: 'analytics_group',
    label: 'Analytics',
    icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  },
];

/**
 * Default two-level tab navigation showing Matter Management structure.
 * Parent tabs use underline style, sub-tabs use pill style.
 */
const DefaultComponent = (args: React.ComponentProps<typeof TabsV2>) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <TabsV2
        {...args}
        tabs={matterManagementTabs}
        activeTabId={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Active Tab: {activeTab}</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Content for the selected tab would render here.
        </p>
      </div>
    </div>
  );
};

export const Default = {
  render: (args: React.ComponentProps<typeof TabsV2>) => <DefaultComponent {...args} />,
};

/**
 * Small size variant with more compact spacing and smaller text.
 */
const SmallSizeComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TabsV2
      tabs={matterManagementTabs}
      activeTabId={activeTab}
      onChange={setActiveTab}
      size="sm"
    />
  );
};

export const SmallSize = {
  render: () => <SmallSizeComponent />,
};

/**
 * Large size variant with more prominent spacing and larger text.
 */
const LargeSizeComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TabsV2
      tabs={matterManagementTabs}
      activeTabId={activeTab}
      onChange={setActiveTab}
      size="lg"
    />
  );
};

export const LargeSize = {
  render: () => <LargeSizeComponent />,
};

/**
 * Compact mode without the background container on sub-tabs.
 * Useful for tighter layouts.
 */
const CompactSubTabsComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TabsV2
      tabs={matterManagementTabs}
      activeTabId={activeTab}
      onChange={setActiveTab}
      compactSubTabs
    />
  );
};

export const CompactSubTabs = {
  render: () => <CompactSubTabsComponent />,
};

/**
 * Demonstrates disabled parent tabs and sub-tabs.
 */
const WithDisabledTabsComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabsWithDisabled: ParentTabItem[] = [
    {
      id: 'matters_group',
      label: 'Matters',
      icon: Briefcase,
      subTabs: [
        { id: 'overview', label: 'Overview Dashboard', icon: Eye },
        { id: 'operations', label: 'Operations Center', icon: Activity, disabled: true },
        { id: 'intake', label: 'New Matter Intake', icon: Plus },
      ],
    },
    {
      id: 'planning_group',
      label: 'Planning',
      icon: Settings,
      disabled: true,
      subTabs: [
        { id: 'calendar', label: 'Matter Calendar', icon: Clock },
        { id: 'financials', label: 'Financials', icon: DollarSign },
      ],
    },
    {
      id: 'analytics_group',
      label: 'Analytics',
      icon: BarChart3,
      subTabs: [
        { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
      ],
    },
  ];

  return (
    <TabsV2
      tabs={tabsWithDisabled}
      activeTabId={activeTab}
      onChange={setActiveTab}
    />
  );
};

export const WithDisabledTabs = {
  render: () => <WithDisabledTabsComponent />,
};

/**
 * Shows badge support on sub-tabs for notifications or counts.
 */
const WithBadgesComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabsWithBadges: ParentTabItem[] = [
    {
      id: 'matters_group',
      label: 'Matters',
      icon: Briefcase,
      subTabs: [
        { id: 'overview', label: 'Overview Dashboard', icon: Eye },
        { id: 'operations', label: 'Operations Center', icon: Activity, badge: 12 },
        { id: 'intake', label: 'New Matter Intake', icon: Plus, badge: '3 New' },
      ],
    },
    {
      id: 'planning_group',
      label: 'Planning',
      icon: Settings,
      subTabs: [
        { id: 'calendar', label: 'Matter Calendar', icon: Clock, badge: 7 },
        { id: 'financials', label: 'Financials', icon: DollarSign },
      ],
    },
  ];

  return (
    <TabsV2
      tabs={tabsWithBadges}
      activeTabId={activeTab}
      onChange={setActiveTab}
    />
  );
};

export const WithBadges = {
  render: () => <WithBadgesComponent />,
};

/**
 * Mobile-friendly responsive view with overflow scrolling.
 */
const ResponsiveViewComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-md">
      <TabsV2
        tabs={matterManagementTabs}
        activeTabId={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
};

export const ResponsiveView = {
  render: () => <ResponsiveViewComponent />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Dark mode variant.
 */
const DarkModeComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-slate-900 p-6 rounded-lg">
      <TabsV2
        tabs={matterManagementTabs}
        activeTabId={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
};

export const DarkMode = {
  render: () => <DarkModeComponent />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Minimal tab structure with single parent.
 */
const SimpleStructureComponent = () => {
  const [activeTab, setActiveTab] = useState('all');

  const simpleTabs: ParentTabItem[] = [
    {
      id: 'documents_group',
      label: 'Documents',
      icon: FileText,
      subTabs: [
        { id: 'all', label: 'All Documents', icon: Folder },
        { id: 'recent', label: 'Recent', icon: Clock },
        { id: 'shared', label: 'Shared', icon: Users },
      ],
    },
  ];

  return (
    <TabsV2
      tabs={simpleTabs}
      activeTabId={activeTab}
      onChange={setActiveTab}
    />
  );
};

export const SimpleStructure = {
  render: () => <SimpleStructureComponent />,
};

/**
 * Complex hierarchy with many sub-tabs demonstrating overflow scrolling.
 */
const ManySubTabsComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const complexTabs: ParentTabItem[] = [
    {
      id: 'matters_group',
      label: 'Matters',
      icon: Briefcase,
      subTabs: [
        { id: 'overview', label: 'Overview Dashboard', icon: Eye },
        { id: 'operations', label: 'Operations Center', icon: Activity },
        { id: 'intake', label: 'New Matter Intake', icon: Plus },
        { id: 'archive', label: 'Archive', icon: Folder },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'workflows', label: 'Workflows', icon: Settings },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ];

  return (
    <TabsV2
      tabs={complexTabs}
      activeTabId={activeTab}
      onChange={setActiveTab}
    />
  );
};

export const ManySubTabs = {
  render: () => <ManySubTabsComponent />,
};