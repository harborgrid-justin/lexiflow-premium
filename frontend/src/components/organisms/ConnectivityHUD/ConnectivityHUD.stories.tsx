import { ConnectivityHUD } from './ConnectivityHUD';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConnectivityHUD> = {
  title: 'Components/Organisms/ConnectivityHUD/ConnectivityHUD',
  component: ConnectivityHUD,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ConnectivityHUD>;

export const Default: Story = {
  args: {},
};
