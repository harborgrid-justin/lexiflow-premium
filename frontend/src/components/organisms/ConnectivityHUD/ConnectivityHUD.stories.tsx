import type { Meta, StoryObj } from '@storybook/react';
import { ConnectivityHUD } from './ConnectivityHUD';

const meta: Meta<typeof ConnectivityHUD> = {
  title: 'Organisms/ConnectivityHUD',
  component: ConnectivityHUD,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConnectivityHUD>;

export const Default: Story = {
  args: {},
};
