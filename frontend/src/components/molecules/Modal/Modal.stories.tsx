import { Modal } from './Modal';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  onClose: () => {},
  title: undefined,
  children: undefined,
  size: undefined,
  "className": "Sample Text",
  footer: undefined,
  "closeOnBackdrop": true
},
};
