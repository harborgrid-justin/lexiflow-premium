import type { Meta, StoryObj } from '@storybook/react';
import { RiskMeter } from './RiskMeter';

const meta: Meta<typeof RiskMeter> = {
  title: 'Components/Organisms/RiskMeter/RiskMeter',
  component: RiskMeter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RiskMeter>;

export const Default: Story = {
  args: {
    value: 42,
    label: 'Sample Text',
    type: 'risk',
  },
};
