import { DocketAnalytics } from '@/routes/cases/components/docket/DocketAnalytics';

import type { Meta, StoryObj } from '@storybook/react-vite';


/**
 * DocketAnalytics provides an analytics dashboard displaying filing trends,
 * document type breakdowns, and judge ruling patterns.
 * 
 * ## Features
 * - Filing activity over time (bar chart)
 * - Document type distribution (pie chart)
 * - Judge ruling analysis
 * - Monthly/quarterly trends
 * - Interactive charts
 * - Data-driven insights
 * - Export capabilities
 */
const meta = {
  title: 'Docket/DocketAnalytics',
  component: DocketAnalytics,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Analytics dashboard with filing trends and document breakdowns using data visualization.',
      },
    },
  },
  tags: ['autodocs']
} satisfies Meta<typeof DocketAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default analytics dashboard view
 */
export const Default: Story = {};

/**
 * Analytics in light theme
 */
export const LightTheme: Story = {
};

/**
 * Analytics in dark theme
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

/**
 * Wide desktop view showing all charts
 */
export const WideDesktop: Story = {
};
