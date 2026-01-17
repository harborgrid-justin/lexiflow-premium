import { FileIcon } from './FileIcon';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FileIcon> = {
  title: 'Components/Atoms/FileIcon/FileIcon',
  component: FileIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

export const Default: Story = {
  args: {
  "type": "Sample Text",
  "className": "Sample Text"
},
};
