import type { Meta, StoryObj } from '@storybook/react-vite';
import { GovernanceConsole } from '@/routes/admin/components/data/GovernanceConsole';

/**
 * GovernanceConsole provides data governance tools including data classification,
 * retention policies, privacy compliance, and access control management.
 * 
 * ## Features
 * - Data classification
 * - Retention policy management
 * - Privacy compliance (GDPR, CCPA)
 * - Access control policies
 * - Data lineage tracking
 * - Audit logging
 * - Compliance reporting
 * - Risk assessment
 * - Policy enforcement
 * - Data quality rules
 */
const meta = {
  title: 'Pages/Governance Console',
  component: GovernanceConsole,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Data governance with classification, retention policies, and privacy compliance.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof GovernanceConsole>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default governance console view
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
