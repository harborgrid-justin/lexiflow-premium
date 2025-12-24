import type { Meta, StoryObj } from '@storybook/react';
import { ActionRow } from './ActionRow';

const meta: Meta<typeof ActionRow> = {
  title: 'Molecules/ActionRow',
  component: ActionRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActionRow>;

export const Default: Story = {
  args: {},
};
