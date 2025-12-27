import type { Meta, StoryObj } from '@storybook/react';
import { BackendStatusIndicator } from '@/components';

const meta: Meta<typeof BackendStatusIndicator> = {
  title: 'Organisms/BackendStatusIndicator',
  component: BackendStatusIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackendStatusIndicator>;

export const Default: Story = {
  args: {},
};
