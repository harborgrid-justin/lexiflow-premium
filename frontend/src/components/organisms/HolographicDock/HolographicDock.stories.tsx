import { HolographicDock } from './HolographicDock';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof HolographicDock> = {
  title: 'Components/Organisms/HolographicDock/HolographicDock',
  component: HolographicDock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HolographicDock>;

export const Default: Story = {
  args: {},
};
