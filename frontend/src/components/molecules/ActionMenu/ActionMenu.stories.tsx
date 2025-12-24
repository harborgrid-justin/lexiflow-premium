import type { Meta, StoryObj } from '@storybook/react';
import { ActionMenu } from './ActionMenu';

const meta: Meta<typeof ActionMenu> = {
  title: 'Molecules/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

export const Default: Story = {
  args: {},
};
