import type { Meta, StoryObj } from '@storybook/react';
import { CentredLoader } from '@/components';

const meta: Meta<typeof CentredLoader> = {
  title: 'Atoms/CentredLoader',
  component: CentredLoader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CentredLoader>;

export const Default: Story = {
  args: {},
};
