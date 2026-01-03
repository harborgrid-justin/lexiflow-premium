import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingDashboard } from '@/features/knowledge/practice/MarketingDashboard';
import { ThemeProvider } from '@/providers';
import { ToastProvider } from '@/providers';

/**
 * MarketingDashboard provides firm marketing and business development tools
 * including campaign management, lead tracking, and ROI analytics.
 * 
 * ## Features
 * - Campaign management
 * - Lead tracking
 * - ROI analytics
 * - Content calendar
 * - Social media integration
 * - Email campaigns
 * - Event management
 * - Referral tracking
 * - Performance metrics
 * - Market analysis
 */
const meta = {
  title: 'Pages/Marketing Dashboard',
  component: MarketingDashboard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'blue', value: '#1e40af' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Marketing and business development with campaign management and ROI analytics.',
      },
    },
    test: {
      clearMocks: true,
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
} satisfies Meta<typeof MarketingDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default marketing dashboard view
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
