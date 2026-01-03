import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnalyticsDashboard } from '@/features/admin/components/analytics/AnalyticsDashboard';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

/**
 * AnalyticsDashboard provides comprehensive business intelligence and performance
 * analytics across all firm operations with customizable reports and visualizations.
 * 
 * ## Features
 * - Financial performance metrics
 * - Case outcome analytics
 * - Attorney productivity tracking
 * - Client satisfaction metrics
 * - Billing analytics
 * - Time utilization reports
 * - Revenue forecasting
 * - Practice area analysis
 * - Custom report builder
 * - Data export capabilities
 */
const meta = {
  title: 'Pages/Analytics Dashboard',
  component: AnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'slate', value: '#0f172a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Business intelligence dashboard with comprehensive firm analytics and custom reporting.',
      },
    },
    test: {
      clearMocks: true,
      restoreMocks: true,
    },
  },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof AnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default analytics dashboard view
 */
export const Default: Story = {};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
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
};
