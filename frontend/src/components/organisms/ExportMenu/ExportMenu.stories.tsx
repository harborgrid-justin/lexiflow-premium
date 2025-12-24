import type { Meta, StoryObj } from '@storybook/react';
import { ExportMenu } from './ExportMenu';

const meta: Meta<typeof ExportMenu> = {
  title: 'Organisms/ExportMenu',
  component: ExportMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExportMenu>;

export const Default: Story = {
  args: {},
};
