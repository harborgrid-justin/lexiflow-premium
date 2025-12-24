import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketSettings } from '@/features/matters/components/docket/DocketSettings';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from 'react';

/**
 * DocketSettings provides configuration for court integrations and
 * CM/ECF (Case Management/Electronic Case Files) sync settings.
 * 
 * ## Features
 * - PACER integration configuration
 * - State court system connections
 * - Sync schedule settings
 * - API key management
 * - Connection status indicators
 * - Court selection
 * - Auto-sync toggles
 */
const meta = {
  title: 'Docket/DocketSettings',
  component: DocketSettings,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Court integration settings for CM/ECF sync with PACER and state courts.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof DocketSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default settings view
 */
export const Default: Story = {};

/**
 * Settings in light theme
 */
export const LightTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl bg-white p-4 rounded">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Settings in dark theme
 */
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl bg-slate-900 p-4 rounded">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-sm">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-3xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
