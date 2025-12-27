import type { Meta, StoryObj } from '@storybook/react';
import { SignaturePad } from '@/components';

const meta: Meta<typeof SignaturePad> = {
  title: 'Organisms/SignaturePad',
  component: SignaturePad,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Default: Story = {
  args: {},
};
