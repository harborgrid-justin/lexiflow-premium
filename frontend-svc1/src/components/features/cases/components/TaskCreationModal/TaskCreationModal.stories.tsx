import type { Meta, StoryObj } from '@storybook/react';
import { TaskCreationModal } from './TaskCreationModal';

const meta: Meta<typeof TaskCreationModal> = {
  title: 'Components/Organisms/TaskCreationModal/TaskCreationModal',
  component: TaskCreationModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TaskCreationModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close'),
    initialTitle: 'Sample Task',
    relatedModule: 'cases',
    relatedItemId: '123',
    relatedItemTitle: 'Related Case',
    projects: [
      { id: '1', title: 'Project 1' },
      { id: '2', title: 'Project 2' },
    ],
  },
};
