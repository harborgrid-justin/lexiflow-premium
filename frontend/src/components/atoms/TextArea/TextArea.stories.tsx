import { TextArea } from './TextArea';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TextArea> = {
  title: 'Components/Atoms/TextArea/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {},
};
