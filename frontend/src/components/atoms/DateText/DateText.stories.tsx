import type { Meta, StoryObj } from '@storybook/react';
import { DateText } from './DateText';

const meta: Meta<typeof DateText> = {
  title: 'Atoms/DateText',
  component: DateText,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DateText>;

export const Default: Story = {
  args: {},
};
