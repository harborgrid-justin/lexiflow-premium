import type { Meta, StoryObj } from '@storybook/react';
import { Inputs } from './Inputs';

const meta: Meta<typeof Inputs> = {
  title: 'Components/Organisms/_legacy/Inputs',
  component: Inputs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Inputs>;

export const Default: Story = {
  args: {},
};
