import type { Meta, StoryObj } from '@storybook/react';
import { FileAttachment } from './FileAttachment';

const meta: Meta<typeof FileAttachment> = {
  title: 'Molecules/FileAttachment',
  component: FileAttachment,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileAttachment>;

export const Default: Story = {
  args: {},
};
