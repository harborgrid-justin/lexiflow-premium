import type { Meta, StoryObj } from '@storybook/react';
import { FileIcon } from './FileIcon';

const meta: Meta<typeof FileIcon> = {
  title: 'Atoms/FileIcon',
  component: FileIcon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

export const Default: Story = {
  args: {},
};
