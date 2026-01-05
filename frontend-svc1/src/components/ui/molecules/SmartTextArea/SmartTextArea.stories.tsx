import type { Meta, StoryObj } from '@storybook/react';
import { SmartTextArea } from './SmartTextArea';

const meta: Meta<typeof SmartTextArea> = {
  title: 'Components/Molecules/SmartTextArea/SmartTextArea',
  component: SmartTextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SmartTextArea>;

export const Default: Story = {
  args: {},
};
