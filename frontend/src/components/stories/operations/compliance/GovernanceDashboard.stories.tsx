import type { Meta, StoryObj } from '@storybook/react-vite';
import { GovernanceDashboard } from '@features/admin/components/data/governance/GovernanceDashboard.tsx';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

/**
 * GovernanceDashboard provides comprehensive data governance oversight with
 * metrics, compliance status, and policy enforcement monitoring.
 * 
 * ## Features
 * - Governance metrics
 * - Compliance status
 * - Policy enforcement
 * - Risk dashboard
 * - Audit overview
 * - Data quality metrics
 * - Access analytics
 * - Violation tracking
 * - Remediation tracking
 * - Executive reporting
 */
const meta = {
  title: 'Pages/Governance Dashboard',
  component: GovernanceDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Data governance oversight with compliance metrics and policy enforcement.',
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
} satisfies Meta<typeof GovernanceDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockRules = [
  { id: '1', name: 'PII Protection', status: 'Active', impact: 'High' },
  { id: '2', name: 'Data Retention', status: 'Active', impact: 'Medium' },
  { id: '3', name: 'Access Control', status: 'Active', impact: 'High' },
];

const mockHandleScan = () => {
  console.log('Scan initiated');
};

const mockSetEditingRule = (rule: { id: string; name: string; status: string; impact: string }) => {
  console.log('Editing rule:', rule);
};

/**
 * Default governance dashboard view
 */
export const Default: Story = {
  args: {
    rules: mockRules,
    isScanning: false,
    scanProgress: 0,
    handleScan: mockHandleScan,
    setEditingRule: mockSetEditingRule,
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    rules: mockRules,
    isScanning: false,
    scanProgress: 0,
    handleScan: mockHandleScan,
    setEditingRule: mockSetEditingRule,
  },
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
  args: {
    rules: mockRules,
    isScanning: false,
    scanProgress: 0,
    handleScan: mockHandleScan,
    setEditingRule: mockSetEditingRule,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
