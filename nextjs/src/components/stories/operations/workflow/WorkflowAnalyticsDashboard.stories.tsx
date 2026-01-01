import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowAnalyticsDashboard } from '@features/cases';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

/**
 * WorkflowAnalyticsDashboard provides workflow performance analytics including
 * bottleneck analysis, completion rates, and process optimization insights.
 * 
 * ## Features
 * - Workflow performance metrics
 * - Bottleneck analysis
 * - Completion rates
 * - Cycle time tracking
 * - Task efficiency
 * - Resource utilization
 * - SLA compliance
 * - Process optimization
 * - Exception tracking
 * - Trend analysis
 */
const meta = {
  title: 'Pages/Workflow Analytics Dashboard',
  component: WorkflowAnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Workflow performance analytics with bottleneck analysis and optimization insights.',
      },
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
} satisfies Meta<typeof WorkflowAnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default workflow analytics view
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
