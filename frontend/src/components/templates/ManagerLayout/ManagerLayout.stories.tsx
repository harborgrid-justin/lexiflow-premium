import type { Meta, StoryObj } from '@storybook/react';
import { ManagerLayout } from './ManagerLayout';

const meta: Meta<typeof ManagerLayout> = {
  title: 'Templates/ManagerLayout',
  component: ManagerLayout,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ManagerLayout>;

export const Default: Story = {
  args: {},
};
