import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Atoms/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: {},
};
