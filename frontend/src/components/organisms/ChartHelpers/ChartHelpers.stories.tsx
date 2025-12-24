import type { Meta, StoryObj } from '@storybook/react';
import { ChartHelpers } from './ChartHelpers';

const meta: Meta<typeof ChartHelpers> = {
  title: 'Organisms/ChartHelpers',
  component: ChartHelpers,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChartHelpers>;

export const Default: Story = {
  args: {},
};
