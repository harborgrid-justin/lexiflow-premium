import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Molecules/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {},
};
