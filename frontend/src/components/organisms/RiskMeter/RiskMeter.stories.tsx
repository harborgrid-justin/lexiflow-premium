import type { Meta, StoryObj } from '@storybook/react';
import { RiskMeter } from './RiskMeter';

const meta: Meta<typeof RiskMeter> = {
  title: 'Organisms/RiskMeter',
  component: RiskMeter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RiskMeter>;

export const Default: Story = {
  args: {},
};
