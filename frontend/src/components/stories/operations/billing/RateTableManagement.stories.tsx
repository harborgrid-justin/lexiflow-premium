import type { Meta, StoryObj } from '@storybook/react-vite';
import { RateTableManagement } from '@features/operations/billing/rate-tables/RateTableManagement';

/**
 * RateTableManagement provides billing rate administration including attorney
 * rates, task-based billing, rate schedules, and client-specific pricing.
 * 
 * ## Features
 * - Rate table management
 * - Attorney rates
 * - Task-based billing rates
 * - Rate schedules
 * - Client-specific pricing
 * - Rate history
 * - Effective date management
 * - Bulk rate updates
 * - Rate comparison
 * - Approval workflow
 */
const meta = {
  title: 'Pages/Rate Table Management',
  component: RateTableManagement,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Billing rate administration with attorney rates and task-based pricing.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof RateTableManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default rate table management view
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
