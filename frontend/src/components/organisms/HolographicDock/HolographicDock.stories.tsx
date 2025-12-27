import type { Meta, StoryObj } from '@storybook/react';
import { HolographicDock } from './HolographicDock';

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
