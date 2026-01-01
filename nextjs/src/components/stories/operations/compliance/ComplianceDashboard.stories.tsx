import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComplianceDashboard } from '@/features/operations/compliance/ComplianceDashboard';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

/**
 * ComplianceDashboard provides comprehensive compliance monitoring, trust accounting,
 * ethics tracking, and regulatory reporting for law firm operations.
 * 
 * ## Features
 * - Trust account monitoring
 * - Ethics compliance tracking
 * - Conflict checking system
 * - Regulatory reporting
 * - Audit trail management
 * - Certificate tracking
 * - CLE compliance
 * - Bar admission status
 * - Insurance verification
 * - Compliance alerts
 */
const meta = {
  title: 'Pages/Compliance Dashboard',
  component: ComplianceDashboard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'slate', value: '#0f172a' },
        { name: 'blue', value: '#1e40af' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Compliance monitoring and regulatory tracking dashboard for law firm operations.',
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
} satisfies Meta<typeof ComplianceDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default compliance dashboard view
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
