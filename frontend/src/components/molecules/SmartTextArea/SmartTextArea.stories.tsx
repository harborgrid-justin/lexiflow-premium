import type { Meta, StoryObj } from '@storybook/react';
import { SmartTextArea } from './SmartTextArea';

const meta: Meta<typeof SmartTextArea> = {
  title: 'Molecules/SmartTextArea',
  component: SmartTextArea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SmartTextArea>;

export const Default: Story = {
  args: {},
};
