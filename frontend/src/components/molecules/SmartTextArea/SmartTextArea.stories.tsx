import { SmartTextArea } from './SmartTextArea';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
