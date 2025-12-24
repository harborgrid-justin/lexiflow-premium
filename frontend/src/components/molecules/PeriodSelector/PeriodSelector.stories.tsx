import type { Meta, StoryObj } from '@storybook/react';
import { PeriodSelector } from './PeriodSelector';

const meta: Meta<typeof PeriodSelector> = {
  title: 'Molecules/PeriodSelector',
  component: PeriodSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PeriodSelector>;

export const Default: Story = {
  args: {},
};
