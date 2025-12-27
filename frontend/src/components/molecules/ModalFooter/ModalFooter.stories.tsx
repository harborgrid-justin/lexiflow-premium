import type { Meta, StoryObj } from '@storybook/react';
import { ModalFooter } from '@/components';

const meta: Meta<typeof ModalFooter> = {
  title: 'Molecules/ModalFooter',
  component: ModalFooter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModalFooter>;

export const Default: Story = {
  args: {},
};
