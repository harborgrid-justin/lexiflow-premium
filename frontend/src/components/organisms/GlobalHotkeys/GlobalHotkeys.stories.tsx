import type { Meta, StoryObj } from '@storybook/react';
import { GlobalHotkeys } from '@/components';

const meta: Meta<typeof GlobalHotkeys> = {
  title: 'Organisms/GlobalHotkeys',
  component: GlobalHotkeys,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GlobalHotkeys>;

export const Default: Story = {
  args: {},
};
