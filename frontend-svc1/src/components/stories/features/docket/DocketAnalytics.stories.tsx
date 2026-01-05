import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketAnalytics } from '@/features/cases/components/docket/DocketAnalytics';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';


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
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-7xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
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
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-7xl bg-white p-6 rounded">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Analytics in dark theme
 */
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-7xl bg-slate-900 p-6 rounded">
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

/**
 * Wide desktop view showing all charts
 */
export const WideDesktop: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="w-full min-w-[1400px] p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
