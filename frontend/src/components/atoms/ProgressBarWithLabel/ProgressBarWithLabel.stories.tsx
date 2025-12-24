import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBarWithLabel } from './ProgressBarWithLabel';

const meta: Meta<typeof ProgressBarWithLabel> = {
  title: 'Atoms/ProgressBarWithLabel',
  component: ProgressBarWithLabel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressBarWithLabel>;

export const Default: Story = {
  args: {},
};
