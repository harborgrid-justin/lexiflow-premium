import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@/providers';

/**
 * MatterFinancialsCenter provides comprehensive case-level financial management
 * including billing, expenses, budgets, and financial reporting per matter.
 * 
 * ## Features
 * - Case budgeting
 * - Expense tracking
 * - Time and billing
 * - Invoice generation
 * - Payment tracking
 * - Financial forecasting
 * - Budget vs actual analysis
 * - Client billing approvals
 * - Trust account management
 * - Financial reporting
 */
const meta = {
  title: 'Pages/Matter Financials Center',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Case-level financial management with billing, expenses, and budget tracking.',
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default matter financials view
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
