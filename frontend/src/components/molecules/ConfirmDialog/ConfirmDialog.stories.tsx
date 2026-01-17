import { ConfirmDialog } from './ConfirmDialog';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/Molecules/ConfirmDialog/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
  "isOpen": true,
  onClose: () => {},
  onConfirm: () => {},
  "title": "Sample Text",
  "message": "Sample Text",
  "confirmText": "Sample Text",
  "cancelText": "Sample Text",
  variant: undefined
},
};
