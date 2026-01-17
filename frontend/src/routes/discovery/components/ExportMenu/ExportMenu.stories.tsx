import { ExportMenu } from './ExportMenu';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  onExport: () => {}
},
};
