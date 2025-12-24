import type { Meta, StoryObj } from '@storybook/react';
import { Currency } from './Currency';

const meta: Meta<typeof Currency> = {
  title: 'Atoms/Currency',
  component: Currency,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: {},
};
