import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeeAgreementManagement } from '../../../../features/operations/billing/fee-agreements/FeeAgreementManagement';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

/**
 * FeeAgreementManagement provides comprehensive fee agreement administration
 * including template management, client agreements, and billing arrangement tracking.
 * 
 * ## Features
 * - Agreement templates
 * - Client fee agreements
 * - Billing arrangement tracking
 * - Fee structure management
 * - Retainer tracking
 * - Contingency agreements
 * - Alternative fee arrangements
 * - Agreement approval workflow
 * - Version control
 * - E-signature integration
 */
const meta = {
  title: 'Pages/Fee Agreement Management',
  component: FeeAgreementManagement,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Fee agreement administration with templates and billing arrangement tracking.',
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
} satisfies Meta<typeof FeeAgreementManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default fee agreement management view
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
