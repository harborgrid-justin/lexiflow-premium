import type { Meta, StoryObj } from '@storybook/react';
import { TaskCreationModal } from '@/components';

const meta: Meta<typeof TaskCreationModal> = {
  title: 'Organisms/TaskCreationModal',
  component: TaskCreationModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskCreationModal>;

export const Default: Story = {
  args: {},
};
