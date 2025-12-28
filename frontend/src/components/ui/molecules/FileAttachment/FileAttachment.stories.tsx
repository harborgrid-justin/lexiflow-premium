import type { Meta, StoryObj } from '@storybook/react';
import { FileAttachment } from './FileAttachment';

const meta: Meta<typeof FileAttachment> = {
  title: 'Components/Molecules/FileAttachment/FileAttachment',
  component: FileAttachment,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FileAttachment>;

export const Default: Story = {
  args: {
  "name": "Sample Text",
  "size": "Sample Text",
  "type": "Sample Text",
  "date": "Sample Text",
  "onDownload": {},
  "onPreview": {},
  "className": "Sample Text",
  "variant": {}
},
};
