import type { Meta, StoryObj } from '@storybook/react';
import { RuleSelector } from './RuleSelector';

const meta: Meta<typeof RuleSelector> = {
  title: 'Molecules/RuleSelector',
  component: RuleSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RuleSelector>;

export const Default: Story = {
  args: {},
};
