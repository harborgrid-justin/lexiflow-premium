import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadZone } from '@/components';

const meta: Meta<typeof FileUploadZone> = {
  title: 'Molecules/FileUploadZone',
  component: FileUploadZone,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileUploadZone>;

export const Default: Story = {
  args: {},
};
