import type { Meta, StoryObj } from '@storybook/react';
import { UserSelect } from './UserSelect';

const meta: Meta<typeof UserSelect> = {
  title: 'Molecules/UserSelect',
  component: UserSelect,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserSelect>;

export const Default: Story = {
  args: {},
};
