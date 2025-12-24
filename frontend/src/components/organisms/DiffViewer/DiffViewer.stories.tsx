import type { Meta, StoryObj } from '@storybook/react';
import { DiffViewer } from './DiffViewer';

const meta: Meta<typeof DiffViewer> = {
  title: 'Organisms/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

export const Default: Story = {
  args: {},
};
