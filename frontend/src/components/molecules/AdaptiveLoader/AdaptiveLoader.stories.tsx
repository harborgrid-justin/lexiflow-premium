import type { Meta, StoryObj } from '@storybook/react';
import { AdaptiveLoader } from './AdaptiveLoader';

const meta: Meta<typeof AdaptiveLoader> = {
  title: 'Molecules/AdaptiveLoader',
  component: AdaptiveLoader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdaptiveLoader>;

export const Default: Story = {
  args: {},
};
