import type { Meta, StoryObj } from '@storybook/react';
import { ChartHelpers } from './ChartHelpers';

const meta: Meta<typeof ChartHelpers> = {
  title: 'Components/Organisms/ChartHelpers/ChartHelpers',
  component: ChartHelpers,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChartHelpers>;

export const Default: Story = {
  args: {},
};
