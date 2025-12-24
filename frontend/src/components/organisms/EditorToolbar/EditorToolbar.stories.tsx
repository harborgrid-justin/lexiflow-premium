import type { Meta, StoryObj } from '@storybook/react';
import { EditorToolbar } from './EditorToolbar';

const meta: Meta<typeof EditorToolbar> = {
  title: 'Organisms/EditorToolbar',
  component: EditorToolbar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EditorToolbar>;

export const Default: Story = {
  args: {},
};
