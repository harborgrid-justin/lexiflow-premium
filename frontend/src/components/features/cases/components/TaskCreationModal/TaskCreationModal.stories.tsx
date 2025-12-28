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
  "isOpen": true,
  "onClose": {},
  "initialTitle": "Sample Text",
  "relatedModule": "Sample Text",
  "relatedItemId": "Sample Text",
  "relatedItemTitle": "Sample Text",
  "projects": "Sample Text"
},
};
