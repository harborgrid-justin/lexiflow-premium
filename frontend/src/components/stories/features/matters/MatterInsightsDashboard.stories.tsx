import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider } from '@/providers';

/**
 * MatterInsightsDashboard provides AI-powered case insights including risk
 * analysis, similar case patterns, strategy recommendations, and predictive analytics.
 * 
 * ## Features
 * - AI-powered insights
 * - Risk analysis
 * - Similar case patterns
 * - Strategy recommendations
 * - Outcome predictions
 * - Citation analysis
 * - Judge analytics
 * - Settlement likelihood
 * - Cost projections
 * - Timeline predictions
 */
const meta = {
  title: 'Pages/Matter Insights Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'AI-powered case insights with risk analysis and strategy recommendations.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default matter insights view
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
