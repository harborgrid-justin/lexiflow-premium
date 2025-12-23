import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '../components/common/Tabs';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Settings,
  Layout,
  List,
  Grid
} from 'lucide-react';

/**
 * Tabs component provides flexible tab navigation with multiple visual variants.
 * Supports segmented, underline, and pills styles for different UI contexts.
 * 
 * ## Features
 * - Three visual variants: segmented (default), underline, pills
 * - Icon support
 * - Keyboard navigation (Arrow Left/Right)
 * - String or object-based tab definitions
 * - Theme-aware styling
 * - Accessibility support with ARIA roles
 */

const meta = {
  title: 'Common/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Flexible tabs component with multiple visual variants for different UI contexts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['segmented', 'underline', 'pills'],
      description: 'Visual style variant',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="min-h-[400px] bg-slate-50 p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default segmented style with pill-like buttons
 */
export const Segmented: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');
    return (
      <div>
        <Tabs
          tabs={['overview', 'details', 'activity', 'settings']}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
        <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-md">
          <p className="text-slate-600">Active: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  },
};

/**
 * Underline style with border-bottom indicator
 */
export const Underline: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('documents');
    return (
      <div className="w-full max-w-2xl">
        <Tabs
          tabs={[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
          <p className="text-slate-600">Tab content goes here</p>
        </div>
      </div>
    );
  },
};

/**
 * Segmented variant with icons
 */
export const SegmentedWithIcons: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('list');
    return (
      <div>
        <Tabs
          tabs={[
            { id: 'list', label: 'List', icon: List },
            { id: 'grid', label: 'Grid', icon: Grid },
            { id: 'board', label: 'Board', icon: Layout },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
        <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-md">
          <p className="text-slate-600">View mode: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  },
};

/**
 * String-based tabs (auto-formatted labels)
 */
export const StringTabs: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('caseInformation');
    return (
      <div>
        <Tabs
          tabs={['caseInformation', 'timelineEvents', 'relatedDocuments', 'billingRecords']}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
        <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-lg">
          <p className="text-sm text-slate-500">
            String-based tabs automatically format camelCase to readable labels
          </p>
          <p className="mt-2 text-slate-600">Active: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  },
};

/**
 * Two tabs (common toggle pattern)
 */
export const Toggle: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('preview');
    return (
      <div>
        <Tabs
          tabs={[
            { id: 'preview', label: 'Preview' },
            { id: 'code', label: 'Code' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
        <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-md font-mono text-sm">
          {activeTab === 'preview' ? (
            <div className="text-slate-800">
              <h4 className="font-bold mb-2">Preview Mode</h4>
              <p>Visual representation of content</p>
            </div>
          ) : (
            <div className="text-slate-600">
              <code>{`<div>Code view content</div>`}</code>
            </div>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Discovery Platform view switcher example
 */
export const DiscoveryViewSwitcher: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('database');
    return (
      <div>
        <Tabs
          tabs={[
            { id: 'database', label: 'Database' },
            { id: 'review', label: 'Review Queue' },
            { id: 'production', label: 'Production Sets' },
            { id: 'analytics', label: 'Analytics' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
        <div className="mt-6 p-6 bg-white rounded-lg shadow max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {activeTab === 'database' && 'Document Database'}
            {activeTab === 'review' && 'Review Queue'}
            {activeTab === 'production' && 'Production Sets'}
            {activeTab === 'analytics' && 'Discovery Analytics'}
          </h3>
          <p className="text-slate-600">
            Content for {activeTab} view
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Keyboard navigation demonstration
 */
export const KeyboardNavigation: Story = {
  args: {} as any,
  render: () => {
    const [activeTab, setActiveTab] = useState('home');
    return (
      <div>
        <Tabs
          tabs={['home', 'profile', 'messages', 'settings']}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
        <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-md">
          <p className="text-sm text-slate-600 mb-2">
            <strong>Keyboard shortcuts:</strong>
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">←</kbd> Previous tab</li>
            <li>• <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">→</kbd> Next tab</li>
          </ul>
          <p className="mt-3 text-slate-600">Active: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  },
};

/**
 * All variants comparison
 */
export const AllVariants: Story = {
  args: {} as any,
  render: () => {
    const [segmentedTab, setSegmentedTab] = useState('overview');
    const [underlineTab, setUnderlineTab] = useState('overview');
    
    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Segmented (Default)</h3>
          <Tabs
            tabs={['overview', 'details', 'activity']}
            activeTab={segmentedTab}
            onChange={setSegmentedTab}
            variant="segmented"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Underline</h3>
          <Tabs
            tabs={['overview', 'details', 'activity']}
            activeTab={underlineTab}
            onChange={setUnderlineTab}
            variant="underline"
          />
        </div>
      </div>
    );
  },
};
