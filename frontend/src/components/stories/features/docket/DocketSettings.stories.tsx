import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketSettings } from '@/features/cases/components/docket/DocketSettings';

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
  tags: ['autodocs']
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
};

/**
 * Settings in dark theme
 */
export const DarkTheme: Story = {
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  }
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  }
};
