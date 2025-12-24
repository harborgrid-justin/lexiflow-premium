import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCoverageIndicator } from './ServiceCoverageIndicator';

const meta: Meta<typeof ServiceCoverageIndicator> = {
  title: 'Organisms/ServiceCoverageIndicator',
  component: ServiceCoverageIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ServiceCoverageIndicator>;

export const Default: Story = {
  args: {},
};
