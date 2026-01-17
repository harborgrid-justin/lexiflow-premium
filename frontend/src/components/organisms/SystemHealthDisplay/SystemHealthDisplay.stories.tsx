import { SystemHealthDisplay } from './SystemHealthDisplay';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SystemHealthDisplay> = {
  title: 'Components/Organisms/SystemHealthDisplay/SystemHealthDisplay',
  component: SystemHealthDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SystemHealthDisplay>;

export const Default: Story = {
  args: {
  "isOpen": true,
  "onClose": () => {}
},
};
