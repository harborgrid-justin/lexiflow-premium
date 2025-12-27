import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Molecules/Modal/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
  "isOpen": true,
  "onClose": {},
  "title": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "size": {},
  "className": "Sample Text",
  "footer": "<div>Sample Content</div>",
  "closeOnBackdrop": true
},
};
