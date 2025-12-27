import type { Meta, StoryObj } from '@storybook/react';
import { ExportMenu } from './ExportMenu';

const meta: Meta<typeof ExportMenu> = {
  title: 'Components/Organisms/ExportMenu/ExportMenu',
  component: ExportMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ExportMenu>;

export const Default: Story = {
  args: {
  "onExport": {}
},
};
