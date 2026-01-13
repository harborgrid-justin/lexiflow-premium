import type { Meta, StoryObj } from '@storybook/react-vite';
import { LitigationBuilder } from '@/features/litigation/strategy/LitigationBuilder';

/**
 * LitigationBuilder provides comprehensive litigation strategy planning tools
 * including case analysis, strategy development, and tactical planning.
 * 
 * ## Features
 * - Case strength analysis
 * - Strategy canvas
 * - Timeline planning
 * - Motion planning
 * - Discovery strategy
 * - Expert witness planning
 * - Budget forecasting
 * - Risk assessment
 * - Settlement analysis
 * - Trial preparation
 */
const meta = {
  title: 'Pages/Litigation Builder',
  component: LitigationBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive litigation strategy planning with case analysis and tactical tools.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof LitigationBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default litigation builder view
 */
export const Default: Story = {
  args: {
    navigateToCaseTab: (caseId: string, tab: string) => {
      console.log(`Navigate to case ${caseId}, tab: ${tab}`);
    },
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    navigateToCaseTab: (caseId: string, tab: string) => {
      console.log(`Navigate to case ${caseId}, tab: ${tab}`);
    },
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
    navigateToCaseTab: (caseId: string, tab: string) => {
      console.log(`Navigate to case ${caseId}, tab: ${tab}`);
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
