import type { Meta, StoryObj } from '@storybook/react';
import { helpers } from './helpers';

const meta: Meta<typeof helpers> = {
  title: 'Components/Organisms/search/helpers',
  component: helpers,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof helpers>;

export const Default: Story = {
  args: {},
};
