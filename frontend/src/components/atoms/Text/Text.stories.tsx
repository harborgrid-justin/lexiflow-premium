import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Text> = {
  title: 'Components/Atoms/Text/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {},
};
