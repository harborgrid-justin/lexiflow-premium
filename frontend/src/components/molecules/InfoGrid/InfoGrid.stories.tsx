import type { Meta, StoryObj } from '@storybook/react';
import { InfoGrid } from './InfoGrid';

const meta: Meta<typeof InfoGrid> = {
  title: 'Molecules/InfoGrid',
  component: InfoGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfoGrid>;

export const Default: Story = {
  args: {},
};
