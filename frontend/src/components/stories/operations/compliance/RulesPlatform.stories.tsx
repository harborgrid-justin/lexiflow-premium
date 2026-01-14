import type { Meta, StoryObj } from '@storybook/react-vite';
import { RulesPlatform } from '@/routes/rules/components/RulesPlatform';

/**
 * RulesPlatform provides comprehensive court rules, procedures, and jurisdiction-specific
 * requirements with automated deadline calculation and compliance checking.
 * 
 * ## Features
 * - Federal and state rules database
 * - Court procedures by jurisdiction
 * - Deadline calculators
 * - Filing requirements
 * - Local rules reference
 * - Practice standards
 * - Forms and templates
 * - Rule updates and alerts
 * - Compliance checking
 * - Citation formatting
 */
const meta = {
  title: 'Pages/Rules Platform',
  component: RulesPlatform,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Court rules and procedures platform with automated compliance checking and deadline calculation.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof RulesPlatform>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default rules platform view
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
