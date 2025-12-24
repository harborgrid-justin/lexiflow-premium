import type { Meta, StoryObj } from '@storybook/react';
import { Kanban } from './Kanban';

const meta: Meta<typeof Kanban> = {
  title: 'Organisms/Kanban',
  component: Kanban,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Kanban>;

export const Default: Story = {
  args: {},
};
